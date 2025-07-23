import { supabase } from "@/lib/supabase"

export async function getPublicImageUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) {
    console.error("Invalid path provided to getPublicImageUrl")
    return null
  }

  try {
    // If path already contains folder structure, use it directly
    if (path.includes('/')) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path)
      return data?.publicUrl || null
    }

    // List of possible folders where images might be stored
    const folders = ['news-images', 'competitions', 'id-photos', 'profile-photos', 'public', '']

    // Try to find the file in each folder
    for (const folder of folders) {
      try {
        const fullPath = folder ? `${folder}/${path}` : path
        
        // Check if file exists in this folder
        const { data: listData, error } = await supabase.storage
          .from("uploads")
          .list(folder, { search: path })

        if (!error && listData && listData.length > 0) {
          // File found in this folder, generate public URL
          const { data } = supabase.storage.from("uploads").getPublicUrl(fullPath)
          
          if (data?.publicUrl) {
            return data.publicUrl
          }
        }
      } catch (error) {
        // Folder check failed, continue to next folder
        console.warn(`Failed to check folder ${folder}:`, error)
      }
    }

    console.error("Failed to find image in any folder:", path)
    return null
  } catch (error) {
    console.error("Error in getPublicImageUrl:", error)
    return null
  }
}

// Synchronous version for immediate use (tries common patterns)
export function getPublicImageUrlSync(path: string | null | undefined): string | null {
  if (!path) {
    console.error("Invalid path provided to getPublicImageUrlSync")
    return null
  }

  try {
    // If path already contains folder structure, use it directly
    if (path.includes('/')) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path)
      return data?.publicUrl || null
    }

    // Try most likely folder first for profile photos
    const { data } = supabase.storage.from("uploads").getPublicUrl(`profile-photos/${path}`)
    if (data?.publicUrl) {
      return data.publicUrl
    }

    // Fallback to other patterns
    const fallbackPaths = [
      `news-images/${path}`,
      `competitions/${path}`,
      `public/${path}`,
      path // root folder
    ]

    for (const fullPath of fallbackPaths) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(fullPath)
      if (data?.publicUrl) {
        return data.publicUrl
      }
    }

    return null
  } catch (error) {
    console.error("Error in getPublicImageUrlSync:", error)
    return null
  }
}

// Helper function to generate direct URL from storage path
export function generateStorageUrl(path: string | null | undefined): string {
  if (!path) {
    return "/placeholder.svg"
  }

  try {
    // If path already contains folder structure, use it directly
    const fullPath = path.includes('/') ? path : `profile-photos/${path}`
    const { data } = supabase.storage.from("uploads").getPublicUrl(fullPath)
    return data?.publicUrl || "/placeholder.svg"
  } catch (error) {
    console.error("Error generating storage URL:", error)
    return "/placeholder.svg"
  }
}
