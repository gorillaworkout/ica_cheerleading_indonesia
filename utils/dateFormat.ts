/**
 * Utility functions for consistent date formatting
 * Format: dd/mm/yyyy (Indonesian format)
 * Manual implementation to ensure consistent dd/mm/yyyy format across all browsers
 */

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  const dateObject = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObject.getTime())) return '';
  
  // Manual formatting to ensure dd/mm/yyyy format
  const day = dateObject.getDate().toString().padStart(2, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObject.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export const formatDateLong = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  const dateObject = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObject.getTime())) return '';
  
  return dateObject.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  const dateObject = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObject.getTime())) return '';
  
  // Manual formatting to ensure dd/mm/yyyy HH:mm format
  const day = dateObject.getDate().toString().padStart(2, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObject.getFullYear();
  const hours = dateObject.getHours().toString().padStart(2, '0');
  const minutes = dateObject.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
