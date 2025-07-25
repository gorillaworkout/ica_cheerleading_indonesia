"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  fetchSessionAndProfile,
  signInWithEmailThunk,
  signInWithGoogleThunk,
  signUpWithEmailThunk,
} from "@/features/auth/authSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chrome, AlertCircle, MailCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { profile } from "console"
import { DatePicker } from "../ui/date-picker"

async function generateMemberId(provinceCode: string) {
  const year = new Date().getFullYear().toString().slice(-2)
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  if (error) throw new Error("Failed to generate member ID.")

  const total = (count ?? 0) + 1
  const totalPadded = total.toString().padStart(4, "0")
  return `${provinceCode}${year}${totalPadded}`
}

export function LoginForm() {
  const [lastSignInEmail, setLastSignInEmail] = useState("")
  const dispatch = useAppDispatch()
  // Perbaiki error dengan memberikan tipe pada state.auth
  const { loading, error, user } = useAppSelector((state: any) => state.auth)
  const provinces = useAppSelector((state: any) => state.provinces.provinces)  // Get provinces from Redux

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [emailForResend, setEmailForResend] = useState("")
  const today = new Date().toISOString().split("T")[0]
  const router = useRouter()

  const [signInData, setSignInData] = useState({ email: "", password: "" })

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    displayName: "",
    gender: "",
    birthDate: "",
    phoneNumber: "",
    role: "",
    provinceCode: "",
    idPhoto: null as File | null,
    profilePhoto: null as File | null,
  })


  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [cooldown, setCooldown] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSuccess(null)

    const emailUsed = signInData.email
    localStorage.setItem("lastSignInEmail", emailUsed) // ✅ Simpan di localStorage
    try {
      await dispatch(signInWithEmailThunk(signInData)).unwrap()
      await dispatch(fetchSessionAndProfile()).unwrap()
      router.push("/")
      localStorage.removeItem("lastSignInEmail")
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Unknown error"

      if (msg.includes("email_not_confirmed") || msg.includes("not confirmed") || msg.includes("Email belum dikonfirmasi")) {
        setLocalError("Email belum dikonfirmasi. Silakan cek email Anda untuk aktivasi.")
        setEmailForResend(emailUsed)
        setSuccess(null)
      } else if (msg.includes("Invalid login credentials")) {
        setLocalError("Email atau password salah. Silakan coba lagi.")
      } else {
        setLocalError(msg)
      }
    }
  }



  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!signUpData.provinceCode) {
      setLocalError("Please select a province.")
      return
    }

    try {
      const memberCode = await generateMemberId(signUpData.provinceCode)

      await dispatch(
        signUpWithEmailThunk({
          email: signUpData.email,
          password: signUpData.password,
          display_name: signUpData.displayName,
          member_code: memberCode,
          gender: signUpData.gender,
          birth_date: signUpData.birthDate,
          phone_number: signUpData.phoneNumber,
          role: signUpData.role,
          province_code: signUpData.provinceCode,
          id_photo_file: signUpData.idPhoto!,
          profile_photo_file: signUpData.profilePhoto!,
        })
      ).unwrap()

      setSuccess("Registrasi berhasil! Silakan cek email Anda dan klik link aktivasi untuk mengaktifkan akun.")
      setEmailForResend(signUpData.email)
      setActiveTab("signin") // Switch to login tab
    } catch (err: any) {
      setLocalError(err?.message || "Failed to sign up")
    }
  }


  const handleResendEmail = async () => {
    setLocalError(null)

    try {
      // Debug Supabase configuration
      console.log('🔧 Supabase config check:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        emailToResend: emailForResend
      })
      
      console.log('🔄 Attempting to resend verification email to:', emailForResend)
      
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailForResend,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      console.log('📧 Resend result:', { error })

      if (error) {
        console.error('❌ Resend email error:', error)
        
        // Try fallback method 1: signup trigger
        console.log('🔄 Trying fallback method 1: signup trigger...')
        try {
          const { error: signupError } = await supabase.auth.signUp({
            email: emailForResend,
            password: 'dummy-password-for-resend', // Won't create account if exists
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          })
          
          if (!signupError || signupError.message?.includes('already registered')) {
            console.log('✅ Fallback method 1 successful')
            setSuccess("Email verifikasi berhasil dikirim ulang.")
            setCooldown(true)
            setRemainingTime(120)
            return
          }
        } catch (fallbackError) {
          console.error('❌ Fallback method 1 failed:', fallbackError)
        }

        // Try fallback method 2: custom API endpoint
        console.log('🔄 Trying fallback method 2: custom API...')
        try {
          const response = await fetch('/api/auth/resend-verification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailForResend })
          })
          
          const result = await response.json()
          
          if (response.ok) {
            console.log('✅ Fallback method 2 successful:', result)
            
            if (result.already_verified) {
              setSuccess("Email sudah terverifikasi. Silakan login langsung.")
            } else {
              setSuccess(`Email verifikasi berhasil dikirim ulang (${result.method}).`)
            }
            
            setCooldown(true)
            setRemainingTime(120)
            return
          } else {
            console.error('❌ Fallback method 2 failed:', result)
          }
        } catch (apiError) {
          console.error('❌ Fallback method 2 failed:', apiError)
        }
        
        // Handle specific error cases
        if (error.message?.includes('API key')) {
          setLocalError("Konfigurasi API tidak valid. Silakan hubungi administrator.")
        } else if (error.message?.includes('rate limit')) {
          setLocalError("Terlalu banyak permintaan. Silakan tunggu beberapa menit sebelum mencoba lagi.")
        } else if (error.message?.includes('not found')) {
          setLocalError("Email tidak ditemukan. Pastikan email yang Anda masukkan benar.")
        } else {
          setLocalError(`Gagal mengirim ulang email verifikasi: ${error.message}`)
        }
      } else {
        console.log('✅ Resend email successful')
        setSuccess("Email verifikasi berhasil dikirim ulang.")
        setCooldown(true)
        setRemainingTime(120) // 2 menit
      }
    } catch (error) {
      console.error('❌ Unexpected error during resend:', error)
      setLocalError("Terjadi kesalahan tak terduga. Silakan coba lagi.")
    }
  }


  useEffect(() => {
    let timer: NodeJS.Timeout

    if (cooldown && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setCooldown(false)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [cooldown, remainingTime])


  useEffect(() => {
    if (error) {
      const storedEmail = localStorage.getItem("lastSignInEmail") || ""
      if (
        error.toLowerCase().includes("not confirmed") ||
        error.toLowerCase().includes("konfirmasi")
      ) {
        setLocalError("Email belum dikonfirmasi. Silakan cek email kamu untuk aktivasi.")
        setEmailForResend(storedEmail)
      } else {
        setLocalError(error)
      }
    }
  }, [error])

  const [tempBirthDate, setTempBirthDate] = useState<Date | undefined>(
    signUpData.birthDate ? new Date(signUpData.birthDate) : undefined
  )
  return (
    <Card className={`w-full transition-all duration-300 ${activeTab === "signup" ? "max-w-3xl" : "max-w-lg"}`}>
      <CardHeader>
        <CardTitle className="text-center">Sign In to ICA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {localError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{localError}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default">
            <MailCheck className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {emailForResend && (
          <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl shadow-sm">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0">
                <MailCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-2">Email Belum Diverifikasi</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  Silakan cek email Anda dan klik link aktivasi untuk mengaktifkan akun. Jika belum menerima email, 
                  klik tombol di bawah untuk mengirim ulang ke:
                </p>
                <p className="font-medium text-orange-800 mt-1">{emailForResend}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-xs text-orange-600">
                📧 Cek folder spam/junk jika email tidak ditemukan di inbox
              </div>
              <button
                onClick={handleResendEmail}
                disabled={cooldown}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  cooldown 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {cooldown ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Tunggu {remainingTime}s</span>
                  </>
                ) : (
                  <>
                    <MailCheck className="w-4 h-4" />
                    <span>Kirim Ulang Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={() => setActiveTab("signin")}>Sign In</TabsTrigger>
            <TabsTrigger value="signup" onClick={() => setActiveTab("signup")}>Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input type="email" placeholder="Email" required value={signInData.email} onChange={(e) => setSignInData({ ...signInData, email: e.target.value })} />
              <Input type="password" placeholder="Password" required value={signInData.password} onChange={(e) => setSignInData({ ...signInData, password: e.target.value })} />
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* <Button
              onClick={async () => {
                setLocalError(null)
                try {
                  await dispatch(signInWithGoogleThunk()).unwrap()
                } catch (err: any) {
                  setLocalError(err?.message || "Google sign-in failed")
                }
              }}
              className="w-full mt-4"
              variant="outline"
            >
              <Chrome className="mr-2 h-4 w-4" /> Continue with Google
            </Button> */}
            <p className="text-center text-sm text-gray-500 mt-4">
              <a href="/forgot-password" className="underline text-red-600 hover:text-red-700">
                Forgot your password?
              </a>
            </p>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input value={signUpData.displayName} onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input value={signUpData.phoneNumber} onChange={(e) => setSignUpData({ ...signUpData, phoneNumber: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label>Date of Birth</Label>
                  <DatePicker
                    date={tempBirthDate}
                    onChange={(date) => {
                      setTempBirthDate(date)
                      setSignUpData({ ...signUpData, birthDate: date ? date.toISOString().split("T")[0] : "" })
                    }}
                    disabled={false}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Role</Label>
                  <select value={signUpData.role} onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })} required className="w-full border rounded px-2 py-2">
                    <option value="">Choose Role</option>
                    <option value="coach">Coach</option>
                    <option value="athlete">Athlete</option>
                    {/* <option value="judge">Judge</option> */}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input type="password" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label>Gender</Label>
                  <select value={signUpData.gender} onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value })} required className="w-full border rounded px-2 py-2">
                    <option value="">Choose Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* <div className="space-y-1">
                  <Label>ID Photo (KTP/KK/KIA) </Label>
                  <Input type="file" accept="image/*" onChange={(e) => setSignUpData({ ...signUpData, idPhoto: e.target.files?.[0] || null })} required />
                </div> */}
                <div className="space-y-1">
                  <Label>ID Photo (KTP/KK/KIA) </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          setLocalError("Ukuran gambar maksimal 2MB.")
                          e.target.value = ""; // Reset input file
                          return;
                        }
                        setSignUpData({ ...signUpData, idPhoto: file });
                      } else {
                        setSignUpData({ ...signUpData, idPhoto: null });
                      }
                    }}
                    required
                  />
                </div>
                {/* <div className="space-y-1">
                  <Label>Profile Photo</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setSignUpData({ ...signUpData, profilePhoto: e.target.files?.[0] || null })} required />
                </div> */}
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          setLocalError("Ukuran gambar maksimal 2MB.")
                          e.target.value = ""; // Reset input file
                          return;
                        }
                        setSignUpData({ ...signUpData, profilePhoto: file });
                      } else {
                        setSignUpData({ ...signUpData, profilePhoto: null });
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Province</Label>
                  <select
                    value={signUpData.provinceCode}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, provinceCode: e.target.value })
                    }
                    required
                    className="w-full border rounded px-2 py-2"
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((prov: { id_province: string; name: string }) => (
                      <option key={prov.id_province} value={prov.id_province}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-span-2">
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">{loading ? "Creating..." : "Create Account"}</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
