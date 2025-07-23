'use client'

import { use, useState, useEffect } from 'react'
import { useAppSelector } from "@/lib/redux/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Clock,
  Edit,
  Database,
  User,
  Calendar,
  Activity,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface AuditDetail {
  id: string
  table_name: string
  action_type: string
  old_data: any
  new_data: any
  changed_fields: string[]
  created_at: string
  ip_address?: string
}

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
  const [activities, setActivities] = useState<AuditDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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

      // Get user audit history
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', resolvedParams.userId)
        .order('created_at', { ascending: false })

      if (auditError) throw auditError
      setActivities(auditData || [])

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    return activity.table_name === filter
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700 border-green-200'
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatFieldChanges = (oldData: any, newData: any, changedFields: string[]) => {
    if (!changedFields?.length) return null

    return changedFields.map(field => ({
      field,
      oldValue: oldData?.[field] || 'Not set',
      newValue: newData?.[field] || 'Not set'
    }))
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
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{userProfile.display_name}</h1>
                <p className="text-gray-600">{userProfile.email}</p>
              </div>
              <Badge 
                variant="outline"
                className={`${
                  userProfile.role === 'admin' ? 'border-red-200 text-red-700 bg-red-50' :
                  userProfile.role === 'coach' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                  userProfile.role === 'judge' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                  'border-gray-200 text-gray-700 bg-gray-50'
                } px-3 py-1`}
              >
                {userProfile.role}
              </Badge>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Changes</p>
                    <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Edit className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Changes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activities.filter(a => a.table_name === 'profiles').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Coach Changes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activities.filter(a => a.table_name === 'coaches').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card className="bg-white border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
                >
                  <option value="all">All Changes</option>
                  <option value="profiles">Profile Changes</option>
                  <option value="coaches">Coach Changes</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2 text-xl text-gray-900">
                <Clock className="h-5 w-5 text-red-600" />
                <span>Activity Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const fieldChanges = formatFieldChanges(
                    activity.old_data, 
                    activity.new_data, 
                    activity.changed_fields
                  )

                  return (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge className={getActionColor(activity.action_type)}>
                            {activity.action_type}
                          </Badge>
                          <span className="font-medium text-gray-900 capitalize">
                            {activity.table_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(activity.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {fieldChanges && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">Changed Fields:</p>
                          <div className="space-y-2">
                            {fieldChanges.map(({ field, oldValue, newValue }) => (
                              <div key={field} className="bg-gray-50 rounded-lg p-4">
                                <div className="font-medium text-gray-700 mb-2 capitalize">{field.replace('_', ' ')}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <span className="text-red-600 font-medium text-sm">Before:</span>
                                    <div className="text-gray-600 bg-white border border-red-200 rounded p-2 text-sm">
                                      {typeof oldValue === 'object' ? JSON.stringify(oldValue, null, 2) : String(oldValue)}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-green-600 font-medium text-sm">After:</span>
                                    <div className="text-gray-600 bg-white border border-green-200 rounded p-2 text-sm">
                                      {typeof newValue === 'object' ? JSON.stringify(newValue, null, 2) : String(newValue)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activity.ip_address && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">IP Address:</span> {activity.ip_address}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {filteredActivities.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No activities found for this filter.</p>
                    <p className="text-gray-400 text-sm">Try selecting a different filter option.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
    </div>
  )
}
