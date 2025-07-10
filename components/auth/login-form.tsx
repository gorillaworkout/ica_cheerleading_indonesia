"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Chrome, AlertCircle, Loader2, MailCheck, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Label } from "@/components/ui/label"

function generateMemberId() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000)
  return `ICA-${randomNumber}`
}

export function LoginForm() {
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [emailForResend, setEmailForResend] = useState("")

  const [signInData, setSignInData] = useState({ email: "", password: "" })

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    gender: "",
    birthDate: "",
    phoneNumber: "",
    role: "",
    idPhoto: null as File | null,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const today = new Date()
  today.setFullYear(today.getFullYear() - 7)
  const maxBirthDate = today.toISOString().split("T")[0]

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, isSigningIn, loading } = useAuth()

  // Validasi phone number Indonesia
  const validateIndonesianPhoneNumber = (phone: string) => /^0\d{8,11}$/.test(phone)

  // Validasi email sederhana
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Validasi semua field sudah terisi dan valid
  const isSignUpValid = () => {
    const {
      email,
      password,
      confirmPassword,
      displayName,
      gender,
      birthDate,
      phoneNumber,
      role,
      idPhoto,
    } = signUpData

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !displayName ||
      !gender ||
      !birthDate ||
      !phoneNumber ||
      !role ||
      !idPhoto
    )
      return false

    if (!validateEmail(email)) return false
    if (password.length < 6) return false
    if (password !== confirmPassword) return false
    if (!validateIndonesianPhoneNumber(phoneNumber)) return false

    // umur minimal 7 tahun
    const birth = new Date(birthDate)
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - 7)
    if (birth > minDate) return false

    return true
  }

  // Handle perubahan field dengan validasi realtime
  const handleSignUpChange = (field: keyof typeof signUpData, value: any) => {
    // Reset error on change
    setLocalError(null)

    // Validasi tiap field
    switch (field) {
      case "email":
        if (value && !validateEmail(value)) {
          setLocalError("Invalid email format")
        }
        break

      case "password":
        if (value.length < 6) {
          setLocalError("Password must be at least 6 characters")
        }
        if (signUpData.confirmPassword && value !== signUpData.confirmPassword) {
          setLocalError("Passwords do not match")
        }
        break

      case "confirmPassword":
        if (value !== signUpData.password) {
          setLocalError("Passwords do not match")
        }
        break

      case "phoneNumber":
        if (value && !validateIndonesianPhoneNumber(value)) {
          setLocalError("Phone number must start with 0 and be 9-12 digits")
          return
        }
        break

      case "birthDate":
        if (value) {
          const birth = new Date(value)
          const minDate = new Date()
          minDate.setFullYear(minDate.getFullYear() - 7)
          if (birth > minDate) {
            setLocalError("You must be at least 7 years old to register")
            return
          }
        }
        break

      case "role":
        if (!["coach", "athlete", "judge"].includes(value)) {
          setLocalError("Role must be selected")
          return
        }
        break

      case "idPhoto":
        if (value && !(value instanceof File)) {
          setLocalError("Invalid file selected")
          return
        }
        if (value && value.size > 2 * 1024 * 1024) {
          setLocalError("ID photo size must be <= 2MB")
          return
        }
        break

      default:
        break
    }

    // Update data jika valid
    setSignUpData({ ...signUpData, [field]: value })
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSuccess(null)

    if (!isSignUpValid()) {
      setLocalError("Please fill all fields correctly")
      return
    }

    const {
      email,
      password,
      confirmPassword,
      displayName,
      gender,
      birthDate,
      phoneNumber,
      role,
      idPhoto,
    } = signUpData

    try {
      const result = await signUpWithEmail(email, password, displayName)
      const userId = result.user?.id
      if (!userId) throw new Error("User ID not found")

      // Upload ID Photo
      let idPhotoUrl: string | null = null
      if (idPhoto) {
        const { data, error } = await supabase.storage
          .from("uploads")
          .upload(`id-photos/${userId}-${Date.now()}`, idPhoto, {
            upsert: true,
            contentType: idPhoto.type || "image/jpeg",
          })
        if (error) throw new Error("Failed to upload ID photo")
        idPhotoUrl = data?.path ?? null
      }

      const now = new Date().toISOString()

      // Insert profile
      const newUser = {
        id: userId,
        user_id: userId,
        member_code: generateMemberId(),
        email,
        display_name: displayName,
        gender,
        birth_date: birthDate,
        phone_number: phoneNumber,
        role,
        id_photo_url: idPhotoUrl,
        profile_photo_url: null,
        is_verified: false,
        created_at: now,
        updated_at: now,
      }

      const { error: insertError } = await supabase.from("profiles").insert(newUser)
      if (insertError) throw insertError

      setSuccess("Please check your email to confirm your account before signing in.")
      setEmailForResend(email)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Failed to sign up")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full transition-all duration-300 ${activeTab === "signup" ? "max-w-3xl" : "max-w-md"}`}>
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
          <Button onClick={() => {
            setLocalError(null)
            setSuccess(null)
            supabase.auth.resend({ type: "signup", email: emailForResend }).then(({ error }) => {
              if (error) setLocalError("Failed to resend email")
              else setSuccess("Confirmation email resent. Please check your inbox.")
            })
          }} variant="outline" className="w-full">
            Resend Confirmation Email
          </Button>
        )}

        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={() => setActiveTab("signin")}>Sign In</TabsTrigger>
            <TabsTrigger value="signup" onClick={() => setActiveTab("signup")}>Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In */}
          <TabsContent value="signin">
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setLocalError(null)
                try {
                  await signInWithEmail(signInData.email, signInData.password)
                  const { data: userData } = await supabase.auth.getUser()
                  if (userData?.user?.email_confirmed_at) {
                    await supabase.from("profiles").update({ is_verified: true }).eq("id", userData.user.id)
                  } else {
                    setSuccess("Your email is not yet confirmed. Please check your inbox.")
                  }
                } catch (error) {
                  setLocalError(error instanceof Error ? error.message : "Failed to sign in")
                }
              }}
              className="space-y-4"
            >
              <Input
                type="email"
                placeholder="Email"
                required
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Password"
                required
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
              />
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                {isSigningIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <Button onClick={async () => {
              setLocalError(null)
              try {
                await signInWithGoogle()
              } catch (error) {
                setLocalError(error instanceof Error ? error.message : "Failed to sign in with Google")
              }
            }} className="w-full mt-4" variant="outline">
              <Chrome className="mr-2 h-4 w-4" /> Continue with Google
            </Button>
          </TabsContent>

          {/* Sign Up */}
          <TabsContent value="signup">
            <form onSubmit={handleEmailSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    required
                    value={signUpData.displayName}
                    onChange={(e) => handleSignUpChange("displayName", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={signUpData.email}
                    onChange={(e) => handleSignUpChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    maxLength={12}
                    required
                    value={signUpData.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value
                      // Izinkan kosong atau angka, jangan batasi lebih ketat di sini
                      if (/^\d*$/.test(val)) {
                        setSignUpData(prev => ({ ...prev, phoneNumber: val }))
                        setLocalError(null) // reset error saat user input ulang
                      }
                    }}
                    onBlur={() => {
                      const phone = signUpData.phoneNumber
                      if (phone && !/^0\d{8,11}$/.test(phone)) {
                        setLocalError("Phone number must start with 0 and be 9-12 digits")
                      } else {
                        setLocalError(null)
                      }
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="birthDate">Date of Birth</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    max={maxBirthDate}
                    required
                    value={signUpData.birthDate}
                    onChange={(e) => handleSignUpChange("birthDate", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role">Status</Label>
                  <select
                    id="role"
                    required
                    value={signUpData.role}
                    onChange={(e) => handleSignUpChange("role", e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Choose Status</option>
                    <option value="coach">COACH</option>
                    <option value="athlete">ATHLETE</option>
                    <option value="judge">JUDGE</option>
                  </select>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                <div className="space-y-1 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={signUpData.password}
                    onChange={(e) => handleSignUpChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-9"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="space-y-1 relative">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={signUpData.confirmPassword}
                    onChange={(e) => handleSignUpChange("confirmPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-3 top-9"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    required
                    value={signUpData.gender}
                    onChange={(e) => handleSignUpChange("gender", e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Choose Gender</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="idPhoto">ID Photo (KTP/KK/KIA)</Label>
                  <Input
                    id="idPhoto"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => handleSignUpChange("idPhoto", e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="col-span-1 md:col-span-2">
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!isSignUpValid() || !!localError || isSigningIn}
                >
                  {isSigningIn ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
