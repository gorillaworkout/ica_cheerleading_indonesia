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
import { Mail, Shield, User as UserIcon, Calendar, Phone, ImageIcon, BadgeCheck, BadgeX, AlertCircle, History } from "lucide-react"
import Link from "next/link"
import { getPublicImageUrl, generateStorageUrl } from "@/utils/getPublicImageUrl"
import { DatePicker } from "../ui/date-picker"
import { useAppDispatch } from "@/lib/redux/hooks";
import { fetchSessionAndProfile } from "@/features/auth/authSlice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/utils/dateFormat";
import { addYears } from "date-fns"
import ChangePasswordForm from "./change-password"
import { CoachForm } from "./coach-form"
import { AuditService, getClientInfo } from "@/lib/audit"
import { AccountHistory } from "./account-history"
import { IDCardSection } from "./id-card-section"
export function ProfileForm() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const provinces = useAppSelector((state) => state.provinces.provinces)  // Get provinces from Redux
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
  useEffect(() => {
    if (user && profile) {
      setFormData({
        displayName: profile.display_name || "",
        phoneNumber: profile.phone_number || "",
        gender: profile.gender || "",
        birthDate: profile.birth_date || "",
        is_edit_allowed: profile.is_edit_allowed ?? true,
        is_request_edit: profile.is_request_edit ?? false,
        provinceCode: profile.province_code || "",
        id_photo_file: profile.id_photo_url!,
        profile_photo_file: profile.profile_photo_url!,
      })
      if (profile.is_request_edit) {
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
            const url = await getPublicImageUrl(profile.profile_photo_url as string)
            setProfilePhotoUrl(url || "/placeholder.svg")
          }
          resolveUrl()
        }
      }

      if (profile.id_photo_url && typeof profile.id_photo_url === "string") {
        if (profile.id_photo_url.startsWith("/")) {
          setIdPhotoUrl(profile.id_photo_url)
        } else {
          const resolveUrl = async () => {
            const url = await getPublicImageUrl(profile.id_photo_url as string)
            setIdPhotoUrl(url || "/placeholder.svg")
          }
          resolveUrl()
        }
      }
    }
  }, [user, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      if (!user) throw new Error("No user found")

      // Get current profile data for audit comparison
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

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
        id_photo_url: formData.id_photo_file,
        profile_photo_url: formData.profile_photo_file
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", user.id)

      if (error) throw error

      // Log the audit trail
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

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
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
      } else {
        dispatch(fetchSessionAndProfile());
        setLocalError("Request berhasil dikirim. Tunggu persetujuan admin.")
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Terjadi kesalahan" });
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
            {profile?.profile_photo_url ? (
              <div className="relative">
                <Image
                  src={profilePhotoUrl}
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
              <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                <CardTitle className="flex items-center space-x-3 text-red-700">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl">Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-gray-700 font-medium">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        disabled={!formData.is_edit_allowed}
                        className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        disabled={!formData.is_edit_allowed}
                        className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Gender</Label>
                      <select 
                        disabled={!formData.is_edit_allowed} 
                        value={formData.gender} 
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-red-400 focus:ring-red-400 focus:outline-none"
                      >
                        <option value="">Choose Gender</option>
                        <option value="lakilaki">Laki Laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Date of Birth</Label>
                      <DatePicker
                        disabled={!formData.is_edit_allowed}
                        date={tempBirthDate}
                        onChange={(date) => {
                          setTempBirthDate(date)
                          setFormData({ ...formData, birthDate: date ? date.toISOString().split("T")[0] : "" });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Province</Label>
                      <select 
                        disabled={!formData.is_edit_allowed}  
                        value={formData.provinceCode} 
                        onChange={(e) => setFormData({ ...formData, provinceCode: e.target.value })} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-red-400 focus:ring-red-400 focus:outline-none"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">ID Photo (KTP/KK/KIA)</Label>
                      <Input
                        disabled={!formData.is_edit_allowed}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              setLocalError("Ukuran gambar maksimal 2MB.")
                              e.target.value = "";
                              return;
                            }
                            setFormData({ ...formData, id_photo_file: file });
                          } else {
                            setFormData({ ...formData, id_photo_file: null });
                          }
                        }}
                        className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Profile Photo</Label>
                      <Input
                        disabled={!formData.is_edit_allowed}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              setLocalError("Ukuran gambar maksimal 2MB.")
                              e.target.value = "";
                              return;
                            }
                            setFormData({ ...formData, profile_photo_file: file });
                          } else {
                            setFormData({ ...formData, profile_photo_file: null });
                          }
                        }}
                        className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    {formData.is_edit_allowed ? (
                      <Button 
                        type="submit" 
                        disabled={isUpdating} 
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                      >
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    ) : !formData.is_request_edit ? (
                      <Button 
                        onClick={onRequestEdit} 
                        type="button" 
                        disabled={isUpdating} 
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                      >
                        {isUpdating ? "Requesting..." : "Request Update Permission"}
                      </Button>
                    ) : (
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-700 font-medium">Update request pending admin approval</p>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ID Card Section - Moved to left column for better width */}
            <IDCardSection />

            {/* Coach Form in Main Area for Better Width Usage */}
            <CoachForm />
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Change Password Card */}
            <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                <CardTitle className="flex items-center space-x-3 text-red-700">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span>Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ChangePasswordForm />
              </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                <CardTitle className="flex items-center space-x-3 text-red-700">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  <span>Member Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Member Code</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                    {profile?.member_code || "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">ID Photo</span>
                  {profile?.id_photo_url ? (
                    <a
                      href={idPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not uploaded</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Member Since</span>
                  <span className="text-sm text-gray-700">
                    {formatDate(profile?.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Last Updated</span>
                  <span className="text-sm text-gray-700">
                    {formatDate(profile?.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="border-2 border-red-100 shadow-xl bg-gradient-to-br from-red-50 to-white">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
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
                    <span className="text-gray-600">Verification</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile?.is_verified 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {profile?.is_verified ? 'VERIFIED' : 'PENDING'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Edit Permission</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formData.is_edit_allowed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {formData.is_edit_allowed ? 'ALLOWED' : 'RESTRICTED'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile Role</span>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 uppercase">
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