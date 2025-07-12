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
import { Mail, Shield, User, Calendar, Phone, ImageIcon, BadgeCheck } from "lucide-react"
import Link from "next/link"
import { getPublicImageUrl } from "@/utils/getPublicImageUrl"

export function ProfileForm() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    gender: "",
    birthDate: "",
  })

  useEffect(() => {
    if (user && profile) {
      setFormData({
        displayName: profile.display_name || "",
        phoneNumber: profile.phone_number || "",
        gender: profile.gender || "",
        birthDate: profile.birth_date || "",
      })
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
            <User className="h-5 w-5 text-red-600" />
            <span>Profile Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {profile?.profile_photo_url ? (
              <Image
                src={profile.profile_photo_url}
                alt="Profile Photo"
                width={64}
                height={64}
                className="rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-red-600" />
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
              {profile?.is_verified && (
                <Badge variant="default" className="ml-2">
                  <BadgeCheck className="mr-1 h-3 w-3" />
                  Verified Member
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                placeholder="e.g. Male or Female"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
            </div>

            <Button type="submit" disabled={isUpdating} className="bg-red-600 hover:bg-red-700">
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
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
                href={getPublicImageUrl(profile.id_photo_url)}
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
            <span>{new Date(profile?.created_at || "").toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated At:</span>
            <span>{new Date(profile?.updated_at || "").toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
