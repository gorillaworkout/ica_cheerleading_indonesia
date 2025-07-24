import { supabase } from '@/lib/supabase'

/**
 * Ensures that the uploads storage bucket exists
 * This function should be called before attempting to upload files
 */
export async function ensureUploadsBucket(): Promise<boolean> {
  try {
    // Try to list files in the bucket to check if it exists
    const { data, error } = await supabase.storage
      .from('uploads')
      .list('', { limit: 1 })

    if (error) {
      console.error('Error checking uploads bucket:', {
        error: error,
        message: error?.message
      })
      
      // If bucket doesn't exist, the error might be about bucket not found
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        console.log('Uploads bucket does not exist. Please create it in Supabase dashboard.')
        return false
      }
      
      // Other errors might be permission issues
      return false
    }

    console.log('Uploads bucket is accessible')
    return true
  } catch (error: any) {
    console.error('Unexpected error checking uploads bucket:', error)
    return false
  }
}

/**
 * Ensures that the id-cards folder exists in the uploads bucket
 */
export async function ensureIDCardsFolder(): Promise<boolean> {
  try {
    // Try to list the id-cards folder
    const { data, error } = await supabase.storage
      .from('uploads')
      .list('id-cards', { limit: 1 })

    if (error) {
      console.error('Error checking id-cards folder:', {
        error: error,
        message: error?.message
      })
      return false
    }

    console.log('ID cards folder is accessible')
    return true
  } catch (error: any) {
    console.error('Unexpected error checking id-cards folder:', error)
    return false
  }
}
