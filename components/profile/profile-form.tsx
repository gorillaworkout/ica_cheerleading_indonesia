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
import { Mail, Shield, User as UserIcon, Calendar, Phone, ImageIcon, BadgeCheck, BadgeX, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getPublicImageUrl } from "@/utils/getPublicImageUrl"
import { DatePicker } from "../ui/date-picker"
import { useAppDispatch } from "@/lib/redux/hooks";
import { fetchSessionAndProfile } from "@/features/auth/authSlice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/utils/dateFormat";
import { addYears } from "date-fns"
import ChangePasswordForm from "./change-password"
export function ProfileForm() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const provinces = useAppSelector((state) => state.provinces.provinces)  // Get provinces from Redux
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const dispatch = useAppDispatch()
  const [localError, setLocalError] = useState<string | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("/placeholder.svg")
  const [idPhotoUrl, setIdPhotoUrl] = useState<string>("/placeholder.svg")
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

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.displayName,
          phone_number: formData.phoneNumber,
          gender: formData.gender,
          birth_date: formData.birthDate,
          updated_at: new Date().toISOString(),
          is_edit_allowed: false,
          is_request_editL: false,
          is_verified: false,
          provinceCode: formData.provinceCode,
          id_photo_file: formData.id_photo_file,
          profile_photo_file: formData.profile_photo_file
        })
        .eq("id", user.id)

      if (error) throw error

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
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-red-600" />
            <span>Profile Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {profile?.profile_photo_url ? (
              <Image
                src={profilePhotoUrl}
                alt="Profile Photo"
                width={64}
                height={64}
                className="rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-red-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {profile?.display_name || user.email?.split("@")[0]}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              {profile?.role && (
                <Badge variant="outline" className="mt-1 capitalize">
                  <Shield className="mr-1 h-3 w-3" />
                  {profile.role}
                </Badge>
              )}
              <Badge variant="default" className="ml-2">
                {
                  profile?.is_verified ?
                    <>
                      <BadgeCheck className="mr-1 h-3 w-3" />
                      Verified Member
                    </> :
                    <>
                      <BadgeX className="mr-1 h-3 w-3" />
                      Not Verified Member
                    </>
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {localError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}
      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                disabled={!formData.is_edit_allowed}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                disabled={!formData.is_edit_allowed}
              />
            </div>

            <div className="space-y-1">
              <Label>Gender</Label>
              <select disabled={!formData.is_edit_allowed} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required className="w-full border rounded px-2 py-2">
                <option value="">Choose Gender</option>
                <option value="lakilaki">Laki Laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
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
              <Label>Province</Label>
              <select disabled={!formData.is_edit_allowed}  value={formData.provinceCode} onChange={(e) => setFormData({ ...formData, provinceCode: e.target.value })} required className="w-full border rounded px-2 py-2">
                <option value="">Choose Province</option>
                {provinces.map((prov) => (
                  <option key={prov.id_province} value={prov.id_province}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>ID Photo (KTP/KK/KIA) </Label>
              <Input
              disabled={!formData.is_edit_allowed} 
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      setLocalError("Ukuran gambar maksimal 2MB.")
                      e.target.value = ""; // Reset input file
                      return;
                    }
                    setFormData({ ...formData, id_photo_file: file });
                  } else {
                    setFormData({ ...formData, id_photo_file: null });
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <Input
              disabled={!formData.is_edit_allowed} 
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      setLocalError("Ukuran gambar maksimal 2MB.")
                      e.target.value = ""; // Reset input file
                      return;
                    }
                    setFormData({ ...formData, profile_photo_file: file });
                  } else {
                    setFormData({ ...formData, profile_photo_file: null });
                  }
                }}
                required
              />
            </div>

            {
              formData.is_edit_allowed && (
                <Button type="submit" disabled={isUpdating} className="bg-red-600 hover:bg-red-700">
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              )
            }
            {
              !formData.is_edit_allowed && !formData.is_request_edit && (
                <Button onClick={onRequestEdit} type="submit" disabled={isUpdating} className="bg-red-600 hover:bg-red-700">
                  {isUpdating ? "Request Update Profile..." : "Request Update Profile"}
                </Button>
              )
            }
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Change Password</CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Extra Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Member Code:</span>
            <span className="font-medium">{profile?.member_code || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>ID Photo:</span>
            {profile?.id_photo_url ? (
              <a
                href={idPhotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 transition-colors"
              >
                View
              </a>
            ) : (
              <span>N/A</span>
            )}
          </div>
          <div className="flex justify-between">
            <span>Created At:</span>
            <span>{formatDate(profile?.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated At:</span>
            <span>{formatDate(profile?.updated_at)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}