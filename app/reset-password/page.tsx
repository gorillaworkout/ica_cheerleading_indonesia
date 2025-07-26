"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FullScreenLoader } from "@/components/ui/fullScreenLoader"

export default function ResetPasswordPage() {
    const { toast } = useToast()
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isSessionReady, setIsSessionReady] = useState(false)
    const [resetMethod, setResetMethod] = useState<'supabase' | 'custom' | null>(null)
    
    // For custom reset
    const customToken = searchParams.get('token')
    const resetEmail = searchParams.get('email')

    useEffect(() => {
        console.log("🚀 RESET PASSWORD PAGE MOUNTED")
        console.log("📍 Current URL:", window.location.href)
        console.log("📋 Hash:", window.location.hash)
        console.log("🔍 Search params:", window.location.search)
        
        // ✅ CRITICAL FIX: Don't show wrong page detection on reset-password page
        // This was causing unnecessary confusion
        if (window.location.pathname.includes('forgot-password') && !window.location.pathname.includes('reset-password')) {
            console.log("⚠️ User is on forgot-password page but has reset token")
            toast({
                title: "Wrong Page Detected",
                description: "Anda sedang di halaman yang salah. Klik tombol di bawah untuk ke halaman reset password yang benar.",
                action: (
                    <button 
                        onClick={() => {
                            const currentUrl = window.location.href
                            const resetUrl = currentUrl.replace('/forgot-password', '/reset-password')
                            window.location.href = resetUrl
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                        Reset Password
                    </button>
                )
            })
            return
        }
        
        const checkResetMethod = async () => {
            console.log("🔍 Checking reset method...")
            console.log("Custom token:", customToken ? "Present" : "Not found")
            console.log("Email:", resetEmail ? "Present" : "Not found")
            console.log("Current URL:", window.location.href)
            
            // Check URL hash for Supabase recovery tokens
            const urlHash = window.location.hash
            const hasSupabaseRecoveryToken = urlHash.includes('access_token=') && urlHash.includes('type=recovery')
            console.log("Supabase recovery hash:", hasSupabaseRecoveryToken ? "Present" : "Not found")
            console.log("📋 Full hash content:", urlHash)
            
            // Method 1: Custom reset (has token and email in search params)
            if (customToken && resetEmail) {
                console.log("✅ Using custom reset method")
                setResetMethod('custom')
                setIsSessionReady(true)
                return
            }
            
            // Method 2: Supabase recovery (has hash params) - MANUAL PARSING
            if (hasSupabaseRecoveryToken) {
                console.log("✅ Detected Supabase recovery token in hash")
                console.log("� URL Hash content:", urlHash)
                
                try {
                    // Parse hash parameters manually
                    console.log("🔧 Starting manual hash parsing...")
                    const hashParams = new URLSearchParams(urlHash.substring(1))
                    const accessToken = hashParams.get('access_token')
                    const refreshToken = hashParams.get('refresh_token')
                    
                    console.log("🔑 Access token found:", !!accessToken)
                    console.log("� Access token length:", accessToken?.length)
                    console.log("�🔄 Refresh token found:", !!refreshToken)
                    console.log("🔄 Refresh token length:", refreshToken?.length)
                    
                    if (accessToken && refreshToken) {
                        console.log("🔧 Manually setting Supabase session...")
                        
                        // Set session manually
                        const { data, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        })
                        
                        console.log("📊 Manual session result:", {
                            hasSession: !!data.session,
                            hasUser: !!data.session?.user,
                            userEmail: data.session?.user?.email,
                            error: error
                        })
                        
                        if (data.session && !error) {
                            console.log("✅ Manual session creation successful")
                            console.log("👤 User email:", data.session.user?.email)
                            setResetMethod('supabase')
                            setIsSessionReady(true)
                            
                            // Clean up URL hash to prevent reload issues
                            console.log("🧹 Cleaning up URL hash...")
                            window.history.replaceState({}, document.title, window.location.pathname)
                            return
                        } else {
                            console.log("❌ Manual session creation failed")
                            console.log("Error details:", error)
                        }
                    } else {
                        console.log("❌ Missing required tokens in hash")
                    }
                } catch (parseError) {
                    console.error("❌ Error parsing hash parameters:", parseError)
                }
                
                // Fallback: wait for Supabase auto-processing with multiple attempts
                console.log("🔄 Falling back to auto-processing...")
                let attempts = 0
                const maxAttempts = 5
                const checkInterval = 1000 // 1 second
                
                const intervalId = setInterval(async () => {
                    attempts++
                    console.log(`⏰ Checking session after delay... (attempt ${attempts}/${maxAttempts})`)
                    
                    const { data, error } = await supabase.auth.getSession()
                    console.log("📊 Session data:", data)
                    console.log("❌ Session error:", error)
                    
                    if (data.session) {
                        console.log("✅ Supabase auto-processing successful")
                        clearInterval(intervalId)
                        setResetMethod('supabase')
                        setIsSessionReady(true)
                    } else if (attempts >= maxAttempts) {
                        console.log("❌ All recovery methods failed after maximum attempts")
                        clearInterval(intervalId)
                        toast({ 
                            title: "Reset Token Expired", 
                            description: "Link reset password sudah expired atau tidak valid. Silakan request ulang di halaman lupa password.",
                            action: (
                                <button 
                                    onClick={() => router.push("/forgot-password")}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                    Lupa Password
                                </button>
                            )
                        })
                    }
                }, checkInterval)
                return
            }
            
            // Method 3: Check existing Supabase session
            console.log("🔍 Checking existing Supabase session...")
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                console.log("✅ Using existing Supabase session")
                setResetMethod('supabase')
                setIsSessionReady(true)
            } else {
                console.log("❌ No valid session or token found")
                toast({ 
                    title: "Session Invalid", 
                    description: "Tidak ada session reset password yang valid. Silakan request ulang.",
                    action: (
                        <button 
                            onClick={() => router.push("/forgot-password")}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                            Lupa Password
                        </button>
                    )
                })
            }
        }
        
        checkResetMethod()
    }, []) // ✅ Remove dependencies to prevent infinite loops during recovery flow

    async function handleResetPassword() {
        if (password.length < 6) {
            toast({ title: "Error", description: "Password minimal 6 karakter." })
            return
        }

        setLoading(true)
        
        if (resetMethod === 'custom') {
            // Handle custom reset
            console.log("🔄 Processing custom password reset...")
            try {
                const response = await fetch('/api/auth/update-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        token: customToken, 
                        email: resetEmail, 
                        password 
                    }),
                })

                const result = await response.json()
                
                if (response.ok) {
                    toast({ 
                        title: "Sukses", 
                        description: "Password berhasil diubah. Silakan login dengan password baru." 
                    })
                    
                    // Set flag for login page toast
                    localStorage.setItem("passwordResetSuccess", "true")
                    
                    // Delay redirect to let user see toast
                    setTimeout(() => {
                        router.push("/login")
                    }, 2000)
                } else {
                    throw new Error(result.error || 'Password reset failed')
                }
            } catch (error) {
                console.error("Custom reset error:", error)
                toast({ 
                    title: "Error", 
                    description: error instanceof Error ? error.message : "Gagal mengubah password" 
                })
            }
        } else {
            // Handle Supabase reset
            console.log("🔄 Processing Supabase password reset...")
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                toast({ title: "Error", description: error.message })
            } else {
                toast({ title: "Sukses", description: "Password berhasil diubah. Silakan login ulang." })
                
                // Set flag for login page toast
                localStorage.setItem("passwordResetSuccess", "true")
                
                // Delay redirect to let user see toast
                setTimeout(async () => {
                    await supabase.auth.signOut()
                    router.push("/login")
                }, 2000)
            }
        }

        setLoading(false)
    }

      if (!isSessionReady) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center px-4 py-16">
                    <div className="w-full max-w-md bg-white rounded shadow p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                        <h2 className="text-lg font-semibold mb-2">Memproses Reset Password</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Sedang memvalidasi token dan membuat session...
                        </p>
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                            <div>URL: {typeof window !== 'undefined' ? window.location.pathname : ''}</div>
                            <div>Has Hash: {typeof window !== 'undefined' && window.location.hash ? 'Yes' : 'No'}</div>
                            <div>Method: {resetMethod || 'Detecting...'}</div>
                            <div>Custom Token: {customToken ? 'Present' : 'None'}</div>
                            <div>Reset Email: {resetEmail ? 'Present' : 'None'}</div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
      }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow flex items-center justify-center px-4 py-16">
                <div className="w-full h-full max-w-md bg-white rounded shadow p-6 ">
                    <h1 className="text-xl font-bold mb-4">Set Password Baru</h1>
                    <input
                        type="password"
                        placeholder="Password baru (min. 6 karakter)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border px-4 py-2 rounded w-full mb-4"
                    />
                    <button
                        onClick={handleResetPassword}
                        disabled={loading || password.length < 6}
                        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                    >
                        {loading ? "Memproses..." : "Reset Password"}
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    )
}
