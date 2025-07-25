"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { createJudge, updateJudge, selectJudgesLoading } from "@/features/judges/judgesSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Scale, Save, Loader2 } from "lucide-react"
import { Judge } from "@/types/judges"

interface AddJudgeFormProps {
  judge?: Judge | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddJudgeForm({ judge, onSuccess, onCancel }: AddJudgeFormProps) {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectJudgesLoading)

  const [formData, setFormData] = useState({
    name: judge?.name || "",
    title: judge?.title || "Certified Judge",
    specialization: judge?.specialization || "",
    experience: judge?.experience || "",
    bio: judge?.bio || "",
    location: judge?.location || "",
    email: judge?.email || "",
    phone: judge?.phone || "",
    philosophy: judge?.philosophy || "",
    competitions_judged: judge?.competitions_judged || 0,
    years_experience: judge?.years_experience || 0,
    certification_level: judge?.certification_level || "Level 1",
    is_active: judge?.is_active ?? true,
    is_featured: judge?.is_featured ?? false,
    sort_order: judge?.sort_order || 0,
  })

  const [certifications, setCertifications] = useState<string[]>(judge?.certifications || [])
  const [achievements, setAchievements] = useState<string[]>(judge?.achievements || [])
  const [specialties, setSpecialties] = useState<string[]>(judge?.specialties || [])
  const [newCertification, setNewCertification] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newSpecialty, setNewSpecialty] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setCertifications([...certifications, newCertification.trim()])
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()])
      setNewAchievement("")
    }
  }

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index))
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const judgeData = {
      ...formData,
      certifications,
      achievements,
      specialties,
    }

    try {
      if (judge) {
        await dispatch(updateJudge({ id: judge.id, ...judgeData })).unwrap()
      } else {
        await dispatch(createJudge(judgeData)).unwrap()
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving judge:", error)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scale className="h-5 w-5 text-red-600" />
          <span>{judge ? "Edit Judge" : "Add New Judge"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Judge Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter judge's full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Judge, Head Judge"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="judge@ica-indonesia.org"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+62-xxx-xxxx-xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Jakarta, Surabaya"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization*</Label>
              <Input
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
                placeholder="e.g., All-Star Cheerleading, School Cheer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience*</Label>
              <Input
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
                placeholder="e.g., 5+ years, 10+ years"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certification_level">Certification Level</Label>
              <select
                id="certification_level"
                name="certification_level"
                value={formData.certification_level}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
                <option value="International">International</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitions_judged">Competitions Judged</Label>
              <Input
                id="competitions_judged"
                name="competitions_judged"
                type="number"
                value={formData.competitions_judged}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                name="years_experience"
                type="number"
                value={formData.years_experience}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biography*</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Enter judge's biography and background..."
            />
          </div>

          {/* Philosophy */}
          <div className="space-y-2">
            <Label htmlFor="philosophy">Judging Philosophy</Label>
            <Textarea
              id="philosophy"
              name="philosophy"
              value={formData.philosophy}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter judge's judging philosophy and approach..."
            />
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <Label>Certifications</Label>
            <div className="flex space-x-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add certification"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{cert}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeCertification(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-3">
            <Label>Achievements</Label>
            <div className="flex space-x-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add achievement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
              />
              <Button type="button" onClick={addAchievement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{achievement}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeAchievement(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-3">
            <Label>Specialties</Label>
            <div className="flex space-x-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add specialty"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              />
              <Button type="button" onClick={addSpecialty} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{specialty}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeSpecialty(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Status Options */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {judge ? "Update Judge" : "Create Judge"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 