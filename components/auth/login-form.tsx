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
import { provinces } from "@/utils/dummyprovince" // pastikan import ini sesuai path kamu
import { profile } from "console"

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
  const { loading, error, user, hydrated } = useAppSelector((state) => state.auth)

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

      if (msg.includes("email_not_confirmed") || msg.includes("not confirmed")) {
        setLocalError("Email belum dikonfirmasi. Silakan cek email kamu untuk aktivasi.")
        setEmailForResend(emailUsed)
      } else {
        setLocalError("Gagal login. Coba lagi.")
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

      setSuccess("Check your email to confirm your account.")
      setEmailForResend(signUpData.email)
    } catch (err: any) {
      setLocalError(err?.message || "Failed to sign up")
    }
  }


  const handleResendEmail = async () => {
    setLocalError(null)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailForResend,
      })

      if (error) {
        setLocalError("Failed to resend confirmation email.")
      } else {
        setSuccess("Confirmation email has been resent. Please check your inbox.")
      }
    } catch (err) {
      setLocalError("Unexpected error occurred.")
    }
  }


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
          <div className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50 text-sm text-blue-700 space-y-3">
            <div className="flex items-start space-x-2">
              <svg
                className="h-5 w-5 mt-1 text-blue-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
              <p>
                Belum menerima email aktivasi? Klik tombol di bawah untuk mengirim ulang email verifikasi ke:{" "}
                <span className="font-medium">{emailForResend}</span>
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleResendEmail}
                className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Kirim Ulang Email
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

            <Button
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
            </Button>
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
                  <Input type="date" max={today} value={signUpData.birthDate} onChange={(e) => setSignUpData({ ...signUpData, birthDate: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label>Role</Label>
                  <select value={signUpData.role} onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })} required className="w-full border rounded px-2 py-2">
                    <option value="">Choose Role</option>
                    <option value="coach">Coach</option>
                    <option value="athlete">Athlete</option>
                    <option value="judge">Judge</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input type="password" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required />
                </div>

                {/* <div className="space-y-1">
                  <Label>Gender</Label>
                  <Input value={signUpData.gender} onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value })} required />
                </div> */}
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <select value={signUpData.gender} onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value })} required className="w-full border rounded px-2 py-2">
                    <option value="">Choose Gender</option>
                    <option value="lakilaki">Laki Laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label>ID Photo (KTP/KK/KIA) </Label>
                  <Input type="file" accept="image/*" onChange={(e) => setSignUpData({ ...signUpData, idPhoto: e.target.files?.[0] || null })} required />
                </div>
                <div className="space-y-1">
                  <Label>Profile Photo</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setSignUpData({ ...signUpData, profilePhoto: e.target.files?.[0] || null })} required />
                </div>
                <div className="space-y-1">
                  <Label>Province</Label>
                  <select value={signUpData.provinceCode} onChange={(e) => setSignUpData({ ...signUpData, provinceCode: e.target.value })} required className="w-full border rounded px-2 py-2">
                    <option value="">Choose Province</option>
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.code}>
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
