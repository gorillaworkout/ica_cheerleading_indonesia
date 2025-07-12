// components/auth/auth-init.tsx
"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAppDispatch } from "@/lib/redux/hooks"
import {
  fetchSessionAndProfile,
  setAuthState,
  clearProfile,
} from "@/features/auth/authSlice"

export function AuthInit() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchSessionAndProfile()) // initial fetch on mount

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          dispatch(setAuthState({ session, user: session.user }))
          dispatch(fetchSessionAndProfile())
        } else {
          dispatch(setAuthState({ session: null, user: null }))
          dispatch(clearProfile())
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return null // ⛔ No JSX here
}
