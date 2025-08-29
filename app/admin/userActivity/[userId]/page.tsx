'use client'

import { use, useState, useEffect } from 'react'
import { useAppSelector } from "@/lib/redux/hooks"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  User,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { UserActivityHistory } from '@/components/shared/user-activity-history'

interface UserProfile {
  id: string
  email: string
  display_name: string
  role: string
}

interface UserActivityDetailPageProps {
  params: Promise<{ userId: string }>
}

export default function UserActivityDetail({ params }: UserActivityDetailPageProps) {
  const profile = useAppSelector((state) => state.auth?.profile)
  const resolvedParams = use(params)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchUserData()
  }, [resolvedParams.userId])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name, role')
        .eq('id', resolvedParams.userId)
        .single()

      if (profileError) throw profileError
      setUserProfile(profileData)

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-gray-600 mt-4">Loading user activity...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <Link href="/admin/userActivity">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/userActivity">
          <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* User Activity History Component */}
      <UserActivityHistory
        userId={resolvedParams.userId}
        isAdmin={true}
        showUserInfo={true}
        userProfile={userProfile}
      />
    </div>
  )
}
