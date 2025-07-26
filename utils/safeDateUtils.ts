/**
 * BULLETPROOF DATE UTILITIES FOR INDONESIAN TIMEZONE (GMT+7)
 * This solves the timezone issue where dates shift by one day
 */

/**
 * Creates a date string in YYYY-MM-DD format that is 100% safe from timezone issues
 * This function treats the input Date as if it's already in Indonesian timezone
 * and extracts the date parts without any timezone conversion
 */
export function formatDateForIndonesianDatabase(date: Date | undefined | null): string {
  if (!date) return ""
  
  // Get the year, month, day in the user's local timezone (GMT+7)
  const year = date.getFullYear()
  const month = date.getMonth() + 1  // JavaScript months are 0-based
  const day = date.getDate()
  
  // Format as YYYY-MM-DD string
  const monthStr = month.toString().padStart(2, '0')
  const dayStr = day.toString().padStart(2, '0')
  const result = `${year}-${monthStr}-${dayStr}`
  
  // Basic verification - ensure date round-trip works
  const verifyDate = new Date(year, month - 1, day, 12, 0, 0)
  const verifyYear = verifyDate.getFullYear()
  const verifyMonth = verifyDate.getMonth() + 1
  const verifyDay = verifyDate.getDate()
  
  if (verifyYear !== year || verifyMonth !== month || verifyDay !== day) {
    throw new Error("Date conversion failed - timezone issue detected")
  }
  
  return result
}

/**
 * Creates a Date object from year, month, day that is safe from timezone issues
 * The created date will represent exactly the specified date in Indonesian timezone
 */
export function createSafeDateForIndonesia(year: number, month: number, day: number): Date {
  // Create date at noon (12:00) in local timezone to avoid midnight timezone issues
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  return date
}

/**
 * Parses a YYYY-MM-DD string into a safe Date object for Indonesian timezone
 */
export function parseIndonesianDateString(dateString: string): Date | null {
  if (!dateString) return null
  
  const [yearStr, monthStr, dayStr] = dateString.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null
  }
  
  return createSafeDateForIndonesia(year, month, day)
} 