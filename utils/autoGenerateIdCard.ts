'use client'

import { supabase } from '@/lib/supabase'
import { ensureUploadsBucket, ensureIDCardsFolder } from './ensureStorageBucket'

interface ProfileData {
  id: string
  display_name: string
  birth_date: string
  gender: string
  province_code: string
  role: string
  profile_photo_url: string
  created_at: string
  member_code: string | null  // Changed to allow null like in global interface
  id_card_image: string | null  // Add field for existing ID card
}

interface ProvinceData {
  id_province: string
  name: string
}

export class AutoIDCardGenerator {
  private static righteousFont: FontFace | null = null

  // Load Righteous font
  static async loadFont() {
    if (this.righteousFont) return this.righteousFont

    try {
      const font = new FontFace('Righteous', 'url(/righteous-Regular.ttf)')
      await font.load()
      document.fonts.add(font)
      this.righteousFont = font
      return font
    } catch (error) {
      console.error('Failed to load Righteous font:', error)
      return null
    }
  }

  // Format registration date (day - month name - year)
  static formatRegistrationDate(dateString: string): string {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    
    return `${month}, ${day} ${year}`
  }

  // Format birth date (month name - day - year)
  static formatBirthDate(dateString: string): string {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    
    return `${month}, ${day} ${year}`
  }

  // Get province name from code
  static async getProvinceName(provinceCode: string): Promise<string> {
    try {
      const { data: provinces, error } = await supabase
        .from('provinces')
        .select('name')
        .eq('id_province', provinceCode)
        .single()

      if (error) {
        console.error('Error fetching province:', error)
        return provinceCode
      }

      return provinces?.name || provinceCode
    } catch (error) {
      console.error('Error getting province name:', error)
      return provinceCode
    }
  }

  // Generate ID card canvas
  static async generateIDCardCanvas(profileData: Omit<ProfileData, 'id_card_image'>): Promise<HTMLCanvasElement | null> {
    try {
      // Load font
      await this.loadFont()

      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Set canvas size
      canvas.width = 1012
      canvas.height = 638

      // Load template image
      const templateImg = new Image()
      templateImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        templateImg.onload = resolve
        templateImg.onerror = reject
        templateImg.src = '/id_card.jpg'
      })

      // Draw template background
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

