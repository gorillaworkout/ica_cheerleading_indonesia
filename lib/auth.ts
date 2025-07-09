import { User } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "./supabase-server"

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("❌ No user found or error:", userError)
      return false
    }

    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    })

    // Check user role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    console.log("🔍 Profile query result:", {
      profile,
      profileError,
      userId: user.id,
    })

    if (profileError) {
      console.log("❌ Profile error:", profileError)

      // If profile doesn't exist, create it
      if (profileError.code === "PGRST116") {
        console.log("🔧 Creating missing profile...")

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || "",
            display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "",
            role: "admin", // Set as admin for this specific user
          })
          .select()
          .single()

        if (insertError) {
          console.log("❌ Error creating profile:", insertError)
          return false
        }

        console.log("✅ Profile created:", newProfile)
        return newProfile.role === "admin"
      }

      return false
    }

    if (!profile) {
      console.log("❌ No profile found for user ID:", user.id)
      return false
    }

    console.log("✅ Profile found:", {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    })

    return profile.role === "admin"
  } catch (error) {
    console.error("❌ Error checking admin access:", error)
    return false
  }
}

export async function checkCoachAccess(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return false
    }

    // Check user role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return false
    }

    return profile.role === "coach" || profile.role === "admin"
  } catch (error) {
    console.error("Error checking coach access:", error)
    return false
  }
}

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
    error,
  } = await (await supabase).auth.getSession()

  if (error || !session || !session.user) {
    console.log("No session or user:", { error, session })
    return null
  }

  return session.user
}


export async function ensureUserProfile(userId: string, email: string, displayName?: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if profile exists
    const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (!existingProfile) {
      // Create profile
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          display_name: displayName || email.split("@")[0],
          role: email === "cheerleadingindonesiaweb@gmail.com" ? "admin" : "user",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating profile:", error)
        return null
      }

      return newProfile
    }

    return existingProfile
  } catch (error) {
    console.error("Error ensuring user profile:", error)
    return null
  }
}




/**
 * Get the current logged-in user on the client side.
 * Uses Supabase session and localStorage fallback.
 */
export async function getClientUser(): Promise<User | null> {
  // Optional: try from localStorage cache first
  const supabase = await createServerSupabaseClient()
  const cached = localStorage.getItem("user")
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (parsed?.id) return parsed as User
    } catch (err) {
      console.warn("⚠️ Failed to parse local user cache", err)
    }
  }

  // Get session from Supabase
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session?.user) {
    console.log("❌ No Supabase session or user found", error)
    return null
  }

  // Cache in localStorage for next time
  localStorage.setItem("user", JSON.stringify(session.user))

  return session.user
}
