// app/admin/layout.tsx atau app/admin/AdminLayout.tsx
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuthContext } from "@/components/providers/auth-provider"
import { useEffect } from "react"
import { Header } from "@/components/layout/header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      console.log("🔒 Access denied: not logged in or not admin")
      router.push("/")
    }
  }, [user, profile, loading, router])

  if (loading) return <p>Loading...</p>
  if (!user || profile?.role !== "admin") return null

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
