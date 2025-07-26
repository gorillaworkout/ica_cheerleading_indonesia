// components/ui/date-picker.tsx

"use client"

import * as React from "react"
import { addYears, format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: boolean
}

export function DatePicker({ date, onChange, disabled }: DatePickerProps) {
  const today = new Date();
  const maxDate = addYears(today, -5);

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
          onSelect={onChange}
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
  );
}
