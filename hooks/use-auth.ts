"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const { user, session, loading, error, profile } = useAuthContext()
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const signInWithGoogle = async () => {
    setIsSigningIn(true)
    setAuthError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      // The redirect will happen automatically
    } catch (error: any) {
      console.error("Error signing in with Google:", error)

      let errorMessage = "Failed to sign in with Google"
      if (error.message) {
        errorMessage = error.message
      }

      setAuthError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsSigningIn(false)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    setIsSigningIn(true)
    setAuthError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push("/")
      return data
    } catch (error: any) {
      console.error("Error signing in with email:", error)
      setAuthError(error.message || "Failed to sign in")
      throw error
    } finally {
      setIsSigningIn(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setIsSigningIn(true)
    setAuthError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
          },
        },
      })
      console.log(data, 'data')
      
      if (error) {
        console.log(error, 'error 93 use auth')
        throw error
      }

      return data
    } catch (error: any) {
      console.error("Error signing up:", error)
      setAuthError(error.message || "Failed to sign up")
      throw error
    } finally {
      setIsSigningIn(false)
    }
  }

  const signOut = async () => {
    setIsSigningOut(true)
    setAuthError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      router.push("/")
    } catch (error: any) {
      console.error("Error signing out:", error)
      setAuthError("Failed to sign out")
      throw error
    } finally {
      setIsSigningOut(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      return true
    } catch (error: any) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  return {
    user,
    session,
    profile,
    loading,
    error: error || authError,
    isSigningIn,
    isSigningOut,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
  }
}


// import { useSelector, useDispatch } from "react-redux";
// import { useEffect } from "react";
// import type { RootState, AppDispatch } from "@/lib/store";
// import { fetchSessionAndProfile } from "@/features/auth/authSlice";

// export const useAuth = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const auth = useSelector((state: RootState) => state.auth);

//   useEffect(() => {
//     dispatch(fetchSessionAndProfile());
//   }, [dispatch]);

//   return auth;
// };