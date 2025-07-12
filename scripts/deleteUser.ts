import { createClient } from "@supabase/supabase-js"

// ⚠️ Gunakan service_role key — INI HARUS DI SERVER, JANGAN DI CLIENT
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function deleteUserById(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    console.error("Failed to delete user:", error.message)
    throw error
  }
  console.log("✅ User deleted:", userId)
}
