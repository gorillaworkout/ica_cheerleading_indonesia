"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppSelector } from "@/lib/redux/hooks"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mail, Shield, User as UserIcon, Calendar, Phone, ImageIcon, BadgeCheck, BadgeX, AlertCircle, History, Camera, Upload, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getPublicImageUrl, generateStorageUrl } from "@/utils/getPublicImageUrl"
import { DatePicker } from "../ui/date-picker"
import { useAppDispatch } from "@/lib/redux/hooks";
import { fetchSessionAndProfile } from "@/features/auth/authSlice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDateToLocalString, formatDate } from "@/utils/dateFormat";
import { addYears } from "date-fns"
import ChangePasswordForm from "./change-password"
import { CoachForm } from "./coach-form"
import { AuditService, getClientInfo } from "@/lib/audit"
import { AccountHistory } from "./account-history"
import { IDCardSection } from "./id-card-section"

export function ProfileForm() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const provinces = useAppSelector((state) => state.provinces.provinces)
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const dispatch = useAppDispatch()
  const [localError, setLocalError] = useState<string | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("/placeholder.svg")
  const [idPhotoUrl, setIdPhotoUrl] = useState<string>("/placeholder.svg")
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile')
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    gender: "",
    birthDate: "",
    is_edit_allowed: false,
    is_request_edit: false,
    provinceCode: "",
    id_photo_file: null as File | string | null,
    profile_photo_file: null as File | null | string
  })
  const [tempBirthDate, setTempBirthDate] = useState<Date | undefined>(
    formData.birthDate ? new Date(formData.birthDate) : undefined
  )
  const [tempProfilePhotoUrl, setTempProfilePhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        displayName: profile.display_name || "",
        phoneNumber: profile.phone_number || "",
        gender: profile.gender || "",
        birthDate: profile.birth_date || "",
        is_edit_allowed: profile.is_edit_allowed ?? true,
        is_request_edit: profile.is_request_edit ?? false,
        provinceCode: profile.province_code || "",
        id_photo_file: profile.id_photo_url || null,
        profile_photo_file: profile.profile_photo_url || null,
      }))
      
      // Clear error message if profile is not in request state
      if (!profile.is_request_edit) {
        setLocalError(null)
      } else {
        setLocalError("Request berhasil dikirim. Tunggu persetujuan admin.")
      }
      
      setTempBirthDate(
        profile.birth_date ? new Date(profile.birth_date) : undefined
      )

      // Resolve image URLs
      if (profile.profile_photo_url && typeof profile.profile_photo_url === "string") {
        if (profile.profile_photo_url.startsWith("/")) {
          setProfilePhotoUrl(profile.profile_photo_url)
        } else {
          const resolveUrl = async () => {
            try {
              const url = await getPublicImageUrl(profile.profile_photo_url as string)
              setProfilePhotoUrl(url || "/placeholder.svg")
            } catch (error) {
              console.error("Error resolving profile photo URL:", error)
              setProfilePhotoUrl("/placeholder.svg")
            }
          }
          resolveUrl()
        }
      } else {
        setProfilePhotoUrl("/placeholder.svg")
      }

      if (profile.id_photo_url && typeof profile.id_photo_url === "string") {
        if (profile.id_photo_url.startsWith("/")) {
          setIdPhotoUrl(profile.id_photo_url)
        } else {
          const resolveUrl = async () => {
            try {
              const url = await getPublicImageUrl(profile.id_photo_url as string)
              setIdPhotoUrl(url || "/placeholder.svg")
            } catch (error) {
              console.error("Error resolving ID photo URL:", error)
              setIdPhotoUrl("/placeholder.svg")
            }
          }
          resolveUrl()
        }
      } else {
        setIdPhotoUrl("/placeholder.svg")
      }
    }
  }, [user, profile])

  // Handle temporary profile photo URL for preview
  useEffect(() => {
    if (formData.profile_photo_file instanceof File) {
      const url = URL.createObjectURL(formData.profile_photo_file)
      setTempProfilePhotoUrl(url)
      
      // Cleanup function
      return () => {
        if (url) URL.revokeObjectURL(url)
      }
    } else {
      setTempProfilePhotoUrl(null)
    }
  }, [formData.profile_photo_file])

  // Cleanup temporary URLs on unmount
  useEffect(() => {
    return () => {
      if (tempProfilePhotoUrl) {
        URL.revokeObjectURL(tempProfilePhotoUrl)
      }
    }
  }, [tempProfilePhotoUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setLocalError(null)

    try {
      if (!user) throw new Error("No user found")

      // Get current profile data for audit comparison
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      let idPhotoUrl = formData.id_photo_file
      let profilePhotoUrl = formData.profile_photo_file

      // Upload ID photo if it's a new file
      if (formData.id_photo_file instanceof File) {
        console.log("Uploading ID photo:", formData.id_photo_file.name)
        const fileExt = formData.id_photo_file.name.split('.').pop()
        const fileName = `id-photo-${user.id}-${Date.now()}.${fileExt}`
        const filePath = `id-photos/${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, formData.id_photo_file)

        if (uploadError) {
          console.error("ID photo upload error:", uploadError)
          throw new Error(`Failed to upload ID photo: ${uploadError.message}`)
        }
        idPhotoUrl = uploadData.path
        console.log("ID photo uploaded successfully:", uploadData.path)
      } else if (typeof formData.id_photo_file === 'string') {
        // If it's a string, validate it's not empty or invalid
        if (!formData.id_photo_file || formData.id_photo_file === '{}' || formData.id_photo_file === 'null') {
          idPhotoUrl = null
        } else {
          idPhotoUrl = formData.id_photo_file
        }
      }

      // Upload profile photo if it's a new file
      if (formData.profile_photo_file instanceof File) {
        console.log("Uploading profile photo:", formData.profile_photo_file.name)
        const fileExt = formData.profile_photo_file.name.split('.').pop()
        const fileName = `profile-${user.id}-${Date.now()}.${fileExt}`
        const filePath = `profile-photos/${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, formData.profile_photo_file)

        if (uploadError) {
          console.error("Profile photo upload error:", uploadError)
          throw new Error(`Failed to upload profile photo: ${uploadError.message}`)
        }
        profilePhotoUrl = uploadData.path
        console.log("Profile photo uploaded successfully:", uploadData.path)
      } else if (typeof formData.profile_photo_file === 'string') {
        // If it's a string, validate it's not empty or invalid
        if (!formData.profile_photo_file || formData.profile_photo_file === '{}' || formData.profile_photo_file === 'null') {
          profilePhotoUrl = null
        } else {
          profilePhotoUrl = formData.profile_photo_file
        }
      }

      const updatedData = {
        display_name: formData.displayName,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        birth_date: formData.birthDate,
        updated_at: new Date().toISOString(),
        is_edit_allowed: false,
        is_request_edit: false,
        is_verified: false,
        province_code: formData.provinceCode,
        id_photo_url: idPhotoUrl,
        profile_photo_url: profilePhotoUrl
      }

      console.log("Updating profile with data:", updatedData)

      const { error } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", user.id)

      if (error) {
        console.error("Profile update error:", error)
        throw error
      }

      console.log("Profile updated successfully")

      // Log the audit trail (with error handling)
      try {
        const clientInfo = getClientInfo()
        const changedFields = AuditService.getChangedFields(currentProfile, updatedData)
        
        await AuditService.logChange({
          user_id: user.id,
          table_name: 'profiles',
          record_id: user.id,
          action_type: 'UPDATE',
          old_data: currentProfile,
          new_data: updatedData,
          changed_fields: changedFields,
          ...clientInfo
        })
      } catch (auditError) {
        console.error("Failed to log audit trail:", auditError)
        // Don't throw error here, just log it
      }

      // Refresh profile data from database
      await dispatch(fetchSessionAndProfile())

      // Reset form state to reflect the updated profile
      setFormData({
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        birthDate: formData.birthDate,
        is_edit_allowed: false,
        is_request_edit: false,
        provinceCode: formData.provinceCode,
        id_photo_file: idPhotoUrl,
        profile_photo_file: profilePhotoUrl
      })

      // Clear any error messages
      setLocalError(null)

      // Clear temporary photo URL
      if (tempProfilePhotoUrl) {
        URL.revokeObjectURL(tempProfilePhotoUrl)
        setTempProfilePhotoUrl(null)
      }

      // Clear any file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
      fileInputs.forEach(input => {
        input.value = ''
      })

      // Clear any error messages
      setLocalError(null)

      toast({
        title: "Profile Updated Successfully",
        description: "Your profile has been updated and is pending admin verification.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      setLocalError(error instanceof Error ? error.message : "Failed to update profile. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const onRequestEdit = async () => {
    setIsUpdating(true);
    setLocalError(null);

    try {
      if (!user?.id) {
        toast({ title: "Error", description: "User tidak ditemukan" });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ is_request_edit: true })
        .eq("id", user.id);

      if (error) {
        console.error(error);
        setLocalError("Gagal mengirim request")
        toast({
          title: "Error",
          description: "Failed to send request. Please try again.",
          variant: "destructive",
        })
      } else {
        // Update local state immediately
        setFormData(prev => ({
          ...prev,
          is_request_edit: true
        }))
        
        await dispatch(fetchSessionAndProfile());
        setLocalError("Request berhasil dikirim. Tunggu persetujuan admin.")
        toast({
          title: "Request Sent",
          description: "Your edit request has been sent to admin for approval.",
        })
      }
    } catch (err) {
      console.error(err);
      setLocalError("Terjadi kesalahan saat mengirim request")
      toast({ 
        title: "Error", 
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            {(profile?.profile_photo_url || formData.profile_photo_file) ? (
              <div className="relative">
                <Image
                  src={tempProfilePhotoUrl || profilePhotoUrl}
                  alt="Profile Photo"
                  width={100}
                  height={100}
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2">
                  {profile?.is_verified ? (
                    <BadgeCheck className="h-6 w-6 text-green-500" />
                  ) : (
                    <BadgeX className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
            ) : (
              <div className="w-25 h-25 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {profile?.display_name || user.email?.split("@")[0]}
              </h1>
              <p className="text-red-100 text-lg mb-3">{user.email}</p>
              <div className="flex space-x-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Shield className="mr-2 h-4 w-4" />
                  {profile?.role?.toUpperCase() || 'MEMBER'}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`${profile?.is_verified ? 'bg-green-500/20 text-green-100 border-green-400/30' : 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'} backdrop-blur-sm`}
                >
                  {profile?.is_verified ? (
                    <>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      VERIFIED
                    </>
                  ) : (
                    <>
                      <BadgeX className="mr-2 h-4 w-4" />
                      PENDING
                    </>
                  )}
                </Badge>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mt-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'bg-white/10 text-red-100 hover:bg-white/20'
                  }`}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'history'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'bg-white/10 text-red-100 hover:bg-white/20'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {localError && (
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{localError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* New Modern Profile Settings Card */}
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8">
                  <CardTitle className="flex items-center space-x-4 text-2xl font-bold">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <UserIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <span>Profile Settings</span>
                      <p className="text-red-100 text-sm font-normal mt-1">
                        Update your personal information and documents
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="displayName" className="text-gray-700 font-medium flex items-center space-x-2">
                            <span>Display Name</span>
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          </Label>
                          <Input
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            disabled={!formData.is_edit_allowed}
                            className="border-gray-200 focus:border-red-400 focus:ring-red-400 h-12 text-lg"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="phoneNumber" className="text-gray-700 font-medium flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>Phone Number</span>
                          </Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            disabled={!formData.is_edit_allowed}
                            className="border-gray-200 focus:border-red-400 focus:ring-red-400 h-12"
                            placeholder="+62 812-3456-7890"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-gray-700 font-medium">Gender</Label>
                          <select 
                            disabled={!formData.is_edit_allowed} 
                            value={formData.gender} 
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 h-12 focus:border-red-400 focus:ring-red-400 focus:outline-none bg-white"
                          >
                            <option value="">Choose Gender</option>
                            <option value="lakilaki">Laki Laki</option>
                            <option value="perempuan">Perempuan</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-gray-700 font-medium flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Date of Birth</span>
                          </Label>
                          <DatePicker
                            disabled={!formData.is_edit_allowed}
                            date={tempBirthDate}
                            onChange={(date) => {
                              setTempBirthDate(date)
                              setFormData({ ...formData, birthDate: formatDateToLocalString(date) });
                            }}
                          />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <Label className="text-gray-700 font-medium">Province</Label>
                          <select 
                            disabled={!formData.is_edit_allowed}  
                            value={formData.provinceCode} 
                            onChange={(e) => setFormData({ ...formData, provinceCode: e.target.value })} 
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 h-12 focus:border-red-400 focus:ring-red-400 focus:outline-none bg-white"
                          >
                            <option value="">Choose Province</option>
                            {provinces.map((prov) => (
                              <option key={prov.id_province} value={prov.id_province}>
                                {prov.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Document Upload</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-gray-700 font-medium flex items-center space-x-2">
                            <span>ID Photo (KTP/KK/KIA)</span>
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Required</Badge>
                          </Label>
                          <div className="relative">
                            <Input
                              id="id-photo-input"
                              disabled={!formData.is_edit_allowed}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                console.log("ID photo file selected:", file);
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    setLocalError("Ukuran gambar maksimal 2MB.")
                                    e.target.value = "";
                                    return;
                                  }
                                  setFormData(prev => ({ ...prev, id_photo_file: file }));
                                  setLocalError(null);
                                  console.log("ID photo file set in formData");
                                } else {
                                  setFormData(prev => ({ ...prev, id_photo_file: null }));
                                }
                              }}
                              className="border-gray-200 focus:border-red-400 focus:ring-red-400 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Upload className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Upload clear photo of your ID document (max 2MB)</p>
                          {formData.id_photo_file instanceof File && (
                            <p className="text-xs text-green-600">✓ ID photo selected: {formData.id_photo_file.name}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-gray-700 font-medium flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>Profile Photo</span>
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Required</Badge>
                          </Label>
                          <div className="relative">
                            <Input
                              id="profile-photo-input"
                              disabled={!formData.is_edit_allowed}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                console.log("Profile photo file selected:", file);
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    setLocalError("Ukuran gambar maksimal 2MB.")
                                    e.target.value = "";
                                    return;
                                  }
                                  setFormData(prev => ({ ...prev, profile_photo_file: file }));
                                  setLocalError(null);
                                  console.log("Profile photo file set in formData");
                                } else {
                                  setFormData(prev => ({ ...prev, profile_photo_file: null }));
                                }
                              }}
                              className="border-gray-200 focus:border-red-400 focus:ring-red-400 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Upload className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Upload a clear headshot photo (max 2MB)</p>
                          {formData.profile_photo_file instanceof File && (
                            <p className="text-xs text-green-600">✓ Profile photo selected: {formData.profile_photo_file.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-gray-100">
                      {formData.is_edit_allowed ? (
                        <Button 
                          type="submit" 
                          disabled={isUpdating} 
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg h-14 text-lg font-semibold"
                        >
                          {isUpdating ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Updating Profile...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5" />
                              <span>Update Profile</span>
                            </div>
                          )}
                        </Button>
                      ) : !formData.is_request_edit ? (
                        <Button 
                          onClick={onRequestEdit} 
                          type="button" 
                          disabled={isUpdating} 
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg h-14 text-lg font-semibold"
                        >
                          {isUpdating ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Sending Request...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-5 w-5" />
                              <span>Request Update Permission</span>
                            </div>
                          )}
                        </Button>
                      ) : (
                        <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-blue-700 font-semibold">Update Request Sent</p>
                          </div>
                          <p className="text-blue-600 text-sm">Your request is pending admin approval. You'll be notified once approved.</p>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* ID Card Section */}
              <IDCardSection />

              {/* Coach Form */}
              <CoachForm />
            </div>

            {/* Right Column - Info Cards */}
            <div className="space-y-6">
              {/* Change Password Card */}
              {/* <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span>Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChangePasswordForm />
                </CardContent>
              </Card> */}

              {/* Member Info Card */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                    <span>Member Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Member Code</span>
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold">
                      {profile?.member_code || "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">ID Document</span>
                    {(profile?.id_photo_url || formData.id_photo_file) ? (
                      formData.id_photo_file instanceof File ? (
                        <span className="text-green-600 text-sm font-medium">✓ New file selected</span>
                      ) : (
                        <a
                          href={idPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                        >
                          View Document
                        </a>
                      )
                    ) : (
                      <span className="text-gray-400 italic text-sm">Not uploaded</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Member Since</span>
                    <span className="text-sm text-gray-700 font-medium">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Last Updated</span>
                    <span className="text-sm text-gray-700 font-medium">
                      {formatDate(profile?.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status Card */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span>Account Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Verification</span>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        profile?.is_verified 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {profile?.is_verified ? 'VERIFIED' : 'PENDING'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Edit Permission</span>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        formData.is_edit_allowed 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {formData.is_edit_allowed ? 'ALLOWED' : 'RESTRICTED'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Profile Role</span>
                      <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 uppercase">
                        {profile?.role || 'MEMBER'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // History Tab Content
          <div className="max-w-4xl mx-auto">
            <AccountHistory />
          </div>
        )}
      </div>
    </div>
  )
}