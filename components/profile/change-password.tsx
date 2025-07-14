"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/lib/redux/hooks"
import { clearAuth } from "@/features/auth/authSlice"

export default function ChangePasswordForm() {
    const dispatch = useAppDispatch();
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    
const handleChangePassword = async () => {
  if (password.length < 6) {
    setMessage("Password minimal 6 karakter.")
    return
  }

  setLoading(true)
  setMessage("")

  const { error } = await supabase.auth.updateUser({ password })
  console.log("update user done")
  if (error) {
    setMessage(error.message)
  } else {
    setMessage("Password berhasil diubah! Silakan login ulang.")
    setPassword("")

    // Logout user supaya harus login ulang
    await supabase.auth.signOut()
    dispatch(clearAuth())

    // Reload halaman penuh supaya redux benar-benar reset
    window.location.href = "/login"
  }

  setLoading(false)
}



  return (
    <div className="space-y-3 max-w-sm">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password baru (min. 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <Button
        type="button"
        onClick={handleChangePassword}
        disabled={loading || password.length < 6}
        className="w-full"
      >
        {loading ? "Saving..." : "Save Password"}
      </Button>

      {message && (
        <p className="text-sm text-center text-red-600">{message}</p>
      )}
    </div>
  )
}
