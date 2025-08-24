"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"


export function AddCompetitionForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    registrationDeadline: "",
  })
  const [validationError, setValidationError] = useState("")
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Helper function to convert dd/mm/yyyy format to Date object
  const parseDate = (dateString: string): Date | null => {
    if (!dateString || dateString.length !== 10) return null;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date constructor
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1000 || year > 9999) return null;
    
    const date = new Date(year, month, day);
    
    // Check if the date is valid (handles edge cases like 31/02/2024)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  };

  const validateField = (name: string, value: string, formData: any): string => {
    let error = "";
    
    // Parse dates from dd/mm/yyyy format
    let competitionDate: Date | null = null;
    let registrationDeadline: Date | null = null;
    
    if (name === "date") {
      competitionDate = parseDate(value);
      if (!competitionDate) {
        return "Please enter a valid date in dd/mm/yyyy format (e.g., 25/12/2024)";
      }
    }
    
    if (name === "registrationDeadline") {
      registrationDeadline = parseDate(value);
      if (!registrationDeadline) {
        return "Please enter a valid date in dd/mm/yyyy format (e.g., 20/12/2024)";
      }
    }
    
    // Get existing dates for comparison
    if (!competitionDate && formData.date) {
      competitionDate = parseDate(formData.date);
    }
    
    if (!registrationDeadline && formData.registrationDeadline) {
      registrationDeadline = parseDate(formData.registrationDeadline);
    }
    
    // Validation logic for competition date vs registration deadline
    if (competitionDate && registrationDeadline) {
      if (competitionDate < registrationDeadline) {
        error = "Competition date cannot be earlier than registration deadline."
      } else if (competitionDate.getTime() === registrationDeadline.getTime()) {
        error = "Competition date should be after registration deadline for better organization."
      }
    }
    
    // Additional validation: ensure dates are not in the past
    if (competitionDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
      
      if (competitionDate < today) {
        error = "Competition date cannot be in the past."
      }
    }
    
    if (registrationDeadline) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
      
      if (registrationDeadline < today) {
        error = "Registration deadline cannot be in the past."
      }
    }
    
    // Additional validation: ensure there's a reasonable gap between deadline and competition
    if (competitionDate && registrationDeadline) {
      if (competitionDate > registrationDeadline) {
        const timeDiff = competitionDate.getTime() - registrationDeadline.getTime()
        const daysDiff = timeDiff / (1000 * 3600 * 24)
        
        if (daysDiff < 1) {
          error = "There should be at least 1 day between registration deadline and competition date."
        }
      }
    }
    
    return error;
  };

  // Helper function to auto-format date input as dd/mm/yyyy
  const formatDateInput = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 8 digits (ddmmyyyy)
    if (numbers.length > 8) return value;
    
    // Format as dd/mm/yyyy
    if (numbers.length >= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    } else if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }
    
    return numbers;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => {
      let updatedValue = value;
      
      // Auto-format date fields
      if (name === "date" || name === "registrationDeadline") {
        updatedValue = formatDateInput(value);
      }
      
      const updatedFormData = { ...prev, [name]: updatedValue }
      
      // Run validation for the changed field
      let error = validateField(name, updatedValue, updatedFormData);
      
      // If no error for the changed field, also validate the other date field to ensure overall consistency
      if (!error && (name === "date" || name === "registrationDeadline")) {
        const otherField = name === "date" ? "registrationDeadline" : "date";
        if (updatedFormData[otherField]) {
          const otherError = validateField(otherField, updatedFormData[otherField], updatedFormData);
          if (otherError) {
            error = otherError;
          }
        }
      }
      
      setValidationError(error);

      return updatedFormData
    })
  }

  const validateForm = () => {
    // Parse dates from dd/mm/yyyy format
    const competitionDate = parseDate(formData.date);
    const registrationDeadline = parseDate(formData.registrationDeadline);
    
    if (!competitionDate) {
      setValidationError("Please enter a valid competition date in dd/mm/yyyy format (e.g., 25/12/2024)");
      return false;
    }
    
    if (!registrationDeadline) {
      setValidationError("Please enter a valid registration deadline in dd/mm/yyyy format (e.g., 20/12/2024)");
      return false;
    }
    
    // Check if competition date is before registration deadline
    if (competitionDate < registrationDeadline) {
      setValidationError("Competition date cannot be earlier than registration deadline.")
      return false
    }
    
    if (competitionDate.getTime() === registrationDeadline.getTime()) {
      setValidationError("Competition date should be after registration deadline for better organization.")
      return false
    }
    
    // Additional validation: ensure there's a reasonable gap between deadline and competition
    const timeDiff = competitionDate.getTime() - registrationDeadline.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    
    if (daysDiff < 1) {
      setValidationError("There should be at least 1 day between registration deadline and competition date.")
      return false
    }
    
    // Check if dates are not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (competitionDate < today) {
      setValidationError("Competition date cannot be in the past.")
      return false
    }
    
    if (registrationDeadline < today) {
      setValidationError("Registration deadline cannot be in the past.")
      return false
    }
    
    setValidationError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)

    let uploadedImagePath = ""

    try {
      // Parse dates from dd/mm/yyyy format
      const competitionDate = parseDate(formData.date);
      const registrationDeadline = parseDate(formData.registrationDeadline);
      
      if (!competitionDate || !registrationDeadline) {
        throw new Error("Invalid date format");
      }
      
      const currentDate = new Date()
      const registrationOpen =
        currentDate >= competitionDate && currentDate <= registrationDeadline

      let imageUrl = ""
      if (imageInputRef.current?.files?.[0]) {
        const file = imageInputRef.current.files[0]
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(`competitions/${file.name}`, file)

        if (uploadError) {
          throw uploadError
        }

        uploadedImagePath = `competitions/${file.name}`

        const { data: publicData } = supabase.storage
          .from("uploads")
          .getPublicUrl(uploadedImagePath)

        if (!publicData?.publicUrl) {
          throw new Error("Failed to retrieve public URL for the uploaded image.")
        }

        imageUrl = publicData.publicUrl
      }

      const { data: user } = await supabase.auth.getUser()

      const { error } = await supabase.from("competitions").insert({
        name: formData.name,
        description: formData.description,
        date: competitionDate.toISOString(),
        location: formData.location,
        registration_deadline: registrationDeadline.toISOString(),
        registration_open: registrationOpen,
        image: imageUrl,
        created_by: user?.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      })

      if (error) {
        throw error
      }

      toast({
        title: "Competition Created",
        description: "The competition has been successfully created.",
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        date: "",
        location: "",
        registrationDeadline: "",
      })
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    } catch (error) {
      if (uploadedImagePath) {
        await supabase.storage.from("uploads").remove([uploadedImagePath])
      }

      toast({
        title: "Error",
        description: "Failed to create competition. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-red-600" />
            <span>Competition Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Competition Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., 2024 World Championships"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Orlando, Florida, USA"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the competition..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Competition Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="text"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  className={validationError && validationError.includes("competition date") ? "border-red-500 bg-red-50" : ""}
                />
                <p className="text-xs text-gray-500">
                  Format: dd/mm/yyyy (e.g., 25/12/2024)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
                <Input
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="text"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  required
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  className={validationError && validationError.includes("registration deadline") ? "border-red-500 bg-red-50" : ""}
                />
                <p className="text-xs text-gray-500">
                  Format: dd/mm/yyyy (e.g., 20/12/2024)
                </p>
              </div>
            </div>
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {validationError}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="image">Competition Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                ref={imageInputRef}
                accept="image/*"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        {/* <Button type="button" variant="outline" className="bg-transparent">
          Cancel
        </Button> */}
        <Button
          type="submit"
          disabled={isSubmitting || validationError !== ""}
          className="bg-red-600 hover:bg-red-700"
        >
          {isSubmitting ? "Creating..." : "Create Competition"}
        </Button>
      </div>
    </form>
  )
}
