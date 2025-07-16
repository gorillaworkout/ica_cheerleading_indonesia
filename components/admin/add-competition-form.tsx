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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value }

      if (name === "date" && updatedFormData.registrationDeadline) {
        const competitionDate = new Date(value)
        const registrationDeadline = new Date(updatedFormData.registrationDeadline)

        if (competitionDate < registrationDeadline) {
          setValidationError("Competition date cannot be earlier than registration deadline.")
        } else {
          setValidationError("")
        }
      }

      if (name === "registrationDeadline" && updatedFormData.date) {
        const competitionDate = new Date(updatedFormData.date)
        const registrationDeadline = new Date(value)

        if (registrationDeadline > competitionDate) {
          setValidationError("Registration deadline cannot be later than competition date.")
        } else {
          setValidationError("")
        }
      }

      return updatedFormData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let uploadedImagePath = ""

    try {
      const currentDate = new Date()
      const competitionDate = new Date(formData.date)
      const registrationDeadline = new Date(formData.registrationDeadline)

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
        date: formData.date,
        location: formData.location,
        registration_deadline: formData.registrationDeadline,
        registration_open: registrationOpen,
        image: imageUrl,
        created_by: user?.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Competition Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
              <Input
                id="registrationDeadline"
                name="registrationDeadline"
                type="date"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {validationError && (
            <p className="text-red-600">{validationError}</p>
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
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" className="bg-transparent">
          Cancel
        </Button>
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
