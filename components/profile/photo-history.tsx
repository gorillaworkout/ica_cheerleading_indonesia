"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { History, Camera, FileImage, Download, Eye, Calendar, User, AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Image from "next/image"
import { generateStorageUrl } from "@/utils/getPublicImageUrl"
import { PhotoStats } from "./photo-stats"

interface PhotoHistoryEntry {
  id: string
  user_id: string
  photo_type: 'profile_photo' | 'id_photo'
  old_photo_url?: string | null
  new_photo_url: string
  file_hash: string
  file_size: number
  file_name: string
  file_type: string
  change_reason?: string
  ip_address?: string | null
  user_agent?: string
  created_at: string
}

interface PhotoHistoryProps {
  userId: string
  className?: string
}

export function PhotoHistory({ userId, className = "" }: PhotoHistoryProps) {
  const [photoHistory, setPhotoHistory] = useState<PhotoHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [photoTypeFilter, setPhotoTypeFilter] = useState<string>("")

  useEffect(() => {
    if (userId) {
      fetchPhotoHistory()
    }
  }, [userId, photoTypeFilter])

  const fetchPhotoHistory = async () => {
    if (!userId) return

    setLoading(true)
    try {
      let query = supabase
        .from("photo_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (photoTypeFilter) {
        query = query.eq("photo_type", photoTypeFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error("Failed to fetch photo history:", error)
        throw error
      }

      setPhotoHistory(data || [])
    } catch (error) {
      console.error("Error fetching photo history:", error)
      setPhotoHistory([])
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedItems(newExpanded)
  }

  const getPhotoTypeColor = (photoType: string) => {
    switch (photoType) {
      case 'profile_photo': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'id_photo': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPhotoTypeDisplayName = (photoType: string) => {
    switch (photoType) {
      case 'profile_photo': return 'Foto Profil'
      case 'id_photo': return 'Foto KTP'
      default: return photoType
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeDisplayName = (fileType: string) => {
    switch (fileType) {
      case 'image/jpeg': return 'JPEG'
      case 'image/jpg': return 'JPG'
      case 'image/png': return 'PNG'
      case 'image/webp': return 'WebP'
      case 'image/gif': return 'GIF'
      default: return fileType.split('/')[1]?.toUpperCase() || fileType
    }
  }

  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const url = generateStorageUrl(imageUrl)
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const viewImage = (imageUrl: string) => {
    try {
      const url = generateStorageUrl(imageUrl)
      window.open(url, '_blank')
    } catch (error) {
      console.error("Error viewing image:", error)
    }
  }

  return (
    <div className={className}>
      {/* Photo Statistics */}
      <PhotoStats userId={userId} className="mb-6" />
      
      <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
          <CardTitle className="flex items-center space-x-3 text-red-700">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl">Riwayat Perubahan Foto</span>
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Lacak semua perubahan foto profil dan dokumen identitas
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filter Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter berdasarkan jenis foto:
            </label>
            <select
              value={photoTypeFilter}
              onChange={(e) => setPhotoTypeFilter(e.target.value)}
              className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 focus:border-red-400 focus:ring-red-400 focus:outline-none"
            >
              <option value="">Semua foto</option>
              <option value="profile_photo">Foto Profil</option>
              <option value="id_photo">Foto KTP</option>
            </select>
          </div>

          {/* Photo History List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="mt-2 text-gray-600">Memuat riwayat foto...</p>
              </div>
            ) : photoHistory.length === 0 ? (
              <div className="text-center py-8">
                <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  Belum ada perubahan foto yang tercatat
                </p>
              </div>
            ) : (
              photoHistory.map((entry) => {
                const isExpanded = expandedItems.has(entry.id)
                
                return (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getPhotoTypeColor(entry.photo_type)} font-medium`}>
                          {getPhotoTypeDisplayName(entry.photo_type)}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.change_reason || `Mengganti ${getPhotoTypeDisplayName(entry.photo_type)}`}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(entry.created_at), "PPp", { locale: id })}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FileImage className="h-3 w-3" />
                              <span>{entry.file_name}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(entry.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? "Sembunyikan" : "Detail"}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Old Photo */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                              <span>Foto Sebelumnya</span>
                              {entry.old_photo_url ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </h4>
                            {entry.old_photo_url ? (
                              <div className="space-y-2">
                                <div className="relative">
                                  <Image
                                    src={generateStorageUrl(entry.old_photo_url)}
                                    alt="Foto sebelumnya"
                                    width={200}
                                    height={150}
                                    className="rounded-lg object-cover border border-gray-200"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewImage(entry.old_photo_url!)}
                                    className="flex items-center space-x-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>Lihat</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadImage(entry.old_photo_url!, `old_${entry.file_name}`)}
                                    className="flex items-center space-x-1"
                                  >
                                    <Download className="h-3 w-3" />
                                    <span>Download</span>
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 rounded-lg p-4 text-center">
                                <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Tidak ada foto sebelumnya</p>
                              </div>
                            )}
                          </div>

                          {/* New Photo */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                              <span>Foto Baru</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </h4>
                            <div className="space-y-2">
                              <div className="relative">
                                <Image
                                  src={generateStorageUrl(entry.new_photo_url)}
                                  alt="Foto baru"
                                  width={200}
                                  height={150}
                                  className="rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewImage(entry.new_photo_url)}
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Lihat</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadImage(entry.new_photo_url, entry.file_name)}
                                  className="flex items-center space-x-1"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Download</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* File Information */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Informasi File</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Nama File:</span>
                              <p className="font-medium">{entry.file_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Ukuran:</span>
                              <p className="font-medium">{formatFileSize(entry.file_size)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Tipe File:</span>
                              <p className="font-medium">{getFileTypeDisplayName(entry.file_type)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Hash File:</span>
                              <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                                {entry.file_hash.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Technical Details */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Detail Teknis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Alasan Perubahan:</span>
                              <p className="font-medium">{entry.change_reason || 'Tidak disebutkan'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Waktu Perubahan:</span>
                              <p className="font-medium">
                                {format(new Date(entry.created_at), "PPpp", { locale: id })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
