"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Camera, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from "lucide-react"
import Image from "next/image"

interface RegistrationData {
  email: string
  password: string
  displayName: string
  gender: string
  birthDate: string
  phoneNumber: string
  role: string
  provinceCode: string
  idPhoto: File | null
  profilePhoto: File | null
}

interface RegistrationConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  data: RegistrationData
  provinces: Array<{ id_province: string; name: string }>
  loading?: boolean
}

export function RegistrationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  provinces,
  loading = false
}: RegistrationConfirmationModalProps) {
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  // Generate preview URLs for photos
  const generatePhotoPreview = (file: File | null, setUrl: (url: string) => void) => {
    if (file) {
      const url = URL.createObjectURL(file)
      setUrl(url)
      return url
    }
    return null
  }

  // Get province name from code
  const getProvinceName = (provinceCode: string) => {
    const province = provinces.find(p => p.id_province === provinceCode)
    return province?.name || provinceCode
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Generate photo previews when modal opens
  useEffect(() => {
    if (isOpen) {
      if (data.idPhoto) {
        generatePhotoPreview(data.idPhoto, setIdPhotoUrl)
      }
      if (data.profilePhoto) {
        generatePhotoPreview(data.profilePhoto, setProfilePhotoUrl)
      }
    }
    
    // Cleanup URLs when modal closes
    return () => {
      if (idPhotoUrl) URL.revokeObjectURL(idPhotoUrl)
      if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl)
    }
  }, [isOpen, data.idPhoto, data.profilePhoto])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Konfirmasi Data Registrasi
          </DialogTitle>
          <DialogDescription className="text-base">
            Silakan periksa kembali data Anda sebelum melanjutkan. Setelah registrasi, perubahan data akan sulit dilakukan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-red-600" />
                Informasi Pribadi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <p className="text-gray-900 font-medium">{data.displayName || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {data.email || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Nomor Telepon</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {data.phoneNumber || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                  <Badge variant="outline" className="w-fit">
                    {data.gender || "N/A"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(data.birthDate)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Provinsi</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {getProvinceName(data.provinceCode)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <Badge variant="outline" className="w-fit">
                    <Shield className="h-3 w-3 mr-1" />
                    {data.role || "N/A"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-red-600" />
                Foto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Photo */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-600">Foto Profil</label>
                  <div className="relative w-32 h-32 mx-auto border-2 border-gray-200 rounded-full overflow-hidden">
                    {profilePhotoUrl ? (
                      <Image
                        src={profilePhotoUrl}
                        alt="Profile Photo Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {data.profilePhoto ? data.profilePhoto.name : "Tidak ada foto"}
                  </p>
                </div>

                {/* ID Photo */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-600">Foto KTP</label>
                  <div className="relative w-32 h-48 mx-auto border-2 border-gray-200 rounded-lg overflow-hidden">
                    {idPhotoUrl ? (
                      <Image
                        src={idPhotoUrl}
                        alt="ID Photo Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {data.idPhoto ? data.idPhoto.name : "Tidak ada foto"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Message */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-1">Peringatan Penting</h4>
                  <p className="text-sm text-orange-700">
                    Setelah registrasi berhasil, perubahan data pribadi akan memerlukan verifikasi admin. 
                    Pastikan semua data di atas sudah benar sebelum melanjutkan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Batal
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Konfirmasi & Daftar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 