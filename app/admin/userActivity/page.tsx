'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from "@/lib/redux/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Eye,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserActivity {
  user_id: string
  user_email: string
  user_name: string
  user_role: string
  total_changes: number
  profile_changes: number
  coach_changes: number
  last_activity: string
  most_changed_field: string
  activity_trend: 'increasing' | 'stable' | 'decreasing'
}

export default function UserActivityDashboard() {
  const profile = useAppSelector((state) => state.auth?.profile)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [timeRange, setTimeRange] = useState('30') // days
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalChanges: 0,
    avgChangesPerUser: 0
  })

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
    fetchUserActivities()
  }, [timeRange])

  const fetchUserActivities = async () => {
    setLoading(true)
    try {
      // Get user activities with aggregated data
      const { data: auditData, error } = await supabase
        .from('audit_logs')
        .select(`
          user_id,
          table_name,
          action_type,
          created_at,
          changed_fields
        `)
        .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      // Get user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name, role')

      if (profilesError) throw profilesError

      // Process and aggregate data
      const userActivities = processUserActivities(auditData || [], profilesData || [])
      setActivities(userActivities)
      
      // Calculate statistics
      const totalUsers = profilesData?.length || 0
      const activeUsers = userActivities.filter(u => u.total_changes > 0).length
      const totalChanges = userActivities.reduce((sum, u) => sum + u.total_changes, 0)
      const avgChangesPerUser = activeUsers > 0 ? Math.round(totalChanges / activeUsers) : 0

      setStats({
        totalUsers,
        activeUsers,
        totalChanges,
        avgChangesPerUser
      })

    } catch (error) {
      console.error('Error fetching user activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const processUserActivities = (auditData: any[], profilesData: any[]): UserActivity[] => {
    const userMap = new Map()

    // Initialize users
    profilesData.forEach(profile => {
      userMap.set(profile.id, {
        user_id: profile.id,
        user_email: profile.email,
        user_name: profile.display_name || profile.email.split('@')[0],
        user_role: profile.role,
        total_changes: 0,
        profile_changes: 0,
        coach_changes: 0,
        last_activity: null,
        changed_fields: {}
      })
    })

    // Process audit logs
    auditData.forEach(log => {
      const user = userMap.get(log.user_id)
      if (user) {
        user.total_changes++
        
        if (log.table_name === 'profiles') user.profile_changes++
        if (log.table_name === 'coaches') user.coach_changes++
        
        if (!user.last_activity || new Date(log.created_at) > new Date(user.last_activity)) {
          user.last_activity = log.created_at
        }

        // Count changed fields
        if (log.changed_fields) {
          log.changed_fields.forEach((field: string) => {
            user.changed_fields[field] = (user.changed_fields[field] || 0) + 1
          })
        }
      }
    })

    // Convert to array and add derived fields
    return Array.from(userMap.values()).map(user => ({
      ...user,
      most_changed_field: getMostChangedField(user.changed_fields),
      activity_trend: calculateTrend(user.total_changes) // Simplified
    }))
  }

  const getMostChangedField = (changedFields: Record<string, number>): string => {
    const entries = Object.entries(changedFields)
    if (entries.length === 0) return 'None'
    
    const [field] = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
    return field
  }

  const calculateTrend = (totalChanges: number): 'increasing' | 'stable' | 'decreasing' => {
    // Simplified trend calculation
    if (totalChanges > 10) return 'increasing'
    if (totalChanges > 3) return 'stable'
    return 'decreasing'
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || activity.user_role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Activity Dashboard</h1>
            <p className="text-gray-600">Monitor user profile changes and activity patterns</p>
          </div>
        </div>
      </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Changes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalChanges}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Changes/User</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgChangesPerUser}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-red-400 focus:ring-red-400"
                    />
                  </div>
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="athlete">Athletes</option>
                  <option value="coach">Coaches</option>
                  <option value="judge">Judges</option>
                  <option value="admin">Admins</option>
                </select>

                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* User Activities Table */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2 text-xl text-gray-900">
                <Activity className="h-5 w-5 text-red-600" />
                <span>User Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="text-gray-600 mt-4">Loading user activities...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-gray-700">User</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-700">Role</th>
                        <th className="text-center py-4 px-6 font-medium text-gray-700">Total Changes</th>
                        <th className="text-center py-4 px-6 font-medium text-gray-700">Profile Changes</th>
                        <th className="text-center py-4 px-6 font-medium text-gray-700">Coach Changes</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-700">Most Changed Field</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-700">Last Activity</th>
                        <th className="text-center py-4 px-6 font-medium text-gray-700">Trend</th>
                        <th className="text-center py-4 px-6 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredActivities.map((activity) => (
                        <tr key={activity.user_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-gray-900">{activity.user_name}</div>
                              <div className="text-sm text-gray-500">{activity.user_email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge 
                              variant="secondary"
                              className={
                                activity.user_role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                                activity.user_role === 'coach' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                activity.user_role === 'judge' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              }
                            >
                              {activity.user_role}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`font-semibold ${
                              activity.total_changes > 10 ? 'text-red-600' :
                              activity.total_changes > 5 ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {activity.total_changes}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center text-gray-900">{activity.profile_changes}</td>
                          <td className="py-4 px-6 text-center text-gray-900">{activity.coach_changes}</td>
                          <td className="py-4 px-6">
                            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                              {activity.most_changed_field}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {activity.last_activity ? (
                              <span className="text-sm text-gray-600">
                                {new Date(activity.last_activity).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">No activity</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Badge 
                              variant="outline"
                              className={
                                activity.activity_trend === 'increasing' ? 'border-red-200 text-red-700 bg-red-50' :
                                activity.activity_trend === 'stable' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                'border-gray-200 text-gray-700 bg-gray-50'
                              }
                            >
                              {activity.activity_trend}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/admin/userActivity/${activity.user_id}`, '_blank')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredActivities.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No user activities found.</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  )
}