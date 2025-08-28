import { supabase } from "@/lib/supabase"

export async function getPublicImageUrl(path: string | null | undefined): Promise<string | null> {
  if (!path || path === "" || path === "{}" || path === "null" || path === "undefined") {
    console.warn("Invalid or empty path provided to getPublicImageUrl:", path)
    return null
  }

  try {
    // If path is already a full URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

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

    console.warn("Failed to find image in any folder:", path)
    return null
  } catch (error) {
    console.error("Error in getPublicImageUrl:", error)
    return null
  }
}

// Synchronous version for immediate use (tries common patterns)
export function getPublicImageUrlSync(path: string | null | undefined): string | null {
  if (!path || path === "" || path === "{}" || path === "null" || path === "undefined") {
    console.warn("Invalid or empty path provided to getPublicImageUrlSync:", path)
    return null
  }

  try {
    // If path is already a full URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

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
  if (!path || path === "" || path === "{}" || path === "null" || path === "undefined") {
    return "/placeholder.svg"
  }

  // Handle JSON string paths
  if (path.startsWith('{') && path.endsWith('}')) {
    try {
      const parsed = JSON.parse(path)
      if (parsed && typeof parsed === 'object') {
        // Check if object is empty
        if (Object.keys(parsed).length === 0) {
          console.warn("Path is an empty JSON object:", path)
          return "/placeholder.svg"
        }
        console.warn("Path is a JSON object, cannot resolve:", path)
        return "/placeholder.svg"
      }
    } catch (e) {
      console.warn("Failed to parse JSON path:", path)
      return "/placeholder.svg"
    }
  }

  try {
    // If path is already a full URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Clean the path - remove any invalid characters that might cause URL construction to fail
    let cleanPath = path.trim()
    
    // Remove any control characters or invalid URL characters
    cleanPath = cleanPath.replace(/[\x00-\x1f\x7f]/g, '')
    
    // If path is empty after cleaning, return placeholder
    if (!cleanPath || cleanPath === "") {
      console.warn("Path is empty after cleaning:", path)
      return "/placeholder.svg"
    }

    // If path already contains folder structure, use it directly
    const fullPath = cleanPath.includes('/') ? cleanPath : `profile-photos/${cleanPath}`
    
    // Validate the path before generating URL
    if (fullPath.includes('..') || fullPath.includes('//') || fullPath.length > 1000) {
      console.warn("Invalid path detected:", fullPath)
      return "/placeholder.svg"
    }
    
    const { data } = supabase.storage.from("uploads").getPublicUrl(fullPath)
    
    // Validate the generated URL
    if (data?.publicUrl) {
      try {
        new URL(data.publicUrl) // This will throw if URL is invalid
        return data.publicUrl
      } catch (urlError) {
        console.error("Generated invalid URL:", data.publicUrl, "for path:", fullPath)
        return "/placeholder.svg"
      }
    }
    
    return "/placeholder.svg"
  } catch (error) {
    console.error("Error generating storage URL:", error, "for path:", path)
    return "/placeholder.svg"
  }
}
