"use client"

import { useAppSelector } from "@/lib/redux/hooks"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function LoginPage() {
  const { user, hydrated } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return
    if (user) {
      router.push("/")
    }
  }, [hydrated, user, router])

  if (!hydrated) return null // ⏳ Optional: show spinner here

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto flex justify-center items-center flex-col">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ICA</h1>
            <p className="text-gray-600">Sign in with your Google account</p>
          </div>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
