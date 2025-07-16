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

export function AuthInit() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Initial fetch on component mount
    dispatch(fetchSessionAndProfile())
    dispatch(fetchPublicImages())
    dispatch(fetchDivisions())

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          console.log("SIGNED IN 22 auth-init")
          dispatch(setAuthState({ session, user: session.user }))
          dispatch(fetchSessionAndProfile())
          dispatch(fetchPublicImages())
          dispatch(fetchDivisions())
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
