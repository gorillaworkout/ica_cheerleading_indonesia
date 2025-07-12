import { supabase } from "@/lib/supabase"

export function getPublicImageUrl(path: string) {
  const { data } = supabase.storage.from("uploads").getPublicUrl(path)
  return data.publicUrl
}
