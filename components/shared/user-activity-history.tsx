"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuditService } from "@/lib/audit"
import { History, ChevronDown, ChevronUp, Calendar, User, FileText, Activity } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Image from "next/image"
import { generateStorageUrl } from "@/utils/getPublicImageUrl"

interface AuditLog {
  id: string
  table_name: string
  action_type: string
  changed_fields: string[]
  created_at: string
  old_data: any
  new_data: any
  ip_address?: string
}

interface UserActivityHistoryProps {
  userId: string
  isAdmin?: boolean
  showUserInfo?: boolean
  userProfile?: {
    id: string
    email: string
    display_name: string
    role: string
  }
  className?: string
  title?: string
  description?: string
  showFilter?: boolean
  showPagination?: boolean
  limit?: number
  imageSize?: 'small' | 'medium' | 'large'
  variant?: 'profile' | 'admin' | 'default'
}

export function UserActivityHistory({ 
  userId, 
  isAdmin = false, 
  showUserInfo = false,
  userProfile,
  className = "",
  title,
  description,
  showFilter = true,
  showPagination = true,
  limit = 10,
  imageSize = 'medium',
  variant = 'default'
}: UserActivityHistoryProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [tableFilter, setTableFilter] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  // Fix hydration error by ensuring component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userId && mounted) {
      fetchAuditHistory()
    }
  }, [userId, page, tableFilter, mounted])

  const fetchAuditHistory = async () => {
    if (!userId) return

    setLoading(true)
    try {
      console.log('Fetching audit history for user:', userId, 'page:', page, 'filter:', tableFilter)
      
      const result = await AuditService.getUserAuditHistory(
        userId, 
        page, 
        limit, 
        tableFilter || undefined
      )
      
      console.log('Audit history result:', result)
      
      setAuditLogs(result.data || [])
      setTotalCount(result.count || 0)
    } catch (error) {
      console.error("Failed to fetch audit history:", error)
      // Set empty state on error
      setAuditLogs([])
      setTotalCount(0)
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

  const getFieldDisplayName = (fieldName: string): string => {
    const fieldMappings: { [key: string]: string } = {
      'full_name': 'Nama Lengkap',
      'first_name': 'Nama Depan',
      'last_name': 'Nama Belakang',
      'nickname': 'Nama Panggilan',
      'date_of_birth': 'Tanggal Lahir',
      'gender': 'Jenis Kelamin',
      'phone_number': 'Nomor Telepon',
      'address': 'Alamat',
      'city': 'Kota',
      'province': 'Provinsi',
      'postal_code': 'Kode Pos',
      'emergency_contact': 'Kontak Darurat',
      'emergency_phone': 'Nomor Telepon Darurat',
      'blood_type': 'Golongan Darah',
      'allergies': 'Alergi',
      'medical_conditions': 'Kondisi Medis',
      'id_photo_url': 'Foto KTP',
      'profile_photo_url': 'Foto Profil',
      'certifications': 'Sertifikasi',
      'achievements': 'Pencapaian',
      'experience_years': 'Tahun Pengalaman',
      'specialization': 'Spesialisasi',
      'bio': 'Biografi',
      'social_media': 'Media Sosial',
      'website': 'Website'
    }
    
    return fieldMappings[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Get image dimensions based on size prop
  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small':
        return { width: 60, height: 60 }
      case 'large':
        return { width: 120, height: 120 }
      case 'medium':
      default:
        return { width: 80, height: 80 }
    }
  }

  const formatFieldValue = (value: any, fieldName: string): React.ReactNode => {
    if (value === null || value === undefined) return "Belum ada data"
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "Tidak ada data"
    if (typeof value === 'boolean') return value ? "Aktif" : "Tidak aktif"
    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        return "Tidak ada data"
      }
      return JSON.stringify(value)
    }
    
    const stringValue = String(value)
    
    // Handle image URLs
    if (fieldName.includes('photo') || fieldName.includes('image')) {
      if (stringValue && stringValue !== 'null' && stringValue !== 'undefined') {
        try {
          const imageUrl = generateStorageUrl(stringValue)
          const imageType = fieldName.includes('id_photo') ? 'Foto KTP' : 'Foto Profil'
          const { width, height } = getImageDimensions()
          
          return (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Image 
                  src={imageUrl} 
                  alt={imageType} 
                  width={width} 
                  height={height} 
                  className="rounded-lg object-cover border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <span className="text-sm font-medium text-gray-700">{imageType}</span>
              </div>
              {/* <div className="text-xs text-gray-500 break-all">
                {stringValue}
              </div> */}
            </div>
          )
        } catch (error) {
          console.error("Error formatting image field:", error, "value:", stringValue)
          return "Foto tidak dapat ditampilkan"
        }
      }
      
      const { width, height } = getImageDimensions()
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div 
              className="bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <span className="text-xs text-gray-500 text-center">Tidak ada foto</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {fieldName.includes('id_photo') ? 'Foto KTP' : 'Foto Profil'}
            </span>
          </div>
        </div>
      )
    }
    
    // Handle sensitive data - only mask for non-admin users
    if (!isAdmin) {
      if (stringValue.includes('@') && stringValue.includes('.')) {
        // Mask email addresses for privacy
        const [localPart, domain] = stringValue.split('@')
        if (localPart.length > 2) {
          return `${localPart.substring(0, 2)}***@${domain}`
        }
        return `***@${domain}`
      }
      
      if (stringValue.length > 10 && /^\d+$/.test(stringValue)) {
        // Mask long numbers (like phone numbers, IDs) for privacy
        return `${stringValue.substring(0, 3)}***${stringValue.substring(stringValue.length - 3)}`
      }
    }
    
    return stringValue
  }

  const getUserFriendlyDescription = (log: AuditLog): string => {
    const { table_name, action_type, changed_fields } = log
    
    // Fields that are user-relevant and should be shown (excluding non-editable fields)
    const userRelevantFields = [
      'full_name', 'first_name', 'last_name', 'nickname', 'date_of_birth', 
      'gender', 'phone_number', 'address', 'city', 'province', 'postal_code',
      'emergency_contact', 'emergency_phone', 'blood_type', 'allergies', 
      'medical_conditions', 'id_photo_url', 'profile_photo_url', 'certifications',
      'achievements', 'experience_years', 'specialization', 'bio', 'social_media', 'website'
    ]
    
    // Fields that should be hidden (non-editable or system fields) - only for non-admin users
    const hiddenFields = isAdmin ? [] : [
      'email', 'member_code', 'id_card', 'is_deleted', 'age', 'team_id', 'division_id',
      'is_verified', 'is_edit_allowed', 'created_at', 'updated_at', 'id', 'user_id', 
      'role', 'email_verified_at', 'phone_verified_at', 'verification_token', 
      'reset_token', 'last_login_at', 'login_count', 'status', 'deleted_at'
    ]
    
    // Filter only user-relevant fields and exclude hidden fields
    const relevantChanges = changed_fields?.filter((field: string) => 
      userRelevantFields.includes(field) && !hiddenFields.includes(field)
    ) || []
    
    if (relevantChanges.length === 0 && !isAdmin) {
      return "Perubahan sistem atau field yang tidak dapat diubah"
    }
    
    const fieldNames = relevantChanges.map(field => getFieldDisplayName(field))
    
    switch (action_type) {
      case 'CREATE':
        return `Profil ${getTableDisplayName(table_name)} dibuat`
      case 'UPDATE':
        if (fieldNames.length === 1) {
          return `Mengubah ${fieldNames[0].toLowerCase()}`
        } else if (fieldNames.length <= 3) {
          return `Mengubah ${fieldNames.join(', ').toLowerCase()}`
        } else {
          return `Mengubah ${fieldNames.length} informasi profil`
        }
      case 'DELETE':
        return `Profil ${getTableDisplayName(table_name)} dihapus`
      default:
        return `Memodifikasi ${getTableDisplayName(table_name)}`
    }
  }

  // Get default title and description based on variant
  const getDefaultTitle = () => {
    switch (variant) {
      case 'profile':
        return 'Riwayat Profil'
      case 'admin':
        return 'Activity Timeline'
      default:
        return isAdmin ? 'Activity Timeline' : 'Riwayat Akun'
    }
  }

  const getDefaultDescription = () => {
    switch (variant) {
      case 'profile':
        return 'Lacak perubahan yang dilakukan pada informasi profil'
      case 'admin':
        return 'Lacak semua perubahan yang dilakukan oleh user ini'
      default:
        return isAdmin 
          ? 'Lacak semua perubahan yang dilakukan oleh user ini' 
          : 'Lacak perubahan yang dilakukan pada informasi profil yang dapat diubah'
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={className}>
        <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Memuat...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* User Info Section - Only show for admin */}
      {showUserInfo && userProfile && (
        <div className="mb-8">
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

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Changes</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
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
                      {auditLogs.filter(a => a.table_name === 'profiles').length}
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
                      {auditLogs.filter(a => a.table_name === 'coaches').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
          <CardTitle className="flex items-center space-x-3 text-red-700">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <History className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl">
              {title || getDefaultTitle()}
            </span>
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {description || getDefaultDescription()}
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filter Section */}
          {showFilter && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter berdasarkan bagian:
              </label>
              <select
                value={tableFilter}
                onChange={(e) => {
                  setTableFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 focus:border-red-400 focus:ring-red-400 focus:outline-none"
              >
                <option value="">Semua perubahan</option>
                <option value="profiles">Perubahan profil</option>
                <option value="coaches">Perubahan profil pelatih</option>
              </select>
            </div>
          )}

          {/* History List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="mt-2 text-gray-600">Memuat riwayat perubahan...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {isAdmin 
                    ? 'Belum ada aktivitas untuk user ini' 
                    : 'Belum ada perubahan pada informasi profil yang dapat diubah'
                  }
                </p>
              </div>
            ) : (
              auditLogs.map((log) => {
                try {
                  const isExpanded = expandedItems.has(log.id)
                  const changeDetails = AuditService.getChangeDetails(log)
                  console.log(changeDetails, 'change details')
                  const changeDescription = getUserFriendlyDescription(log)
                  
                  // Skip logs that have no public changes to show (only for non-admin)
                  if (!isAdmin && log.action_type === 'UPDATE' && changeDetails.length === 0) {
                    return null
                  }
                  
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
                            {changeDescription}
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
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Detail perubahan:</h4>
                        <div className="space-y-2">
                          {changeDetails.map((detail, index) => (
                            <div key={index} className="bg-gray-50 rounded p-3">
                              <div className="text-sm font-medium text-gray-600 mb-1">
                                {getFieldDisplayName(detail.field)}
                              </div>
                              <div className={`grid gap-3 text-sm ${
                                (detail.field.includes('photo') || detail.field.includes('image')) 
                                  ? 'grid-cols-1' 
                                  : 'grid-cols-1 md:grid-cols-2'
                              }`}>
                                <div>
                                  <span className="text-gray-500">Sebelumnya:</span>
                                  <div className="bg-red-50 border border-red-200 rounded px-3 py-2 mt-1">
                                    {(() => {
                                      try {
                                        return formatFieldValue(detail.oldValue, detail.field)
                                      } catch (error) {
                                        console.error("Error formatting old value:", error, detail)
                                        return "Error: Tidak dapat menampilkan data"
                                      }
                                    })()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Sekarang:</span>
                                  <div className="bg-green-50 border border-green-200 rounded px-3 py-2 mt-1">
                                    {(() => {
                                      try {
                                        return formatFieldValue(detail.newValue, detail.field)
                                      } catch (error) {
                                        console.error("Error formatting new value:", error, detail)
                                        return "Error: Tidak dapat menampilkan data"
                                      }
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* IP Address - Only show for admin */}
                        {isAdmin && log.ip_address && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">IP Address:</span> {log.ip_address}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
                } catch (error) {
                  console.error("Error rendering audit log:", error, log)
                  return (
                    <div key={log.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <p className="text-red-600">Error: Tidak dapat menampilkan detail perubahan ini</p>
                    </div>
                  )
                }
              }).filter(Boolean) // Remove null entries
            )}
          </div>

          {/* Pagination */}
          {showPagination && totalCount > limit && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Menampilkan {((page - 1) * limit) + 1} sampai {Math.min(page * limit, totalCount)} dari {totalCount} riwayat perubahan
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= totalCount}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
