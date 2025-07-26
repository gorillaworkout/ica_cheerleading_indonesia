"use client"

import { useAppSelector } from "@/lib/redux/hooks"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const { user, hydrated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!hydrated) return
    if (user) {
      router.push("/")
    }
  }, [hydrated, user, router])

  useEffect(() => {
    // Check for password reset/change success flags
    const passwordResetSuccess = localStorage.getItem("passwordResetSuccess")
    const passwordChangedSuccess = localStorage.getItem("passwordChangedSuccess")
    
    if (passwordResetSuccess === "true") {
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been successfully reset. You can now login with your new password.",
        variant: "default",
      })
      localStorage.removeItem("passwordResetSuccess")
    }
    
    if (passwordChangedSuccess === "true") {
      toast({
        title: "Password Changed Successfully!",
        description: "Your password has been successfully changed. Please login with your new password.",
        variant: "default",
      })
      localStorage.removeItem("passwordChangedSuccess")
    }
  }, [toast])

  if (!hydrated) return null // ⏳ Optional: show spinner here

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto flex justify-center items-center flex-col">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ICA</h1>
            <p className="text-gray-600">Sign in with your account</p>
          </div>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
