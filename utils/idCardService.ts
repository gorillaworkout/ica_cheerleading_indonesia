import { supabase } from '@/lib/supabase'

interface IDCardData {
  memberID: string
  name: string
  birthDate: string
  gender: string
  province: string
  status: string
  photo: string
}

export class IDCardService {
  private static async loadTemplateImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = '/id_card.jpg'
    })
  }

  private static async loadUserPhoto(photoUrl: string): Promise<HTMLImageElement | null> {
    if (!photoUrl) return null

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      
      if (photoUrl.includes('http')) {
        img.src = photoUrl
      } else {
        const imagePath = photoUrl.includes('/') ? photoUrl : `profile-photos/${photoUrl}`
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(imagePath)
        img.src = urlData?.publicUrl || '/placeholder.svg'
      }
    })
  }

  private static async drawIDCard(
    templateImage: HTMLImageElement,
    userPhoto: HTMLImageElement | null,
    data: IDCardData
  ): Promise<Blob> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    // Set canvas size to match template
    canvas.width = 1012
    canvas.height = 638

    // Draw template background
    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height)

    // Draw user photo if available
    if (userPhoto) {
      const photoX = 210
      const photoY = 245
      const photoWidth = 150
      const photoHeight = 200
      
      ctx.save()
      ctx.beginPath()
      ctx.rect(photoX, photoY, photoWidth, photoHeight)
      ctx.clip()
      ctx.drawImage(userPhoto, photoX, photoY, photoWidth, photoHeight)
      ctx.restore()
    }

    // Set text styles
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'left'
    ctx.font = 'bold 18px Arial'

    // Draw text data
    ctx.fillStyle = '#D4AF37' // Gold color for labels

    // Member ID
    ctx.fillText('ID:', 400, 380)
    ctx.fillStyle = '#333333'
    ctx.fillText(data.memberID, 450, 380)

    // Birth Date
    ctx.fillStyle = '#D4AF37'
    ctx.fillText('BIRTH OF DATE:', 593, 380)
    ctx.fillStyle = '#333333'
    ctx.fillText(data.birthDate, 730, 380)

    // Gender
    ctx.fillStyle = '#D4AF37'
    ctx.fillText('GENDER:', 857, 380)
    ctx.fillStyle = '#333333'
    ctx.fillText(data.gender, 930, 380)

    // Province
    ctx.fillStyle = '#D4AF37'
    ctx.fillText('PROVINCE:', 392, 450)
    ctx.fillStyle = '#333333'
    ctx.fillText(data.province, 500, 450)

    // Status
    ctx.fillStyle = '#D4AF37'
    ctx.fillText('STATUS:', 592, 450)
    ctx.fillStyle = '#333333'
    ctx.fillText(data.status, 670, 450)

    // Member Name (larger font)
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#333333'
    ctx.fillText(data.name.toUpperCase(), 400, 320)

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png', 1.0)
    })
  }

  static async generateIDCard(userId: string, profileData: any, provinces: any[]): Promise<string | null> {
    try {
      // Prepare ID card data
      const getProvinceName = (code: string) => {
        const province = provinces.find(p => p.id_province === code)
        return province ? province.name : code
      }

      const idCardData: IDCardData = {
        memberID: userId.slice(0, 8).toUpperCase(),
        name: profileData.display_name || 'Member Name',
        birthDate: profileData.birth_date || '',
        gender: profileData.gender || '',
        province: getProvinceName(profileData.province_code || ''),
        status: profileData.role?.toUpperCase() || 'MEMBER',
        photo: profileData.profile_photo_url || ''
      }

      // Load template and user photo
      const [templateImage, userPhoto] = await Promise.all([
        this.loadTemplateImage(),
        this.loadUserPhoto(idCardData.photo)
      ])

      // Generate ID card
      const blob = await this.drawIDCard(templateImage, userPhoto, idCardData)

      // Upload to Supabase storage
      const fileName = `id-card-${userId}-${Date.now()}.png`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(`id-cards/${fileName}`, blob)

      if (uploadError) throw uploadError

      // Update user profile with ID card URL
    //   await supabase
    //     .from('profiles')
    //     .update({ id_card_url: uploadData.path })
    //     .eq('id', userId)

      return uploadData.path

    } catch (error) {
      console.error('Error generating ID card:', error)
      return null
    }
  }

  static async regenerateIDCard(userId: string): Promise<string | null> {
    try {
      // Get current profile data
    //   const { data: profile, error: profileError } = await supabase
    //     .from('profiles')
    //     .select('*')
    //     .eq('id', userId)
    //     .single()

    //   if (profileError || !profile) throw new Error('Profile not found')

    //   // Get provinces data (you might want to cache this)
    //   const { data: provinces, error: provincesError } = await supabase
    //     .from('provinces')
    //     .select('*')

    //   if (provincesError) throw provincesError

    //   return await this.generateIDCard(userId, profile, provinces || [])
    return await ""

    } catch (error) {
      console.error('Error regenerating ID card:', error)
      return null
    }
  }
}
