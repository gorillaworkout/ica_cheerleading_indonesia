"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchSessionAndProfile, signInWithEmailThunk, signInWithGoogleThunk, signUpWithEmailThunk } from "@/features/auth/authSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chrome, AlertCircle, Loader2, MailCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

function generateMemberId() {
  return `ICA-${Math.floor(1000 + Math.random() * 9000)}`
}

export function LoginForm() {
  const dispatch = useAppDispatch()
  const { loading, error, user } = useAppSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [emailForResend, setEmailForResend] = useState("")

  const [signInData, setSignInData] = useState({ email: "", password: "" })
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    displayName: "",
    gender: "",
    birthDate: "",
    phoneNumber: "",
    role: "",
    idPhoto: null as File | null,
  });


  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const today = new Date().toISOString().split("T")[0];
  const router = useRouter()
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    try {
      await dispatch(signInWithEmailThunk(signInData)).unwrap()
      router.push("/") // redirect ke home page
    } catch (err: any) {
      setLocalError(err?.message || "Failed to sign in")
    }
  }

    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      try {
        await dispatch(
          signUpWithEmailThunk({
            email: signUpData.email,
            password: signUpData.password,
            display_name: signUpData.displayName,
            member_code: generateMemberId(),
            gender: signUpData.gender,
            birth_date: signUpData.birthDate,
            phone_number: signUpData.phoneNumber,
            role: signUpData.role,
            id_photo_file: signUpData.idPhoto!,
          })
        ).unwrap();

        setSuccess("Check your email to confirm your account.");
        setEmailForResend(signUpData.email);
      } catch (err: any) {
        setLocalError(err?.message || "Failed to sign up");
      }
    };


  // check user login

  useEffect(() => {
    if (user) {
      router.push("/")  // redirect ke homepage kalau sudah login
    }
    console.log(user, 'user login form')
  }, [user, router])
  // check uses login

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

        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={() => setActiveTab("signin")}>Sign In</TabsTrigger>
            <TabsTrigger value="signup" onClick={() => setActiveTab("signup")}>Sign Up</TabsTrigger>
          </TabsList>

          {/* SIGN IN */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
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

          {/* SIGN UP */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input id="displayName" value={signUpData.displayName} onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" value={signUpData.phoneNumber} onChange={(e) => setSignUpData({ ...signUpData, phoneNumber: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="birthDate">Date of Birth</Label>
                  <Input id="birthDate" type="date" max={today} value={signUpData.birthDate} onChange={(e) => setSignUpData({ ...signUpData, birthDate: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="role">Role</Label>
                  <select id="role" value={signUpData.role} onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })} required className="w-full border rounded px-2 py-2">
                    <option value="">Choose Role</option>
                    <option value="coach">Coach</option>
                    <option value="athlete">Athlete</option>
                    <option value="judge">Judge</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" value={signUpData.gender} onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="idPhoto">ID Photo</Label>
                  <Input id="idPhoto" type="file" accept="image/*" onChange={(e) => setSignUpData({ ...signUpData, idPhoto: e.target.files?.[0] || null })} required />
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
