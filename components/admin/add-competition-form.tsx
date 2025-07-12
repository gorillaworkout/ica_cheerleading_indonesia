"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Plus, Trash2 } from "lucide-react"

interface Division {
  id: string
  name: string
  ageGroup: string
  skillLevel: string
  price: number
  maxTeams: number
}

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
  const [divisions, setDivisions] = useState<Division[]>([
    {
      id: "1",
      name: "",
      ageGroup: "",
      skillLevel: "",
      price: 0,
      maxTeams: 0,
    },
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDivisionChange = (id: string, field: keyof Division, value: string | number) => {
    setDivisions((prev) => prev.map((division) => (division.id === id ? { ...division, [field]: value } : division)))
  }

  const addDivision = () => {
    const newDivision: Division = {
      id: Date.now().toString(),
      name: "",
      ageGroup: "",
      skillLevel: "",
      price: 0,
      maxTeams: 0,
    }
    setDivisions((prev) => [...prev, newDivision])
  }

  const removeDivision = (id: string) => {
    if (divisions.length > 1) {
      setDivisions((prev) => prev.filter((division) => division.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

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
      setDivisions([
        {
          id: "1",
          name: "",
          ageGroup: "",
          skillLevel: "",
          price: 0,
          maxTeams: 0,
        },
      ])
    } catch (error) {
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
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
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
        </CardContent>
      </Card>

      {/* Divisions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <span>Competition Divisions</span>
            </CardTitle>
            <Button type="button" onClick={addDivision} variant="outline" size="sm" className="bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Division
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {divisions.map((division, index) => (
            <div key={division.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Division {index + 1}</h3>
                {divisions.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeDivision(division.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Division Name *</Label>
                  <Input
                    value={division.name}
                    onChange={(e) => handleDivisionChange(division.id, "name", e.target.value)}
                    placeholder="e.g., Senior Level 5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age Group *</Label>
                  <Input
                    value={division.ageGroup}
                    onChange={(e) => handleDivisionChange(division.id, "ageGroup", e.target.value)}
                    placeholder="e.g., 15-18"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skill Level *</Label>
                  <Input
                    value={division.skillLevel}
                    onChange={(e) => handleDivisionChange(division.id, "skillLevel", e.target.value)}
                    placeholder="e.g., Elite"
                    required
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    value={division.price}
                    onChange={(e) => handleDivisionChange(division.id, "price", Number.parseFloat(e.target.value) || 0)}
                    placeholder="150"
                    min="0"
                    step="0.01"
                    required
                  />
                </div> */}
                {/* <div className="space-y-2">
                  <Label>Max Teams</Label>
                  <Input
                    type="number"
                    value={division.maxTeams}
                    onChange={(e) =>
                      handleDivisionChange(division.id, "maxTeams", Number.parseInt(e.target.value) || 0)
                    }
                    placeholder="32"
                    min="0"
                  />
                </div> */}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" className="bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
          {isSubmitting ? "Creating..." : "Create Competition"}
        </Button>
      </div>
    </form>
  )
}
