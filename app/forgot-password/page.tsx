"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Countdown effect for rate limiting
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setIsRateLimited(false)
            toast({
              title: "✅ Cooldown Selesai",
              description: "Anda sudah bisa mengirim request reset password lagi.",
              className: "border-green-500 bg-green-50"
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldownTime])

  // Check if error is rate limiting
  function isRateLimitError(error: any): boolean {
    return error.message?.includes('For security purposes, you can only request this after') ||
           error.message?.includes('429') ||
           error.status === 429
  }

  // Extract cooldown seconds from error message
  function extractCooldownSeconds(errorMessage: string): number {
    const match = errorMessage.match(/after (\d+) seconds/)
    return match ? parseInt(match[1]) : 60 // default 60 seconds if can't parse
  }

  // Handle rate limiting
  function handleRateLimit(error: any) {
    const seconds = extractCooldownSeconds(error.message || '')
    setCooldownTime(seconds)
    setIsRateLimited(true)
    
    toast({
      title: "⏰ Rate Limit Reached",
      description: `Terlalu banyak request. Silakan tunggu ${seconds} detik sebelum mencoba lagi.`,
      className: "border-orange-500 bg-orange-50"
    })
  }

  // Test toast function
  function testToast() {
    console.log("🧪 Testing toast...")
    toast({
      title: "🧪 Test Toast",
      description: "Ini adalah test toast notification.",
      className: "border-blue-500 bg-blue-50"
    })
  }

  async function handleSendResetEmail() {
    if (!email) {
      console.log("🚫 Email required, showing toast...")
      toast({
        title: "❌ Email Required",
        description: "Silakan masukkan email terlebih dahulu.",
        className: "border-red-500 bg-red-50"
      })
      return
    }

    setLoading(true)
    
    console.log("🚀 Starting reset password system...")
    
    // Tier 1: Supabase with redirect URL
    console.log("📧 Tier 1: Trying with redirect URL...")
    const { error: error1 } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (!error1) {
      console.log("✅ Tier 1: Supabase with redirect succeeded!")
      console.log("📧 Showing success toast...")
      toast({
        title: "✅ Email Berhasil Dikirim",
        description: "Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam. Link akan expired dalam 1 jam.",
        className: "border-green-500 bg-green-50"
      })
      setLoading(false)
      return
    }

    // Check for rate limiting
    if (isRateLimitError(error1)) {
      console.log("⏰ Tier 1: Rate limited")
      handleRateLimit(error1)
      setLoading(false)
      return
    }

    console.log("❌ Tier 1 failed:", error1.message)
    
    // Tier 2: Supabase without redirect URL
    console.log("📧 Tier 2: Trying without redirect URL...")
    const { error: error2 } = await supabase.auth.resetPasswordForEmail(email)

    if (!error2) {
      console.log("✅ Tier 2: Supabase without redirect succeeded!")
      toast({
        title: "✅ Email Berhasil Dikirim",
        description: "Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam. Link akan expired dalam 1 jam.",
        className: "border-green-500 bg-green-50"
      })
      setLoading(false)
      return
    }

    // Check for rate limiting
    if (isRateLimitError(error2)) {
      console.log("⏰ Tier 2: Rate limited")
      handleRateLimit(error2)
      setLoading(false)
      return
    }

    console.log("❌ Tier 2 failed:", error2.message)
    
    // Tier 3: Supabase with minimal config
    console.log("📧 Tier 3: Trying minimal Supabase config...")
    const { error: error3 } = await supabase.auth.resetPasswordForEmail(email, {})

    if (!error3) {
      console.log("✅ Tier 3: Supabase minimal succeeded!")
      toast({
        title: "✅ Email Berhasil Dikirim",
        description: "Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam. Link akan expired dalam 1 jam.",
        className: "border-green-500 bg-green-50"
      })
      setLoading(false)
      return
    }

    // Check for rate limiting
    if (isRateLimitError(error3)) {
      console.log("⏰ Tier 3: Rate limited")
      handleRateLimit(error3)
      setLoading(false)
      return
    }

    console.log("❌ Tier 3 failed:", error3.message)
    
    // All tiers failed with non-rate-limit errors
    console.log("❌ All tiers failed with non-rate-limit errors")
    toast({
      title: "❌ Gagal Mengirim Email",
      description: `Semua sistem gagal. Error terakhir: ${error3.message}. Silakan coba lagi nanti atau hubungi admin.`,
      className: "border-red-500 bg-red-50"
    })
    
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
          
          {/* Rate Limit Warning */}
          {isRateLimited && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-orange-800">Rate Limit Active</h3>
                  <p className="text-sm text-orange-700">Tunggu {cooldownTime} detik lagi</p>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {cooldownTime}s
                </div>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${((60 - cooldownTime) / 60) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}

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
            disabled={loading || !email || (isRateLimited && cooldownTime > 0)}
            className="w-full bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mengirim..." : 
             isRateLimited ? `Tunggu ${cooldownTime}s` : 
             "Kirim Link Reset Password"}
          </button>
          
          {/* Test Toast Button - Debug */}
          <button
            onClick={testToast}
            className="w-full mt-3 bg-purple-500 text-white py-2 rounded-md font-medium hover:bg-purple-600 text-sm"
          >
            🧪 Test Toast Notification
          </button>
          
          {/* Info text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Sistem akan menggunakan template email Supabase yang sudah Anda kustomisasi.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}


