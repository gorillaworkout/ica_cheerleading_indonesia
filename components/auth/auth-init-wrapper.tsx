// components/auth/auth-init-wrapper.tsx
"use client"

import { useAppSelector } from "@/lib/redux/hooks"
import { FullScreenLoader } from "@/components/ui/fullScreenLoader"
import { AuthInit } from "@/components/auth/auth-init"

export function AuthInitWrapper({ children }: { children: React.ReactNode }) {
  const { loading, hydrated } = useAppSelector((state) => state.auth)

  return (
    <>
      <AuthInit />
      {!hydrated || loading ? <FullScreenLoader message="Memuat akun kamu..." /> : children}
    </>
  )
}
