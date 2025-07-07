"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface Profile {
  id: string
  email: string
  display_name: string | null
  role: "admin" | "coach" | "user"
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  profile: Profile | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  profile: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setError(error.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchUserProfile(session.user.id, session.user.email || "")
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setError(error instanceof Error ? error.message : "Authentication error")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Supabase auth state changed:", event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)
      setError(null)

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || "")
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log("🔍 Fetching profile for user:", { userId, userEmail })

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error fetching profile:", error)
        return
      }

      if (!profile) {
        console.log("🔧 Creating missing profile for user:", userEmail)

        // Create profile if it doesn't exist
        const currentUser = await supabase.auth.getUser()
        const userData = currentUser.data.user

        if (userData) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              email: userEmail,
              display_name: userData.user_metadata?.display_name || userEmail.split("@")[0] || "",
              role: userEmail === "cheerleadingindonesiaweb@gmail.com" ? "admin" : "user",
            })
            .select()
            .single()

          if (insertError) {
            console.error("❌ Error creating profile:", insertError)
          } else {
            console.log("✅ Profile created:", newProfile)
            setProfile(newProfile)
          }
        }
      } else {
        console.log("✅ Profile found:", profile)
        setProfile(profile)
      }
    } catch (error) {
      console.error("❌ Error in fetchUserProfile:", error)
    }
  }

  return <AuthContext.Provider value={{ user, session, loading, error, profile }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
