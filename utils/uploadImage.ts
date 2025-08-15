import { supabase } from "@/lib/supabase"

export interface UploadImageResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export async function uploadJudgeProfileImage(
  file: File,
  judgeId: string
): Promise<UploadImageResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File harus berupa gambar'
      }
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Ukuran file maksimal 2MB'
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const timestamp = Date.now()
    const filename = `judge-${judgeId}-${timestamp}.${fileExtension}`
    const filePath = `profile-photos/${filename}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false // Don't overwrite, create new file
      })

    if (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: `Upload gagal: ${error.message}`
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }

  } catch (err) {
    console.error("Error uploading image:", err)
    return {
      success: false,
      error: 'Terjadi kesalahan saat upload'
    }
  }
}

export async function deleteJudgeProfileImage(imagePath: string): Promise<boolean> {
  try {
    if (!imagePath) return true

    const { error } = await supabase.storage
      .from("uploads")
      .remove([imagePath])

    if (error) {
      console.error("Delete error:", error)
      return false
    }

    return true
  } catch (err) {
    console.error("Error deleting image:", err)
    return false
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'File harus berupa gambar (JPG, PNG, GIF, dll)'
    }
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Ukuran file maksimal 2MB'
    }
  }

  return { valid: true }
}
