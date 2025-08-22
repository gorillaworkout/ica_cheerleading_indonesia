"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAppDispatch } from "@/lib/redux/hooks"
import { fetchSessionAndProfile, setAuthState, clearProfile } from "@/features/auth/authSlice"
import { fetchPublicImages } from "@/features/publicImages/publicImagesSlice"
import { fetchDivisions } from "@/features/divisions/divisionsSlice"
import { fetchCompetitions } from "@/features/competitions/competitionsSlice"
import { fetchNews } from "@/features/news/newsSlice"
import { fetchProvinces } from "@/features/provinces/provincesSlice"
import { fetchCoaches, fetchFeaturedCoaches } from "@/features/coaches/coachesSlice"
import { fetchLicenseCourses } from "@/features/license-courses/licenseCoursesSlice"
import { debugEnvironment, debugSupabaseConnection } from "@/utils/debug"
import { usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function AuthInit() {
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const [isClientMounted, setIsClientMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Debug environment on app start

    debugEnvironment();
    debugSupabaseConnection();
    
    setIsClientMounted(true)
  }, [])

  useEffect(() => {
    if (!isClientMounted) return

    // 🔒 Global recovery redirect: jika ada token recovery di hash namun bukan di halaman reset-password,
    // paksa redirect ke /reset-password sambil mempertahankan hash (access_token & refresh_token)
    try {
      const hash = window.location.hash
      const hasRecoveryToken = hash.includes('access_token=') && hash.includes('type=recovery')
      const isOnResetPage = pathname === '/reset-password'
      if (hasRecoveryToken && !isOnResetPage) {
        window.location.replace(`/reset-password${hash}`)
        return
      }
    } catch {}

    // ✅ CRITICAL FIX: Check for recovery token before doing anything
    const isRecoveryFlow = () => {
      const hash = window.location.hash
      const isResetPage = pathname === '/reset-password'
      const hasRecoveryToken = hash.includes('access_token=') && hash.includes('type=recovery')
      
      return isResetPage && hasRecoveryToken
    }
    
    // ✅ Skip auth initialization if we're in recovery flow
    if (isRecoveryFlow()) {
      
      // Only fetch public data that doesn't require auth
      dispatch(fetchPublicImages())
      dispatch(fetchCoaches())
      dispatch(fetchFeaturedCoaches())
      dispatch(fetchLicenseCourses(true))
      
      return // Early return - don't set up auth state change listener
    }
    
    // Normal flow - Initial fetch on component mount
    dispatch(fetchSessionAndProfile())
    dispatch(fetchPublicImages())
    dispatch(fetchDivisions())
    dispatch(fetchCompetitions()) // Fetch competitions using Redux
    dispatch(fetchNews()) // Fetch news using Redux
    dispatch(fetchProvinces()) // Fetch provinces using Redux
    dispatch(fetchCoaches()) // Fetch coaches using Redux
    dispatch(fetchFeaturedCoaches()) // Fetch featured coaches using Redux
    dispatch(fetchLicenseCourses(true)) // Fetch license courses using Redux (active only)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // ✅ Skip auth state changes during recovery flow
        if (isRecoveryFlow()) {
          return
        }
        
        if (event === "SIGNED_IN" && session?.user) {
          dispatch(setAuthState({ session, user: session.user }))
          dispatch(fetchSessionAndProfile())
          dispatch(fetchPublicImages())
          dispatch(fetchDivisions())
          dispatch(fetchCompetitions())
          dispatch(fetchNews())
          dispatch(fetchProvinces())
          dispatch(fetchCoaches())
          dispatch(fetchFeaturedCoaches())
          dispatch(fetchLicenseCourses(true))

        } else if (event === "SIGNED_OUT") {
          // ✅ CRITICAL FIX: Check if user was auto-logged out due to deletion
          const wasAutoLoggedOut = localStorage.getItem("userWasDeleted")
          if (wasAutoLoggedOut === "true") {
            toast({
              title: "Akun Dihapus",
              description: "Akun kamu telah dihapus dan telah di-logout secara otomatis.",
              variant: "destructive",
            })
            localStorage.removeItem("userWasDeleted")
          }
          
          dispatch(setAuthState({ session: null, user: null }))
          dispatch(clearProfile())
          dispatch(fetchPublicImages())
          dispatch(fetchCoaches())
          dispatch(fetchFeaturedCoaches())
        }
        // You can handle other events if needed
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch, pathname, isClientMounted])

  return null // no UI needed here
}
