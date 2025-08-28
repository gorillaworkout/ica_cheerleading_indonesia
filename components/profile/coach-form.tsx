"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { supabase } from "@/lib/supabase"
import { fetchCoaches } from "@/features/coaches/coachesSlice"
import { fetchLicenseCourses } from "@/features/license-courses/licenseCoursesSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Users } from "lucide-react"
import Image from "next/image"
import { AuditService, getClientInfo } from "@/lib/audit"

interface CoachData {
  id?: string
  name: string
  title: string
  specialization: string
  experience: string
  bio: string
  location: string
  email: string
  phone: string
  image_url: string | null
  philosophy: string
  certifications: string[]
  achievements: string[]
  specialties: string[]
  teams_coached: number
  champions_produced: number
  years_experience: number
  success_rate: number
  is_active: boolean
  is_featured: boolean
}

export function CoachForm() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const provinces = useAppSelector((state) => state.provinces.provinces)
  const licenseCourses = useAppSelector((state) => state.licenseCourses.courses || [])
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [coachData, setCoachData] = useState<CoachData>({
    name: "",
    title: "Cheerleading Coach",
    specialization: "General Cheerleading",
    experience: "0-1 years",
    bio: "",
    location: "",
    email: user?.email || "",
    phone: "",
    image_url: null,
    philosophy: "",
    certifications: [],
    achievements: [],
    specialties: ["Cheerleading"],
    teams_coached: 0,
    champions_produced: 0,
    years_experience: 0,
    success_rate: 0,
    is_active: true,
    is_featured: false,
  })
  
  const [newCertification, setNewCertification] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newSpecialty, setNewSpecialty] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  // Load existing coach data
  useEffect(() => {
    const fetchCoachData = async () => {
      if (!user?.id) return

      try {
        // First check if user has coach role
        if (profile?.role !== 'coach') {
          console.log('User is not a coach, skipping coach data fetch')
          return
        }

        const { data, error } = await supabase
          .from("coaches")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (data && !error) {
          setCoachData(data)
          if (data.image_url) {
            // Generate storage URL for images
            const imagePath = data.image_url.includes('/') 
              ? data.image_url 
              : `profile-photos/${data.image_url}`
            
            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(imagePath)
            
            if (urlData?.publicUrl) {
              setImagePreview(urlData.publicUrl)
            }
          }
        } else if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new coaches
          console.error("Error fetching coach data:", error)
        } else if (profile) {
          // Pre-fill with profile data if no coach data exists
          setCoachData(prev => ({
            ...prev,
            name: profile.display_name || "",
            email: profile.email || "",
            phone: profile.phone_number || "",
            location: profile.province_code || "",
          }))
          if (profile.profile_photo_url) {
            // Generate storage URL for profile photo
            const imagePath = profile.profile_photo_url.includes('/') 
              ? profile.profile_photo_url 
              : `profile-photos/${profile.profile_photo_url}`
            
            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(imagePath)
            
            if (urlData?.publicUrl) {
              setImagePreview(urlData.publicUrl)
            }
            setCoachData(prev => ({ ...prev, image_url: profile.profile_photo_url }))
          }
        }
      } catch (error) {
        console.error("Error fetching coach data:", error)
      }
    }

    fetchCoachData()
  }, [user?.id, profile])

  // Load license courses if not already loaded - fetch ALL courses not just active
  useEffect(() => {
    if (licenseCourses.length === 0) {
      dispatch(fetchLicenseCourses(false)) // false = fetch all courses including inactive
    }
  }, [dispatch, licenseCourses.length])

  // Debug: log available courses
  useEffect(() => {
    const icaCoachCourses = licenseCourses.filter(course => course.organization === 'ICA' && course.course_type === 'coach')
  }, [licenseCourses])

  // Helper function to get province name by code
  const getProvinceName = (provinceCode: string) => {
    const province = provinces.find(p => p.id_province === provinceCode)
    return province ? province.name : provinceCode
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addItem = (type: 'certifications' | 'achievements' | 'specialties', value: string) => {
    if (value.trim()) {
      setCoachData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }))
      if (type === 'certifications') setNewCertification("")
      if (type === 'achievements') setNewAchievement("")
      if (type === 'specialties') setNewSpecialty("")
    }
  }

  const removeItem = (type: 'certifications' | 'achievements' | 'specialties', index: number) => {
    setCoachData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      let imageUrl = coachData.image_url

      // Upload new image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `coach-${user.id}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(`profile-photos/${fileName}`, imageFile)

        if (uploadError) {
          throw uploadError
        }
        imageUrl = uploadData.path
      }

      const coachPayload = {
        ...coachData,
        image_url: imageUrl,
        user_id: user.id,
        created_by: user.id,
        updated_by: user.id,
      }

      // Check if coach profile exists
      const { data: existingCoach } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", user.id)
        .single()

      let actionType: 'CREATE' | 'UPDATE' = 'CREATE'
      let oldData = null

      if (existingCoach) {
        // Update existing coach
        actionType = 'UPDATE'
        oldData = existingCoach
        
        const { error } = await supabase
          .from("coaches")
          .update(coachPayload)
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        // Create new coach
        const { error } = await supabase
          .from("coaches")
          .insert(coachPayload)

        if (error) throw error
      }

      // Log the audit trail
      const clientInfo = getClientInfo()
      const changedFields = actionType === 'UPDATE' 
        ? AuditService.getChangedFields(oldData, coachPayload)
        : Object.keys(coachPayload)
      
      await AuditService.logChange({
        user_id: user.id,
        table_name: 'coaches',
        record_id: existingCoach?.id || user.id,
        action_type: actionType,
        old_data: oldData,
        new_data: coachPayload,
        changed_fields: changedFields,
        ...clientInfo
      })

              toast({
          title: "Coach Profile Saved!",
          description: "Your coach profile has been saved successfully.",
          variant: "default",
        })
      
      // Refresh coaches data in Redux
      dispatch(fetchCoaches())
      
    } catch (error) {
      console.error("Error saving coach profile:", error)
              toast({
          title: "Save Failed",
          description: "Failed to save coach profile. Please try again.",
          variant: "destructive",
        })
    } finally {
      setLoading(false)
    }
  }

  if (profile?.role !== 'coach') {
    return null
  }

  return (
    <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
        <CardTitle className="flex items-center space-x-3 text-red-700">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl">Coach Profile</span>
        </CardTitle>
        <p className="text-gray-600 mt-2">Complete your coach profile to appear in our coaches directory</p>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
              <Input
                id="name"
                disabled
                value={coachData.name}
                onChange={(e) => setCoachData(prev => ({ ...prev, name: e.target.value }))}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 font-medium">Title *</Label>
              <Input
                id="title"
                value={coachData.title}
                onChange={(e) => setCoachData(prev => ({ ...prev, title: e.target.value }))}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-gray-700 font-medium">Specialization *</Label>
              <Input
                id="specialization"
                value={coachData.specialization}
                onChange={(e) => setCoachData(prev => ({ ...prev, specialization: e.target.value }))}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-gray-700 font-medium">Experience Level *</Label>
              <select
                id="experience"
                value={coachData.experience}
                onChange={(e) => setCoachData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                required
              >
                <option value="0-1 years">0-1 years</option>
                <option value="2-5 years">2-5 years</option>
                <option value="6-10 years">6-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-700 font-medium">Province/Location</Label>
              <select
                id="location"
                value={coachData.location}
                onChange={(e) => setCoachData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.id_province} value={province.id_province}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">Phone</Label>
              <Input
                id="phone"
                value={coachData.phone}
                onChange={(e) => setCoachData(prev => ({ ...prev, phone: e.target.value }))}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
              />
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <Label className="text-gray-700 font-medium block mb-4">Profile Image</Label>
            <div className="flex items-center space-x-6">
              {imagePreview && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-xs border-gray-200 focus:border-red-400 focus:ring-red-400"
              />
            </div>
          </div>

          {/* Text Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 font-medium">Biography</Label>
              <Textarea
                id="bio"
                value={coachData.bio}
                onChange={(e) => setCoachData(prev => ({ ...prev, bio: e.target.value }))}
                rows={6}
                placeholder="Tell us about your coaching background and approach..."
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="philosophy" className="text-gray-700 font-medium">Coaching Philosophy</Label>
              <Textarea
                id="philosophy"
                value={coachData.philosophy}
                onChange={(e) => setCoachData(prev => ({ ...prev, philosophy: e.target.value }))}
                rows={6}
                placeholder="What's your coaching philosophy and approach?"
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
              />
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-100">
            <h3 className="text-lg font-semibold text-red-700 mb-4">Performance Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="years_experience" className="text-gray-700 font-medium">Years Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="0"
                  value={coachData.years_experience || ''}
                  onChange={(e) => setCoachData(prev => ({ ...prev, years_experience: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                  className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teams_coached" className="text-gray-700 font-medium">Teams Coached</Label>
                <Input
                  id="teams_coached"
                  type="number"
                  min="0"
                  value={coachData.teams_coached || ''}
                  onChange={(e) => setCoachData(prev => ({ ...prev, teams_coached: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                  className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="champions_produced" className="text-gray-700 font-medium">Champions Produced</Label>
                <Input
                  id="champions_produced"
                  type="number"
                  min="0"
                  value={coachData.champions_produced || ''}
                  onChange={(e) => setCoachData(prev => ({ ...prev, champions_produced: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                  className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                  placeholder="0"
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="success_rate" className="text-gray-700 font-medium">Success Rate (%)</Label>
                <Input
                  id="success_rate"
                  type="number"
                  min="0"
                  max="100"
                  value={coachData.success_rate}
                  onChange={(e) => setCoachData(prev => ({ ...prev, success_rate: parseInt(e.target.value) || 0 }))}
                  className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                />
              </div> */}
            </div>
          </div>

          {/* Dynamic Arrays - Change to 3 rows instead of 3 columns */}
          <div className="space-y-8">
            {/* Certifications - Row 1 */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium text-lg">ICA Certifications</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex space-x-2">
                  <select
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
                  >
                    <option value="">Select ICA License Course</option>
                    {licenseCourses
                      .map((course) => (
                      <option key={course.id} value={course.course_name}>
                        {course.course_name}{course.level ? ` - ${course.level}` : ''}{course.module ? ` ${course.module}` : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => addItem('certifications', newCertification)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 px-3"
                    disabled={!newCertification}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Custom certification input */}
                {/* <div className="flex space-x-2">
                  <Input
                    value=""
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Or add custom certification..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('certifications', e.currentTarget.value), e.currentTarget.value = '')}
                    className="border-gray-200 focus:border-red-400 focus:ring-red-400 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input.value.trim()) {
                        addItem('certifications', input.value.trim())
                        input.value = ''
                      }
                    }}
                    size="sm"
                    className="bg-gray-600 hover:bg-gray-700 px-3"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div> */}
              </div>

              <div className="min-h-[100px] max-h-[150px] overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-1">
                  {coachData.certifications.map((cert, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-1 text-xs font-medium hover:bg-red-200 transition-colors"
                    >
                      <span className="truncate max-w-[200px]" title={cert}>{cert}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-900 flex-shrink-0"
                        onClick={() => removeItem('certifications', index)}
                      />
                    </span>
                  ))}
                </div>
                {coachData.certifications.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No certifications added yet</p>
                )}
              </div>
            </div>

            {/* Achievements - Row 2 */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium text-lg">Achievements</Label>
              <div className="flex space-x-2 max-w-lg">
                <Input
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add achievement..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('achievements', newAchievement))}
                  className="border-gray-200 focus:border-red-400 focus:ring-red-400 text-sm"
                />
                <Button
                  type="button"
                  onClick={() => addItem('achievements', newAchievement)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 px-3"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="min-h-[100px] max-h-[150px] overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-1">
                  {coachData.achievements.map((achievement, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full px-2 py-1 text-xs font-medium hover:bg-yellow-200 transition-colors"
                    >
                      <span className="truncate max-w-[200px]" title={achievement}>{achievement}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-yellow-900 flex-shrink-0"
                        onClick={() => removeItem('achievements', index)}
                      />
                    </span>
                  ))}
                </div>
                {coachData.achievements.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No achievements added yet</p>
                )}
              </div>
            </div>

            {/* Specialties - Row 3 */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium text-lg">Specialties</Label>
              <div className="flex space-x-2 max-w-lg">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add specialty..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('specialties', newSpecialty))}
                  className="border-gray-200 focus:border-red-400 focus:ring-red-400 text-sm"
                />
                <Button
                  type="button"
                  onClick={() => addItem('specialties', newSpecialty)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 px-3"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="min-h-[100px] max-h-[150px] overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-1">
                  {coachData.specialties.map((specialty, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-1 text-xs font-medium hover:bg-blue-200 transition-colors"
                    >
                      <span className="truncate max-w-[200px]" title={specialty}>{specialty}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-blue-900 flex-shrink-0"
                        onClick={() => removeItem('specialties', index)}
                      />
                    </span>
                  ))}
                </div>
                {coachData.specialties.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No specialties added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Switches */}
          {/* <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Visibility Settings</h3>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3">
                <Switch
                  id="is_active"
                  checked={coachData.is_active}
                  onCheckedChange={(checked) => setCoachData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active" className="text-gray-700 font-medium">
                  Active Profile (Visible in directory)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="is_featured"
                  checked={coachData.is_featured}
                  onCheckedChange={(checked) => setCoachData(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="is_featured" className="text-gray-700 font-medium">
                  Featured Coach
                </Label>
              </div>
            </div>
          </div> */}

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg py-3 text-lg font-medium"
            >
              {loading ? "Saving..." : "Save Coach Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
