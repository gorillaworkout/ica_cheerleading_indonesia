import type React from "react"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getCurrentUser, ensureUserProfile } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("🔍 Admin Layout: Checking access...")

  // Check if user is authenticated
  // const user = await getCurrentUser()

  // if (!user) {
  //   console.log("❌ Admin Layout: No user found, redirecting to login")
  //   redirect("/login")
  // }

  // console.log("✅ Admin Layout: User found:", {
  //   id: user.id,
  //   email: user.email,
  // })

  // // Ensure profile exists and check role
  // const supabase = await createServerSupabaseClient()

  // // First ensure profile exists
  // await ensureUserProfile(user.id, user.email || "", user.user_metadata?.display_name)

  // // Then check role
  // const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // console.log("🔍 Admin Layout: Profile check result:", {
  //   profile,
  //   error,
  //   userId: user.id,
  // })

  // if (error || !profile) {
  //   console.log("❌ Admin Layout: Profile error or not found, redirecting to home")
  //   redirect("/")
  // }

  // if (profile.role !== "admin") {
  //   console.log("❌ Admin Layout: User is not admin, redirecting to home. Role:", profile.role)
  //   redirect("/")
  // }

  // console.log("✅ Admin Layout: Access granted for admin user")

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
