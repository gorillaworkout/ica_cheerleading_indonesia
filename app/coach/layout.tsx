"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { CoachSidebar } from "@/components/coach/coach-sidebar"
import { useAuthContext } from "@/components/providers/auth-provider"
import { useEffect } from "react"
import { FullScreenLoader } from "@/components/ui/fullScreenLoader"

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "coach")) {
      console.log("🔒 Access denied: not logged in or not coach")
      router.push("/")
    }
  }, [user, profile, loading, router])

  if (loading) return <FullScreenLoader message="" />
  if (!user || profile?.role !== "coach") return null

  return (
    <div className="flex h-screen bg-gray-50">
      <CoachSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
