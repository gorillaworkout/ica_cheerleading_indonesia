import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your ICA account to access competitions, education, and community features.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LoginPage() {
  // Check if user is already logged in
  // const user = await getCurrentUser()

  // if (user) {
  //   // User is already logged in, redirect to home
  //   redirect("/")
  // }

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
