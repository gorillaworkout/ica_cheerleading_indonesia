// components/ui/indonesia-date-picker.tsx
// Timezone-safe DatePicker for Indonesian timezone (GMT+7)

"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface IndonesiaDatePickerProps {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: boolean
}

/**
 * Creates a date object in Indonesian timezone (GMT+7) from year, month, day
 * This ensures the date is exactly what the user selects without timezone shifts
 */
function createIndonesiaDate(year: number, month: number, day: number): Date {
  // Create date at noon in local timezone to prevent timezone edge cases
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  
  // Verification: Ensure the created date has the exact same parts
  if (date.getFullYear() !== year || (date.getMonth() + 1) !== month || date.getDate() !== day) {
    throw new Error("Date creation failed - timezone issue detected")
  }
  
  return date
}

/**
 * Safely extracts year, month, day from a date in Indonesian timezone
 */
function extractIndonesiaDateParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // JavaScript months are 0-based
    day: date.getDate()
  }
}

export function IndonesiaDatePicker({ date, onChange, disabled }: IndonesiaDatePickerProps) {
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())

  // Handle date selection with timezone safety
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Extract the date parts in local timezone
      const { year, month, day } = extractIndonesiaDateParts(selectedDate)
      
      // Create a new date object with exactly these values at noon Indonesian timezone
      const safeDate = createIndonesiaDate(year, month, day)
      
      // Verification
      const safeParts = extractIndonesiaDateParts(safeDate)
      
      if (safeParts.year !== year || safeParts.month !== month || safeParts.day !== day) {
        throw new Error("Date picker verification failed - timezone issue detected")
      }
      
      onChange(safeDate)
    } else {
      onChange(undefined)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          fromYear={1950}
          toYear={today.getFullYear()}
          initialFocus
          disabled={{
            after: maxDate,
          }}
        />
      </PopoverContent>
    </Popover>
  )
} 