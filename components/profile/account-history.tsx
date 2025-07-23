"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuditService } from "@/lib/audit"
import { useAppSelector } from "@/lib/redux/hooks"
import { History, ChevronDown, ChevronUp, Calendar, User, FileText } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface AuditLog {
  id: string
  table_name: string
  action_type: string
  changed_fields: string[]
  created_at: string
  old_data: any
  new_data: any
}

export function AccountHistory() {
  const { user } = useAppSelector((state) => state.auth)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [tableFilter, setTableFilter] = useState<string>("")

  const limit = 10

  useEffect(() => {
    if (user?.id) {
      fetchAuditHistory()
    }
  }, [user?.id, page, tableFilter])

  const fetchAuditHistory = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const result = await AuditService.getUserAuditHistory(
        user.id, 
        page, 
        limit, 
        tableFilter || undefined
      )
      
      setAuditLogs(result.data || [])
      setTotalCount(result.count || 0)
    } catch (error) {
      console.error("Failed to fetch audit history:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedItems(newExpanded)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700 border-green-200'
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTableDisplayName = (tableName: string) => {
    switch (tableName) {
      case 'profiles': return 'Profile'
      case 'coaches': return 'Coach Profile'
      case 'auth.users': return 'Account'
      default: return tableName
    }
  }

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return "Not set"
    if (Array.isArray(value)) return value.join(", ")
    if (typeof value === 'boolean') return value ? "Yes" : "No"
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
        <CardTitle className="flex items-center space-x-3 text-red-700">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <History className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl">Account History</span>
        </CardTitle>
        <p className="text-gray-600 mt-2">Track all changes made to your account</p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Filter Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by section:
          </label>
          <select
            value={tableFilter}
            onChange={(e) => {
              setTableFilter(e.target.value)
              setPage(1)
            }}
            className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 focus:border-red-400 focus:ring-red-400 focus:outline-none"
          >
            <option value="">All changes</option>
            <option value="profiles">Profile changes</option>
            <option value="coaches">Coach profile changes</option>
          </select>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Loading history...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No changes recorded yet</p>
            </div>
          ) : (
            auditLogs.map((log) => {
              const isExpanded = expandedItems.has(log.id)
              const changeDetails = AuditService.getChangeDetails(log)
              
              return (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getActionColor(log.action_type)} font-medium`}>
                        {log.action_type}
                      </Badge>
                      <div>
                        <p className="font-medium text-gray-900">
                          {AuditService.getChangeDescription(log)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(log.created_at), "PPp", { locale: id })}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{getTableDisplayName(log.table_name)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {changeDetails.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(log.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && changeDetails.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Changes made:</h4>
                      <div className="space-y-2">
                        {changeDetails.map((detail, index) => (
                          <div key={index} className="bg-gray-50 rounded p-3">
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              {detail.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500">From:</span>
                                <div className="bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                                  {formatFieldValue(detail.oldValue)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">To:</span>
                                <div className="bg-green-50 border border-green-200 rounded px-2 py-1 mt-1">
                                  {formatFieldValue(detail.newValue)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalCount > limit && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} changes
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
