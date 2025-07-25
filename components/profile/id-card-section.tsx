'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from "@/lib/redux/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Plus, Eye, Loader2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AutoIDCardGenerator } from '@/utils/autoGenerateIdCard'
import { useToast } from '@/hooks/use-toast'

export function IDCardSection() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (profile?.id_card_image) {
      // Generate public URL for ID card
      const imagePath = profile.id_card_image.includes('/') 
        ? profile.id_card_image 
        : `id-cards/${profile.id_card_image}`
      
      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(imagePath)
      
      if (urlData?.publicUrl) {
        setIdCardUrl(urlData.publicUrl)
      }
    }
    setLoading(false)
  }, [profile])

  const downloadIDCard = async () => {
    if (!idCardUrl) return
    
    try {
    // Use member_code or fallback to user ID for filename
    const memberCode = profile?.member_code || user?.id?.slice(0, 8) || 'unknown'
      const filename = `ICA-ID-Card-${memberCode}.png`
      
      console.log('📥 Starting ID card download:', { url: idCardUrl, filename })
      
      // Fetch the image to create a proper blob for download
      const response = await fetch(idCardUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/png, image/jpeg, image/*'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      
      // Get the blob data
      const blob = await response.blob()
      console.log('📄 Blob created:', { type: blob.type, size: blob.size })
      
      // Create blob URL for download
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
      
      console.log('✅ ID card download triggered successfully')
      
      toast({
        title: "Download Started",
        description: `ID Card berhasil didownload sebagai ${filename}`,
        className: "border-green-500 bg-green-50"
      })
      
    } catch (error) {
      console.error('❌ Download failed:', error)
      
      // Fallback: direct link download
      console.log('🔄 Trying fallback download method...')
      const memberCode = profile?.member_code || user?.id?.slice(0, 8) || 'unknown'
    const link = document.createElement('a')
    link.href = idCardUrl
    link.download = `ICA-ID-Card-${memberCode}.png`
    link.click()
      
      toast({
        title: "Download Started",
        description: "ID Card download started (fallback method)",
        className: "border-blue-500 bg-blue-50"
      })
    }
  }

  const handleGenerateIDCard = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not logged in",
        variant: "destructive"
      })
      return
    }

    // 🔒 SECURITY: Check if user is verified by admin
    if (!profile?.is_verified) {
      toast({
        title: "Account Not Verified",
        description: "Akun Anda belum diverifikasi oleh admin. Silakan tunggu proses verifikasi dari admin sebelum generate ID Card.",
        variant: "destructive"
      })
      return
    }

    // 🚫 ONE-TIME GENERATION: Check if ID card already exists  
    if (profile?.id_card_image && idCardUrl) {
      toast({
        title: "ID Card Already Generated",
        description: "ID Card sudah pernah dibuat. Anda hanya bisa generate sekali.",
        variant: "destructive"
      })
      return
    }

    // Check if required profile data exists (profile photo is optional)
    if (!profile?.display_name || !profile?.birth_date || !profile?.gender || !profile?.province_code) {
      toast({
        title: "Incomplete Profile",
        description: "Please complete your profile information first (name, birth date, gender, and province). Profile photo is optional.",
        variant: "destructive"
      })
      return
    }

    setGenerating(true)

    try {
      const success = await AutoIDCardGenerator.generateAndSaveIDCard(user.id)
      if (success) {
        toast({
          title: "Success",
          description: "ID Card generated successfully!",
        })
        
        // 🔄 REFRESH DATA: Update profile and ID card URL without page reload
        // Fetch updated profile data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (updatedProfile?.id_card_image) {
          // Generate new public URL
          const imagePath = updatedProfile.id_card_image.includes('/') 
            ? updatedProfile.id_card_image 
            : `id-cards/${updatedProfile.id_card_image}`
          
          const { data: urlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(imagePath)
          
          if (urlData?.publicUrl) {
            setIdCardUrl(urlData.publicUrl)
            console.log('✅ ID Card URL updated without refresh:', urlData.publicUrl)
          }
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate ID card. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error generating ID card:', error)
      toast({
        title: "Error",
        description: "An error occurred while generating ID card.",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-gray-100 shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <CardTitle className="flex items-center space-x-3 text-gray-700">
            <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center animate-pulse">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl">ID Card</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-red-100 shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-red-700">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl">Membership ID Card</span>
          </div>
          {idCardUrl && (
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
              Active
            </Badge>
          )}
        </CardTitle>
        <p className="text-gray-600 mt-2">Your official ICA membership identification card</p>
      </CardHeader>
      <CardContent className="p-8">
        {idCardUrl ? (
          <div className="space-y-6">
            {/* ID Card Preview */}
            <div className="relative group">
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <Image
                  src={idCardUrl}
                  alt="ICA Membership ID Card"
                  width={506}
                  height={319}
                  className="w-full h-auto"
                />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  onClick={downloadIDCard}
                  variant="secondary"
                  size="lg"
                  className="bg-white hover:bg-gray-100"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Size
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={downloadIDCard}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Download ID Card
              </Button>
              <Button
                onClick={handleGenerateIDCard}
                disabled={
                  generating || 
                  !Boolean(profile?.is_verified) || 
                  Boolean(profile?.id_card_image && idCardUrl)
                }
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : !Boolean(profile?.is_verified) ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Not Verified by Admin
                  </>
                ) : (profile?.id_card_image && idCardUrl) ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Already Generated
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Card
                  </>
                )}
              </Button>
              {/* <Link href="/profile/id-card-editor" className="flex-1">
                <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Editor
                </Button>
              </Link> */}
            </div>

            {/* Member Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Card Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Member ID:</span>
                  <p className="font-mono font-medium">{profile?.member_code}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium capitalize">{profile?.role || 'Member'}</p>
                </div>
                {/* <div>
                  <span className="text-gray-500">Issue Date:</span>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Valid Until:</span>
                  <p className="font-medium">
                    {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        ) : (
          /* No ID Card */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ID Card Not Available</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate your official ICA membership ID card to access exclusive member benefits and events.
            </p>
            <div className="space-y-4">
              {/* Check verification status and profile requirements */}
              {!Boolean(profile?.is_verified) ? (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">⏳ Account Not Verified</p>
                  <p className="text-yellow-700 text-sm mt-1">Akun Anda belum diverifikasi oleh admin. Silakan tunggu proses verifikasi sebelum generate ID Card.</p>
                </div>
              ) : profile?.display_name && profile?.birth_date && profile?.gender && profile?.province_code ? (
                <Button 
                  onClick={handleGenerateIDCard}
                  disabled={generating || Boolean(profile?.id_card_image)}
                  className="bg-red-600 hover:bg-red-700 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : Boolean(profile?.id_card_image) ? (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Already Generated
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate ID Card
                    </>
                  )}
                </Button>
              ) : (
                <Button disabled className="bg-gray-400 px-8">
                  <Plus className="mr-2 h-4 w-4" />
                  Complete Profile First
                </Button>
              )}
              
              <Link href="/profile/id-card-editor">
                <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 px-8">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview ID Card Template
                </Button>
              </Link>
              
              {/* Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium text-blue-900 mb-2">Requirements for ID Card Generation:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.display_name ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Profile name</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.profile_photo_url ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Profile photo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.birth_date ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Birth date</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.gender ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Gender</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.province_code ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Province</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
