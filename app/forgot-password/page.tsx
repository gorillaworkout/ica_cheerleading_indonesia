"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  // Rate limiting helpers
  const isRateLimitError = (error: any) => {
    const message = error?.message?.toLowerCase() || ""
    return (
      message.includes("too many requests") ||
      message.includes("rate limit") ||
      message.includes("429") ||
      error?.status === 429
    )
  }

  const handleRateLimit = (error: any) => {
    console.log("⏰ Rate limit detected:", error)
    setIsRateLimited(true)
    setCooldownTime(60) // 1 minute cooldown

    toast({
      title: "⏰ Rate Limit Reached",
      description: "Terlalu banyak permintaan. Silakan tunggu 1 menit sebelum mencoba lagi.",
      className: "border-orange-500 bg-orange-50"
    })
  }

  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRateLimited && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRateLimited, cooldownTime])

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
    
    try {
      console.log("🚀 Starting reset password system...")
      
      // Tier 1: Supabase with redirect URL + MailerSend SMTP
      console.log("📧 Tier 1: Trying Supabase template with MailerSend SMTP...")
      const { error: error1 } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (!error1) {
        console.log("✅ Tier 1: Supabase template + MailerSend SMTP succeeded!")
        toast({
          title: "✅ Email Berhasil Dikirim",
          description: "Link reset password telah dikirim menggunakan template Supabase via MailerSend SMTP. Silakan cek inbox dan folder spam.",
          className: "border-green-500 bg-green-50"
        })
        return
      }

      // Check for rate limiting
      if (isRateLimitError(error1)) {
        console.log("⏰ Tier 1: Rate limited")
        handleRateLimit(error1)
        return
      }

      console.log("❌ Tier 1 failed:", error1.message)

      // Tier 2: Supabase without redirect URL
      console.log("📧 Tier 2: Trying Supabase without redirect...")
      const { error: error2 } = await supabase.auth.resetPasswordForEmail(email)

      if (!error2) {
        console.log("✅ Tier 2: Supabase without redirect succeeded!")
        toast({
          title: "✅ Email Berhasil Dikirim",
          description: "Link reset password telah dikirim ke email Anda. Link akan expired dalam 1 jam.",
          className: "border-green-500 bg-green-50"
        })
        return
      }

      // Check for rate limiting
      if (isRateLimitError(error2)) {
        console.log("⏰ Tier 2: Rate limited")
        handleRateLimit(error2)
        return
      }

      console.log("❌ Tier 2 failed:", error2.message)
    
      // Tier 3: Supabase without redirect URL
      console.log("📧 Tier 3: Trying without redirect URL...")
      const { error: error3 } = await supabase.auth.resetPasswordForEmail(email)

      if (!error3) {
        console.log("✅ Tier 3: Supabase without redirect succeeded!")
        toast({
          title: "✅ Email Berhasil Dikirim",
          description: "Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam. Link akan expired dalam 1 jam.",
          className: "border-green-500 bg-green-50"
        })
        return
      }

      // Check for rate limiting
      if (isRateLimitError(error3)) {
        console.log("⏰ Tier 3: Rate limited")
        handleRateLimit(error3)
        return
      }

      console.log("❌ Tier 3 failed:", error3.message)
    
      // Tier 4: Supabase with minimal config
      console.log("📧 Tier 4: Trying minimal Supabase config...")
      const { error: error4 } = await supabase.auth.resetPasswordForEmail(email, {})

      if (!error4) {
        console.log("✅ Tier 4: Supabase minimal succeeded!")
        toast({
          title: "✅ Email Berhasil Dikirim",
          description: "Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam. Link akan expired dalam 1 jam.",
          className: "border-green-500 bg-green-50"
        })
        return
      }

      // Check for rate limiting
      if (isRateLimitError(error4)) {
        console.log("⏰ Tier 4: Rate limited")
        handleRateLimit(error4)
        return
      }

      console.log("❌ Tier 4 failed:", error4.message)
    
      // All tiers failed with non-rate-limit errors
      console.log("❌ All tiers failed with non-rate-limit errors")
      toast({
        title: "❌ Gagal Mengirim Email",
        description: `Semua sistem gagal. Error terakhir: ${error3.message}. Silakan coba lagi nanti atau hubungi admin.`,
        className: "border-red-500 bg-red-50"
      })
      
    } catch (unexpectedError) {
      console.error("❌ Unexpected error in reset password:", unexpectedError)
      toast({
        title: "❌ Terjadi Kesalahan",
        description: "Terjadi kesalahan tak terduga. Silakan coba lagi atau hubungi administrator.",
        className: "border-red-500 bg-red-50"
      })
    } finally {
      // ✅ Pastikan loading selalu direset
      console.log("🔄 Resetting loading state...")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ✨ Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(120,219,255,0.3),transparent_50%)]"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <Header />
      
      <main className="relative flex-grow flex items-center justify-center px-4 py-16 min-h-screen">
        <div className="w-full max-w-md">
          {/* 🔥 Futuristic Card */}
          <div className="relative group">
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            
            {/* Main card */}
            <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
              {/* 🎯 Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Reset Password
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter your email address and we'll send you a secure link to reset your password
                </p>
              </div>

              {/* 💫 Rate Limit Warning - Futuristic Style */}
              {isRateLimited && (
                <div className="mb-6 relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-20"></div>
                  <div className="relative bg-orange-900/30 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-orange-300 font-semibold text-sm">Rate Limit Active</h3>
                          <p className="text-orange-400/80 text-xs">Please wait before trying again</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-300">{cooldownTime}s</div>
                      </div>
                    </div>
                    
                    {/* Animated progress bar */}
                    <div className="relative h-2 bg-orange-900/50 rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-out"
                        style={{ width: `${((60 - cooldownTime) / 60) * 100}%` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🚀 Email Input - Futuristic Style */}
              <div className="mb-6">
                <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-0 group-focus-within:opacity-20 transition duration-200"></div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 🎯 Submit Button - Ultra Futuristic */}
              <button
                onClick={handleSendResetEmail}
                disabled={loading || !email || (isRateLimited && cooldownTime > 0)}
                className="w-full relative group overflow-hidden rounded-lg p-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 group-hover:from-cyan-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-all duration-300"></div>
                <div className="relative bg-slate-900 rounded-md px-6 py-3 transition-all duration-300 group-hover:bg-transparent">
                  <div className="flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-semibold text-white">Sending...</span>
                      </>
                    ) : isRateLimited ? (
                      <>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-white">Wait {cooldownTime}s</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="font-semibold text-white">Send Reset Link</span>
                      </>
                    )}
                  </div>
                </div>
              </button>

              {/* 🔗 Back to Login */}
              <div className="mt-6 text-center">
                <a 
                  href="/login" 
                  className="inline-flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors duration-200 text-sm group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Login</span>
                </a>
              </div>

              {/* ✨ Decorative Elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* 💫 Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              🔒 We'll send you a secure link to reset your password
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


