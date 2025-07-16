import { supabase } from "@/lib/supabase";

export async function fetchCompetitions() {
  try {
    const { data, error } = await supabase.from("competitions").select();

    if (error) {
      console.error("Error fetching competitions:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}
