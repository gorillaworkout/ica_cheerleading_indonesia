"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Camera, FileImage, Clock, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface PhotoStats {
  totalChanges: number
  profilePhotoChanges: number
  idPhotoChanges: number
  lastChangeDate?: string
  lastChangeType?: string
  hasRecentChanges: boolean
  averageFileSize: number
  mostCommonFileType: string
}

interface PhotoStatsProps {
  userId: string
  className?: string
}

export function PhotoStats({ userId, className = "" }: PhotoStatsProps) {
  const [stats, setStats] = useState<PhotoStats>({
    totalChanges: 0,
    profilePhotoChanges: 0,
    idPhotoChanges: 0,
    hasRecentChanges: false,
    averageFileSize: 0,
    mostCommonFileType: 'Unknown'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchPhotoStats()
    }
  }, [userId])

  const fetchPhotoStats = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Get all photo history for this user
      const { data, error } = await supabase
        .from("photo_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch photo stats:", error)
        return
      }

      const photoHistory = data || []
      
      // Calculate stats
      const totalChanges = photoHistory.length
      const profilePhotoChanges = photoHistory.filter(p => p.photo_type === 'profile_photo').length
      const idPhotoChanges = photoHistory.filter(p => p.photo_type === 'id_photo').length
      
      const lastChange = photoHistory[0]
      const lastChangeDate = lastChange?.created_at
      const lastChangeType = lastChange?.photo_type
      
      // Check if there are changes in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const hasRecentChanges = photoHistory.some(p => 
        new Date(p.created_at) > thirtyDaysAgo
      )
      
      // Calculate average file size
      const totalFileSize = photoHistory.reduce((sum, p) => sum + p.file_size, 0)
      const averageFileSize = totalChanges > 0 ? totalFileSize / totalChanges : 0
      
      // Find most common file type
      const fileTypeCounts: { [key: string]: number } = {}
      photoHistory.forEach(p => {
        const fileType = p.file_type.split('/')[1]?.toUpperCase() || 'Unknown'
        fileTypeCounts[fileType] = (fileTypeCounts[fileType] || 0) + 1
      })
      
      const mostCommonFileType = Object.entries(fileTypeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'

      setStats({
        totalChanges,
        profilePhotoChanges,
        idPhotoChanges,
        lastChangeDate,
        lastChangeType,
        hasRecentChanges,
        averageFileSize,
        mostCommonFileType
      })
    } catch (error) {
      console.error("Error fetching photo stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getPhotoTypeDisplayName = (photoType: string) => {
    switch (photoType) {
      case 'profile_photo': return 'Foto Profil'
      case 'id_photo': return 'Foto KTP'
      default: return photoType
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Changes */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Perubahan</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalChanges}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.hasRecentChanges ? (
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Aktif 30 hari terakhir</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Tidak ada perubahan baru</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Photo Changes */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Foto Profil</p>
                <p className="text-2xl font-bold text-green-900">{stats.profilePhotoChanges}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.profilePhotoChanges > 0 ? (
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Sudah diubah {stats.profilePhotoChanges} kali</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Belum pernah diubah</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <FileImage className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ID Photo Changes */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Foto KTP</p>
                <p className="text-2xl font-bold text-red-900">{stats.idPhotoChanges}</p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.idPhotoChanges > 0 ? (
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Sudah diubah {stats.idPhotoChanges} kali</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Belum pernah diubah</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <FileImage className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      {stats.totalChanges > 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Detail</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Perubahan Terakhir:</span>
                <p className="font-medium">
                  {stats.lastChangeDate ? (
                    format(new Date(stats.lastChangeDate), "PPp", { locale: id })
                  ) : (
                    "Tidak ada"
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Jenis Terakhir:</span>
                <p className="font-medium">
                  {stats.lastChangeType ? getPhotoTypeDisplayName(stats.lastChangeType) : "Tidak ada"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Ukuran Rata-rata:</span>
                <p className="font-medium">{formatFileSize(stats.averageFileSize)}</p>
              </div>
              <div>
                <span className="text-gray-500">Format Terbanyak:</span>
                <p className="font-medium">{stats.mostCommonFileType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
