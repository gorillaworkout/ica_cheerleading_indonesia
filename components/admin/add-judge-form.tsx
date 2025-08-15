"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { createJudge, updateJudge, selectJudgesLoading } from "@/features/judges/judgesSlice"
import { fetchLicenseCourses, selectAllLicenseCourses } from "@/features/license-courses/licenseCoursesSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Scale, Save, Loader2, Upload, Camera, Trash2 } from "lucide-react"
import { Judge } from "@/types/judges"
import { LicenseCourse } from "@/types/license-courses"
import { uploadJudgeProfileImage, deleteJudgeProfileImage, validateImageFile } from "@/utils/uploadImage"
import { generateStorageUrl } from "@/utils/getPublicImageUrl"
import Image from "next/image"

interface AddJudgeFormProps {
  judge?: Judge | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddJudgeForm({ judge, onSuccess, onCancel }: AddJudgeFormProps) {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectJudgesLoading)
  const licenseCourses = useAppSelector(selectAllLicenseCourses)

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

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    judge?.image_url ? generateStorageUrl(judge.image_url) : null
  )
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  // Fetch license courses on component mount
  useEffect(() => {
    dispatch(fetchLicenseCourses(false)) // Fetch all courses including inactive ones
  }, [dispatch])

  // Filter ICA courses only
  // const icaCourses = licenseCourses.filter(course => course.organization === 'ICA')

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setImageError(validation.error ?? 'File tidak valid')
      return
    }

    setImageError(null)
    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageError(null)
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

    try {
      let imageUrl = judge?.image_url || ""

      // Handle image upload if new image is selected
      if (selectedImage) {
        setImageUploading(true)
        
        // Generate temporary ID for new judge
        const tempId = judge?.id || `temp-${Date.now()}`
        
        const uploadResult = await uploadJudgeProfileImage(selectedImage, tempId)
        
        if (!uploadResult.success) {
          setImageError(uploadResult.error ?? 'Upload gambar gagal')
          setImageUploading(false)
          return
        }

        // Delete old image if updating
        if (judge?.image_url) {
          await deleteJudgeProfileImage(judge.image_url)
        }

        imageUrl = uploadResult.path || ""
        setImageUploading(false)
      }

      const judgeData = {
        ...formData,
        image_url: imageUrl,
        certification_level: certifications.length > 0 ? certifications[0] : "",
        certifications,
        achievements,
        specialties,
      }

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
          {/* Profile Photo Upload */}
          <div className="space-y-4">
            <Label>Foto Profil</Label>
            <div className="flex items-center space-x-6">
              {/* Current Image Preview */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Remove button for existing image */}
                {judge?.image_url && !selectedImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                    disabled={imageUploading}
                  />
                  {selectedImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      disabled={imageUploading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  )}
                </div>
                
                {/* File info and validation */}
                {selectedImage && (
                  <div className="text-sm text-gray-600">
                    <p>File: {selectedImage.name}</p>
                    <p>Ukuran: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                
                {imageError && (
                  <p className="text-sm text-red-600">{imageError}</p>
                )}
                
                <p className="text-xs text-gray-500">
                  Format: JPG, PNG, GIF. Maksimal 2MB.
                </p>
              </div>
            </div>
          </div>

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

          {/* Certifications - Now using dropdown with ICA courses */}
          <div className="space-y-3">
            <Label>Certifications (ICA Courses)</Label>
            <div className="flex space-x-2">
              <select
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={licenseCourses.length === 0}
              >
                <option value="">Pilih course ICA...</option>
                {licenseCourses.map((course) => (
                  <option key={course.id} value={course.course_name}>
                    {course.course_name} {course.level ? `- ${course.level}` : ''}
                  </option>
                ))}
              </select>
              <Button 
                type="button" 
                onClick={addCertification} 
                size="sm"
                disabled={!newCertification.trim() || licenseCourses.length === 0}
              >
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
            {licenseCourses.length === 0 && (
              <p className="text-sm text-gray-500">Loading ICA courses...</p>
            )}
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
            <Button 
              type="submit" 
              disabled={loading || imageUploading} 
              className="bg-red-600 hover:bg-red-700"
            >
              {loading || imageUploading ? (
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