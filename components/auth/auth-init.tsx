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

export function AuthInit() {
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const [isClientMounted, setIsClientMounted] = useState(false)

  useEffect(() => {
    // Debug environment on app start
    console.log('🚀 AuthInit starting...');
    debugEnvironment();
    debugSupabaseConnection();
    
    setIsClientMounted(true)
  }, [])

  useEffect(() => {
    if (!isClientMounted) return

    // ✅ CRITICAL FIX: Check for recovery token before doing anything
    const isRecoveryFlow = () => {
      const hash = window.location.hash
      const isResetPage = pathname === '/reset-password'
      const hasRecoveryToken = hash.includes('access_token=') && hash.includes('type=recovery')
      
      console.log('🔍 Recovery flow check:', {
        pathname,
        isResetPage,
        hasRecoveryToken,
        hash: hash ? 'Present' : 'Empty'
      })
      
      return isResetPage && hasRecoveryToken
    }
    
    // ✅ Skip auth initialization if we're in recovery flow
    if (isRecoveryFlow()) {
      console.log('⏭️ Skipping AuthInit for recovery flow - let reset page handle it')
      
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
          console.log('⏭️ Skipping auth state change during recovery flow')
          return
        }
        
        if (event === "SIGNED_IN" && session?.user) {
          console.log("SIGNED IN 22 auth-init")
          dispatch(setAuthState({ session, user: session.user }))
          dispatch(fetchSessionAndProfile())
          dispatch(fetchPublicImages())
          dispatch(fetchDivisions())
          dispatch(fetchCompetitions())
          dispatch(fetchNews())
          dispatch(fetchProvinces())
          dispatch(fetchCoaches())
          dispatch(fetchFeaturedCoaches())
        } else if (event === "SIGNED_OUT") {
          console.log("SIGNED OUT 26 auth-init")
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
