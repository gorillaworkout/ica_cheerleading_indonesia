import { supabase } from "@/lib/supabase"

export function getPublicImageUrl(path: string) {
  if (!path) {
    console.error("Invalid path provided to getPublicImageUrl")
    return null
  }

  const { data } = supabase.storage.from("uploads").getPublicUrl(path)

  if (!data || !data.publicUrl) {
    console.error("Failed to generate public URL for path:", path)
    return null
  }

  return data.publicUrl
}
