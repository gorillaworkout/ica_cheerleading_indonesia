"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { FullScreenLoader } from "@/components/ui/fullScreenLoader"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/redux/store"  // Pastikan path sesuai

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const { user, profile, loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      // console.log("🔒 Access denied: not logged in or not admin")
      router.push("/")
    }
  }, [user, profile, loading, router])

  if (loading) return <FullScreenLoader message="" />
  if (!user || profile?.role !== "admin") return null

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* <Header /> */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
