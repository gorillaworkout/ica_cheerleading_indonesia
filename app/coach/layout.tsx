import type React from "react"
import { redirect } from "next/navigation"
import { CoachSidebar } from "@/components/coach/coach-sidebar"
import { getCurrentUser } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user has coach or admin role
  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "coach" && profile.role !== "admin")) {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CoachSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