      // Load and draw member photo
      if (profileData.profile_photo_url) {
        try {
          const photoImg = new Image()
          photoImg.crossOrigin = 'anonymous'

          await new Promise((resolve, reject) => {
            photoImg.onload = resolve
            photoImg.onerror = reject

            if (profileData.profile_photo_url.includes('http')) {
              photoImg.src = profileData.profile_photo_url
            } else {
              const imagePath = profileData.profile_photo_url.includes('/')
                ? profileData.profile_photo_url
                : `profile-photos/${profileData.profile_photo_url}`

              const { data: urlData } = supabase.storage
                .from("uploads")
                .getPublicUrl(imagePath)

              photoImg.src = urlData?.publicUrl || '/placeholder-user.jpg'
            }
          })

          // Draw rounded photo
          const photoX = 70
          const photoY = 200
          const photoWidth = 310
          const photoHeight = 325
          const photoRadius = 20

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(photoX + photoRadius, photoY)
          ctx.lineTo(photoX + photoWidth - photoRadius, photoY)
          ctx.quadraticCurveTo(photoX + photoWidth, photoY, photoX + photoWidth, photoY + photoRadius)
          ctx.lineTo(photoX + photoWidth, photoY + photoHeight - photoRadius)
          ctx.quadraticCurveTo(photoX + photoWidth, photoY + photoHeight, photoX + photoWidth - photoRadius, photoY + photoHeight)
          ctx.lineTo(photoX + photoRadius, photoY + photoHeight)
          ctx.quadraticCurveTo(photoX, photoY + photoHeight, photoX, photoY + photoHeight - photoRadius)
          ctx.lineTo(photoX, photoY + photoRadius)
          ctx.quadraticCurveTo(photoX, photoY, photoX + photoRadius, photoY)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight)
          ctx.restore()
        } catch (error) {
          console.error('Error loading photo:', error)
        }
      }

      // Set text alignment and font
      ctx.textAlign = 'left'
      const fontFamily = this.righteousFont ? 'Righteous, Arial' : 'Arial'

      // Draw Member Name (WHITE color)
      ctx.font = `bold 50px ${fontFamily}`
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(profileData.display_name.toUpperCase(), 400, 320)

      // Draw other fields (RED color)
      ctx.font = `bold 18px ${fontFamily}`
      ctx.fillStyle = '#e52b29'

      // Member ID - Use member_code instead of profile.id
      const memberID = profileData.member_code || profileData.id.slice(0, 8).toUpperCase()
      
      console.log('🔍 ID Card Generation Debug:', {
        profileId: profileData.id,
        memberCode: profileData.member_code,
        finalMemberID: memberID,
        fallbackUsed: !profileData.member_code
      })
      
      ctx.fillText(memberID, 395, 410)

      // Birth Date
      const formattedBirthDate = this.formatBirthDate(profileData.birth_date)
      ctx.fillText(formattedBirthDate, 590, 410)

      // Gender
      ctx.fillText(profileData.gender, 860, 410)

      // Province
      const provinceName = await this.getProvinceName(profileData.province_code)
      ctx.fillText(provinceName, 395, 490)

      // Status
      ctx.fillText(profileData.role.toUpperCase(), 595, 490)

      // Registration Date (BLACK color)
      ctx.fillStyle = '#000000'
      const regDate = this.formatRegistrationDate(profileData.created_at)
      ctx.fillText(regDate, 850, 580)

      return canvas
    } catch (error) {
      console.error('Error generating ID card canvas:', error)
      return null
    }
  }

  // Function to delete old ID card from storage
  static async deleteOldIDCard(oldImagePath: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting old ID card:', oldImagePath)
      
      const { error } = await supabase.storage
        .from('uploads')
        .remove([oldImagePath])

      if (error) {
        console.error('Error deleting old ID card:', error)
        return false
      }

      console.log('✅ Old ID card deleted successfully')
      return true
    } catch (error) {
      console.error('Unexpected error deleting old ID card:', error)
      return false
    }
  }

  // Main function to generate and save ID card
  static async generateAndSaveIDCard(userId: string): Promise<boolean> {
    try {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('User not authenticated for ID card generation:', { authError, userId })
        return false
      }

      console.log('Starting ID card generation for authenticated user:', {
        userId,
        authUserId: user.id,
        userEmail: user.email
      })

      // Pre-check: Ensure storage bucket exists
      const bucketExists = await ensureUploadsBucket()
      if (!bucketExists) {
        console.error('Upload bucket is not accessible. Please check Supabase storage configuration.')
        return false
      }

      const folderExists = await ensureIDCardsFolder()
      if (!folderExists) {
        console.error('ID cards folder is not accessible. Please check Supabase storage permissions.')
        return false
      }

      // Get user profile data with explicit field selection
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          birth_date,
          gender,
          province_code,
          role,
          profile_photo_url,
          created_at,
          member_code,
          id_card_image
        `)
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError)
        return false
      }

      console.log('📊 Profile data fetched:', {
        id: profile.id,
        display_name: profile.display_name,
        member_code: profile.member_code,
        hasOldIDCard: !!profile.id_card_image,
        oldIDCardPath: profile.id_card_image,
        hasAllRequiredFields: !!(profile.display_name && profile.birth_date && profile.gender && profile.province_code)
      })

      // Check if required data exists
      if (!profile.display_name || !profile.birth_date || !profile.gender || !profile.province_code) {
        console.error('Missing required profile data for ID card generation')
        return false
      }

      // Check if member_code exists
      if (!profile.member_code) {
        console.warn('⚠️ Member code not found. Using fallback ID generation.', {
          userId,
          profileId: profile.id,
          displayName: profile.display_name
        })
        // Don't return false, let it use fallback
      } else {
        console.log('✅ Member code found:', profile.member_code)
      }

      console.log('🎯 Generating ID card with details:', {
        userId,
        memberCode: profile.member_code,
        displayName: profile.display_name,
        willUseFallback: !profile.member_code,
        hasOldIDCard: !!profile.id_card_image
      })

      // Delete old ID card if exists (for regeneration)
      if (profile.id_card_image) {
        console.log('🔄 Regenerating ID card - deleting old image first')
        const deleteSuccess = await this.deleteOldIDCard(profile.id_card_image)
        if (!deleteSuccess) {
          console.warn('⚠️ Failed to delete old ID card, proceeding with generation anyway')
        }
      }

      // Generate ID card canvas
      const canvas = await this.generateIDCardCanvas(profile)
      if (!canvas) {
        console.error('Failed to generate ID card canvas')
        return false
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/png', 1.0)
      })

      // Upload to Supabase storage
      const fileName = `id-card-${userId}-${Date.now()}.png`
      const filePath = `id-cards/${fileName}`
      
      console.log('Attempting to upload ID card:', {
        fileName,
        filePath,
        blobSize: blob.size,
        blobType: blob.type
      })

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, blob)

      if (uploadError) {
        console.error('Error uploading ID card to Supabase storage:', {
          error: uploadError,
          message: uploadError?.message,
          fileName,
          filePath,
          userId,
          authUserId: user.id,
          userEmail: user.email,
          errorDetails: JSON.stringify(uploadError, null, 2)
        })
        return false
      }

      if (!uploadData?.path) {
        console.error('Upload succeeded but no path returned:', uploadData)
        return false
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(uploadData.path)

      if (!urlData?.publicUrl) {
        console.error('Failed to get public URL for ID card:', {
          uploadPath: uploadData.path,
          urlData
        })
        return false
      }

      console.log('Successfully generated public URL for ID card:', {
        path: uploadData.path,
        publicUrl: urlData.publicUrl
      })

      // Update user profile with ID card URL  
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ id_card_image: uploadData.path })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile with ID card URL:', {
          error: updateError,
          message: updateError?.message,
          userId,
          idCardPath: uploadData.path
        })
        return false
      }

      console.log('Successfully generated and saved ID card for user:', {
        userId,
        fileName,
        filePath: uploadData.path,
        publicUrl: urlData.publicUrl
      })

      return true

    } catch (error: any) {
      console.error('Error in generateAndSaveIDCard:', {
        error,
        message: error?.message,
        userId
      })
      return false
    }
  }
}
