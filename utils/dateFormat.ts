/**
 * Utility functions for date formatting without timezone issues
 */

/**
 * Formats a Date object to YYYY-MM-DD string using local timezone
 * This prevents the common timezone issue where toISOString() can change the date
 * 
 * @param date - Date object to format
 * @returns YYYY-MM-DD string or empty string if date is null/undefined
 */
export function formatDateToLocalString(date: Date | undefined | null): string {
  if (!date) return ""
  
  // Debug logging for timezone issues
  console.log("🛠️ formatDateToLocalString - Input date:", date)
  console.log("🛠️ formatDateToLocalString - Date details:", {
    toString: date.toString(),
    toISOString: date.toISOString(),
    getTimezoneOffset: date.getTimezoneOffset(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  const result = `${year}-${month}-${day}`
  
  console.log("🛠️ formatDateToLocalString - Extracted parts:", {
    year,
    month,
    day,
    result
  })
  
  return result
}

/**
 * Gets today's date in YYYY-MM-DD format using local timezone
 * 
 * @returns Today's date as YYYY-MM-DD string
 */
export function getTodayLocalString(): string {
  return formatDateToLocalString(new Date())
}

/**
 * Parses a YYYY-MM-DD string to a Date object
 * This ensures consistent parsing without timezone issues
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or undefined if string is invalid
 */
export function parseDateFromLocalString(dateString: string): Date | undefined {
  if (!dateString) return undefined
  
  const [year, month, day] = dateString.split('-').map(Number)
  
  if (!year || !month || !day) return undefined
  
  // Create date with local timezone (month is 0-based in Date constructor)
  return new Date(year, month - 1, day)
}

/**
 * Formats a date for display purposes (DD/MM/YYYY format)
 * This is different from formatDateToLocalString which is for form inputs (YYYY-MM-DD)
 * 
 * @param date - Date string or Date object to format
 * @returns DD/MM/YYYY string or empty string if date is invalid
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObject = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObject.getTime())) return '';
  
  // Manual formatting to ensure dd/mm/yyyy format
  const day = dateObject.getDate().toString().padStart(2, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObject.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Common date formatting options for Indonesian locale
 */
export const DATE_FORMATS = {
  // DD/MM/YYYY format commonly used in Indonesia
  INDONESIA: (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  },
  
  // Full Indonesian date format
  INDONESIA_FULL: (date: Date): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }
}
