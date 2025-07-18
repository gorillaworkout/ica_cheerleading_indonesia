"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAppDispatch } from "@/lib/redux/hooks"
import {
  fetchSessionAndProfile,
  setAuthState,
  clearProfile,
} from "@/features/auth/authSlice"
import { fetchPublicImages } from "@/features/publicImages/publicImagesSlice"
import { fetchDivisions } from "@/features/divisions/divisionsSlice"
import { fetchCompetitions } from "@/features/competitions/competitionsSlice"
import { fetchNews } from "@/features/news/newsSlice"
import { debugEnvironment, debugSupabaseConnection } from "@/utils/debug"

export function AuthInit() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Debug environment on app start
    console.log('🚀 AuthInit starting...');
    debugEnvironment();
    debugSupabaseConnection();
    
    // Initial fetch on component mount
    dispatch(fetchSessionAndProfile())
    dispatch(fetchPublicImages())
    dispatch(fetchDivisions())
    dispatch(fetchCompetitions()) // Fetch competitions using Redux
    dispatch(fetchNews()) // Fetch news using Redux

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          console.log("SIGNED IN 22 auth-init")
          dispatch(setAuthState({ session, user: session.user }))
          dispatch(fetchSessionAndProfile())
          dispatch(fetchPublicImages())
          dispatch(fetchDivisions())
          dispatch(fetchCompetitions())
          dispatch(fetchNews())
        } else if (event === "SIGNED_OUT") {
          console.log("SIGNED OUT 26 auth-init")
          dispatch(setAuthState({ session: null, user: null }))
          dispatch(clearProfile())
          dispatch(fetchPublicImages())
        }
        // You can handle other events if needed
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return null // no UI needed here
}
