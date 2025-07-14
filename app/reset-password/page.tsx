"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FullScreenLoader } from "@/components/ui/fullScreenLoader"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [isSessionReady, setIsSessionReady] = useState(false)

    // Pastikan user sudah login lewat token reset password Supabase
      useEffect(() => {
        const checkSession = async () => {
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            setIsSessionReady(true)
          } else {
            toast({ title: "Error", description: "Session reset password tidak valid." })
            router.push("/forgot-password") // redirect ke forgot password jika token tidak valid
          }
        }
        checkSession()
      }, [router])

    async function handleResetPassword() {
        if (password.length < 6) {
            toast({ title: "Error", description: "Password minimal 6 karakter." })
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            toast({ title: "Error", description: error.message })
        } else {
            toast({ title: "Sukses", description: "Password berhasil diubah. Silakan login ulang." })
            await supabase.auth.signOut()
            router.push("/login")
        }

        setLoading(false)
    }

      if (!isSessionReady) {
        return <FullScreenLoader/>
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
