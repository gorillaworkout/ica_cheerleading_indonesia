"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSendResetEmail() {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast({ title: "Error", description: error.message })
    } else {
      toast({
        title: "Success",
        description: "Cek email Anda untuk link reset password.",
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-extrabold text-red-500 mb-4 text-center">Lupa Password?</h1>
          <p className="text-center text-gray-600 mb-8">
            Masukkan email Anda, kami akan mengirimkan link untuk reset password.
          </p>
          <input
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
          <button
            onClick={handleSendResetEmail}
            disabled={loading || !email}
            className="w-full bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset Password"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
