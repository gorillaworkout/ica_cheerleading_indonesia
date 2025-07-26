"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/lib/redux/hooks"
import { clearAuth } from "@/features/auth/authSlice"
import { useToast } from "@/hooks/use-toast"

export default function ChangePasswordForm() {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    
const handleChangePassword = async () => {
  if (password.length < 6) {
    const errorMsg = "Password must be at least 6 characters."
    setMessage(errorMsg)
    
    toast({
      title: "Password Too Short",
      description: errorMsg,
      variant: "destructive",
    })
    return
  }

  setLoading(true)
  setMessage("")

  const { error } = await supabase.auth.updateUser({ password })
  console.log("update user done")
  if (error) {
    setMessage(error.message)
    
    toast({
      title: "Password Update Failed",
      description: error.message,
      variant: "destructive",
    })
  } else {
    const successMsg = "Password successfully changed! Please login again."
    setMessage(successMsg)
    setPassword("")

    toast({
      title: "Password Changed Successfully!",
      description: "You will be logged out and redirected to login page.",
      variant: "default",
    })

    // Set flag for login page toast
    localStorage.setItem("passwordChangedSuccess", "true")

    // Delay logout and redirect to let user see toast
    setTimeout(async () => {
      // Logout user supaya harus login ulang
      await supabase.auth.signOut()
      dispatch(clearAuth())

      // Reload halaman penuh supaya redux benar-benar reset
      window.location.href = "/login"
    }, 2000)
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
