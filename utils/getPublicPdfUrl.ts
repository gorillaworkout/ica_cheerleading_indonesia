import { supabase } from "@/lib/supabase"

export async function getPublicPdfUrl(filename: string): Promise<string | null> {
  if (!filename) {
    return null
  }

  try {
    // Get public URL for PDF from uploads bucket
    const { data } = supabase.storage.from("uploads").getPublicUrl(filename)
    
    if (data?.publicUrl) {
      return data.publicUrl
    }
    
    return null
  } catch (error) {
    // console.error("Error getting PDF URL:", error)
    return null
  }
}

export function getDirectPdfUrl(filename: string): string {
  // Generate direct URL with correct path: public/filename
  const fullPath = `public/${filename}`
  const { data } = supabase.storage.from("uploads").getPublicUrl(fullPath)
  return data.publicUrl
}

export async function findPdfFile(searchTerm: string): Promise<string | null> {
  try {
    // Search in uploads bucket, public folder
    const { data: publicFiles, error: publicError } = await supabase.storage
      .from("uploads")
      .list("public", {
        search: searchTerm
      })
    
    if (!publicError && publicFiles && publicFiles.length > 0) {
      const pdfFile = publicFiles.find(file => file.name.endsWith('.pdf'))
      if (pdfFile) {
        const { data } = supabase.storage.from("uploads").getPublicUrl(`public/${pdfFile.name}`)
        return data.publicUrl
      }
    }

    // Also search in root uploads folder
    const { data: uploadFiles, error: uploadError } = await supabase.storage
      .from("uploads")
      .list("", {
        search: searchTerm
      })
    
    if (!uploadError && uploadFiles && uploadFiles.length > 0) {
      const pdfFile = uploadFiles.find(file => file.name.endsWith('.pdf'))
      if (pdfFile) {
        const { data } = supabase.storage.from("uploads").getPublicUrl(pdfFile.name)
        return data.publicUrl
      }
    }

    // If not found in uploads, try other common bucket names
    const buckets = ["public", "documents", "files", "pdfs"]
    
    for (const bucket of buckets) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list("", {
            search: searchTerm
          })
        
        if (!error && files && files.length > 0) {
          const pdfFile = files.find(file => file.name.endsWith('.pdf'))
          if (pdfFile) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(pdfFile.name)
            return data.publicUrl
          }
        }
      } catch (bucketError) {
        // Bucket might not exist, continue to next
        continue
      }
    }
    
    return null
  } catch (error) {
    console.error("Error finding PDF file:", error)
    return null
  }
}
