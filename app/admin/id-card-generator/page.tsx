'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/redux/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, CreditCard, Upload, User, Calendar, MapPin, Shield } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { generateStorageUrl } from '@/utils/getPublicImageUrl'
import PreloadResources from '@/components/ui/preload-resources'

interface IDCardData {
  memberID: string
  name: string
  birthDate: string
  gender: string
  province: string
  status: string
  photo: string
}

export default function IdCardGeneratorPage() {
  const { toast } = useToast()
  const { user, profile } = useAppSelector((state) => state.auth)
  const provinces = useAppSelector((state) => state.provinces.provinces)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(null)

  const [idCardData, setIdCardData] = useState<IDCardData>({
    memberID: '',
    name: '',
    birthDate: '',
    gender: '',
    province: '',
    status: '',
    photo: ''
  })

  const [righteousFont, setRighteousFont] = useState<FontFace | null>(null)

  // Load Righteous font
  useEffect(() => {
    const loadFont = async () => {
      try {
        const font = new FontFace('Righteous', 'url(/righteous-Regular.ttf)')
        await font.load()
        document.fonts.add(font)
        setRighteousFont(font)
      } catch (error) {
        console.error('Failed to load Righteous font:', error)
      }
    }
    loadFont()
  }, [])

  // Format date to Indonesian format (day - month name - year)
  const formatRegistrationDate = (dateString: string) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    // return `${day}, ${month} - ${year}`
    return `${month}, ${day} ${year}`
  }

  // Format birth date to Indonesian format (month name - day - year)
  const formatBirthDate = (dateString: string) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    return `${month}, ${day}  ${year}`
  }

  // Load user data
  useEffect(() => {
    if (profile && user) {
      const getProvinceName = (code: string) => {
        const province = provinces.find(p => p.id_province === code)
        return province ? province.name : code
      }

      setIdCardData({
        memberID: user.id.slice(0, 8).toUpperCase(),
        name: profile.display_name || 'Member Name',
        birthDate: profile.birth_date || '',
        gender: profile.gender || '',
        province: getProvinceName(profile.province_code || ''),
        status: profile.role?.toUpperCase() || 'MEMBER',
        photo: profile.profile_photo_url || ''
      })
    }
  }, [profile, user, provinces])

  // Load template image
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setTemplateImage(img)
    }
    img.onerror = () => {
      console.error('Failed to load template image')
      // Create a simple canvas template as fallback
      const canvas = document.createElement('canvas')
      canvas.width = 1012
      canvas.height = 638
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Draw a simple template
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 1012, 638)
        ctx.fillStyle = '#dc2626'
        ctx.fillRect(0, 0, 1012, 120)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 24px Arial'
        ctx.fillText('ID CARD FOR MEMBER ICA', 400, 60)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const fallbackImg = new window.Image()
            fallbackImg.onload = () => setTemplateImage(fallbackImg)
            fallbackImg.src = url
          }
        })
      }
    }
    // Try SVG template first, then fallback to PNG
    img.src = '/id_card.jpg'
  }, [])

  const drawIDCard = async () => {
    if (!canvasRef.current || !templateImage) return null

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Set canvas size to match template
    canvas.width = 1012 // Width based on your template
    canvas.height = 638 // Height based on your template

    // Clear any previous drawings to prevent double rendering
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw template background
    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height)

    // Set text styles
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'left'

    // Draw member photo
    if (idCardData.photo) {
      try {
        const photoImg = new window.Image()
        photoImg.crossOrigin = 'anonymous'

        await new Promise((resolve, reject) => {
          photoImg.onload = resolve
          photoImg.onerror = reject

          // Generate proper URL for the photo
          if (idCardData.photo.includes('http')) {
            photoImg.src = idCardData.photo
          } else {
            const imagePath = idCardData.photo.includes('/')
              ? idCardData.photo
              : `profile-photos/${idCardData.photo}`

            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(imagePath)

            photoImg.src = urlData?.publicUrl || '/placeholder.svg'
          }
        })

        // Draw photo in the red area (adjust coordinates based on your template)
        const photoX = 70 // Updated coordinates
        const photoY = 200 // Updated coordinates
        const photoWidth = 310 // Updated size
        const photoHeight = 325 // Updated size
        const photoRadius = 20 // Rounded corners

        ctx.save()
        ctx.beginPath()
        // Create rounded rectangle path
        const radius = photoRadius
        const x = photoX
        const y = photoY
        const width = photoWidth
        const height = photoHeight

        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()

        ctx.clip()
        ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight)
        ctx.restore()
      } catch (error) {
        console.error('Error loading photo:', error)
      }
    }

    // Draw text data (adjust coordinates based on your template)
    const fontFamily = righteousFont ? 'Righteous, Arial' : 'Arial'
    ctx.font = `bold 18px ${fontFamily}`
    ctx.fillStyle = '#FF0000' // Red color for labels

    // Member ID
    ctx.fillText('ID:', 400, 380)
    ctx.fillStyle = '#FF0000' // Red color for values
    ctx.fillText(idCardData.memberID, 395, 410)

    // Birth Date
    ctx.fillStyle = '#FF0000'
    ctx.fillText('BIRTH OF DATE:', 593, 380)
    ctx.fillStyle = '#FF0000'
    const formattedBirthDate = formatBirthDate(idCardData.birthDate)
    ctx.fillText(formattedBirthDate, 590, 410)

    // Gender
    ctx.fillStyle = '#FF0000'
    ctx.fillText('GENDER:', 857, 380)
    ctx.fillStyle = '#FF0000'
    ctx.fillText(idCardData.gender, 860, 410)

    // Province
    ctx.fillStyle = '#FF0000'
    ctx.fillText('PROVINCE:', 392, 450)
    ctx.fillStyle = '#FF0000'
    ctx.fillText(idCardData.province, 395, 490)

    // Status
    ctx.fillStyle = '#FF0000'
    ctx.fillText('STATUS:', 592, 450)
    ctx.fillStyle = '#FF0000'
    ctx.fillText(idCardData.status, 595, 490)

    // Registration Date (BLACK color)
    ctx.fillStyle = '#000000' // Black for registration date
    ctx.fillText('REG DATE:', 392, 520)
    ctx.fillStyle = '#000000' // Black for registration date value
    const regDate = formatRegistrationDate(profile?.created_at || new Date().toISOString())
    ctx.fillText(regDate, 850, 580)

    // Member Name (larger font and WHITE color)
    ctx.font = `bold 32px ${fontFamily}` // Updated font size with Righteous
    ctx.fillStyle = '#FFFFFF' // White color
    ctx.fillText(idCardData.name.toUpperCase(), 400, 320)

    return canvas
  }

  const generateIDCard = async () => {
    setIsGenerating(true)
    try {
      const canvas = await drawIDCard()
      if (!canvas) throw new Error('Failed to generate canvas')

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/png', 1.0)
      })

      // Upload to Supabase storage
      const fileName = `id-card-${user?.id}-${Date.now()}.png`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(`id-cards/${fileName}`, blob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(uploadData.path)

      if (urlData?.publicUrl) {
        setGeneratedCardUrl(urlData.publicUrl)

        // Update user profile with ID card URL
        if (user?.id) {
          await supabase
            .from('profiles')
            .update({ id_card_url: uploadData.path })
            .eq('id', user.id)
        }
      }

    } catch (error) {
      console.error('Error generating ID card:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate ID card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadIDCard = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `ICA-ID-Card-${idCardData.memberID}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
            <p className="text-gray-600">Please sign in to generate your ID card.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PreloadResources font={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ID Card Generator</h1>
                <p className="text-gray-600">Generate your official ICA membership ID card</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Data Form */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-red-600" />
                  <span>Member Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberID">Member ID</Label>
                    <Input
                      id="memberID"
                      value={idCardData.memberID}
                      onChange={(e) => setIdCardData(prev => ({ ...prev, memberID: e.target.value }))}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={idCardData.name}
                      onChange={(e) => setIdCardData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={idCardData.birthDate}
                      onChange={(e) => setIdCardData(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={idCardData.gender}
                      onChange={(e) => setIdCardData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={idCardData.province}
                      onChange={(e) => setIdCardData(prev => ({ ...prev, province: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={idCardData.status}
                      onChange={(e) => setIdCardData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="COACH">Coach</option>
                      <option value="JUDGE">Judge</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    onClick={generateIDCard}
                    disabled={isGenerating || !templateImage}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Generate ID Card
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={downloadIDCard}
                    variant="outline"
                    disabled={!generatedCardUrl}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  <span>ID Card Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  {!templateImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Loading template...</p>
                      </div>
                    </div>
                  )}
                </div>

                {generatedCardUrl && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-green-700 font-medium">ID Card generated successfully!</p>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      Your ID card has been saved to your profile.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div >
    </PreloadResources>
  )
}
