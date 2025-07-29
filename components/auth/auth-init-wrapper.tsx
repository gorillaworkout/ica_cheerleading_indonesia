// components/auth/auth-init-wrapper.tsx
"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useAppSelector } from "@/lib/redux/hooks"
import { FullScreenLoader } from "@/components/ui/fullScreenLoader"
import { AuthInit } from "@/components/auth/auth-init"

export function AuthInitWrapper({ children }: { children: React.ReactNode }) {
  const { loading, hydrated } = useAppSelector((state) => state.auth)
  const pathname = usePathname()
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false)
  const [isClientMounted, setIsClientMounted] = useState(false)

  // ✅ CRITICAL FIX: Use useEffect to prevent hydration error
  useEffect(() => {
    setIsClientMounted(true)
    
    const hash = window.location.hash
    const isResetPage = pathname === '/reset-password'
    const hasRecoveryToken = hash.includes('access_token=') && hash.includes('type=recovery')

    setIsRecoveryFlow(isResetPage && hasRecoveryToken)
  }, [pathname])

  // Show loading until client is mounted to prevent hydration errors
  if (!isClientMounted) {
    return <FullScreenLoader message="Memuat..." />
  }

  // Skip loading screen for recovery flow
  if (isRecoveryFlow) {
    return (
      <>
        <AuthInit />
        {children}
      </>
    )
  }

  return (
    <>
      <AuthInit />
      {!hydrated || loading ? <FullScreenLoader message="Memuat akun kamu..." /> : children}
    </>
  )
}
