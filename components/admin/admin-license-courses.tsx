"use client"

import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import {
  createLicenseCourse,
  updateLicenseCourse,
  deleteLicenseCourse,
  selectAllLicenseCourses,
  selectLicenseCoursesLoading,
  selectLicenseCoursesError,
  clearError
} from "@/features/license-courses/licenseCoursesSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertCircle,
  GraduationCap,
  Users,
  Scale,
  BookOpen
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LicenseCourse, CreateLicenseCourseData, UpdateLicenseCourseData } from "@/types/license-courses"

interface CourseFormData {
  course_name: string
  course_type: 'coach' | 'judge' | 'rules' | ''
  level: string
  organization: 'ICA' | 'ICU' | ''
  module: string
  description: string
  sort_order: string
}

const initialFormData: CourseFormData = {
  course_name: '',
  course_type: '',
  level: '',
  organization: '',
  module: '',
  description: '',
  sort_order: '0'
}

export function AdminLicenseCoursesManager() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const courses = useAppSelector(selectAllLicenseCourses)
  const loading = useAppSelector(selectLicenseCoursesLoading)
  const error = useAppSelector(selectLicenseCoursesError)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<LicenseCourse | null>(null)
  const [formData, setFormData] = useState<CourseFormData>(initialFormData)

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.course_name.trim()) {
      toast({ title: "Error", description: "Course name is required", variant: "destructive" })
      return false
    }
    if (!formData.course_type) {
      toast({ title: "Error", description: "Course type is required", variant: "destructive" })
      return false
    }
    if (!formData.organization) {
      toast({ title: "Error", description: "Organization is required", variant: "destructive" })
      return false
    }
    return true
  }

  const handleCreateCourse = async () => {
    if (!validateForm()) return

    try {
      const courseData: CreateLicenseCourseData = {
        course_name: formData.course_name.trim(),
        course_type: formData.course_type as 'coach' | 'judge' | 'rules',
        organization: formData.organization as 'ICA' | 'ICU',
        level: formData.level.trim() || undefined,
        module: formData.module.trim() || undefined,
        description: formData.description.trim() || undefined,
        sort_order: parseInt(formData.sort_order) || 0
      }

      await dispatch(createLicenseCourse(courseData)).unwrap()
      
      toast({
        title: "Success",
        description: "License course created successfully"
      })
      
      setFormData(initialFormData)
      setIsCreateDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create course: ${error}`,
        variant: "destructive"
      })
    }
  }

  const handleEditCourse = (course: LicenseCourse) => {
    setEditingCourse(course)
    setFormData({
      course_name: course.course_name,
      course_type: course.course_type,
      level: course.level || '',
      organization: course.organization,
      module: course.module || '',
      description: course.description || '',
      sort_order: course.sort_order.toString()
    })
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse || !validateForm()) return

    try {
      const updateData: UpdateLicenseCourseData = {
        id: editingCourse.id,
        course_name: formData.course_name.trim(),
        course_type: formData.course_type as 'coach' | 'judge' | 'rules',
        organization: formData.organization as 'ICA' | 'ICU',
        level: formData.level.trim() || undefined,
        module: formData.module.trim() || undefined,
        description: formData.description.trim() || undefined,
        sort_order: parseInt(formData.sort_order) || 0
      }

      await dispatch(updateLicenseCourse(updateData)).unwrap()
      
      toast({
        title: "Success",
        description: "License course updated successfully"
      })
      
      setEditingCourse(null)
      setFormData(initialFormData)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update course: ${error}`,
        variant: "destructive"
      })
    }
  }

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    try {
      await dispatch(deleteLicenseCourse(courseId)).unwrap()
      
      toast({
        title: "Success",
        description: `Course "${courseName}" has been deactivated`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete course: ${error}`,
        variant: "destructive"
      })
    }
  }

  const getCourseIcon = (type: string) => {
    switch (type) {
      case 'coach':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'judge':
        return <Scale className="h-4 w-4 text-purple-600" />
      case 'rules':
        return <BookOpen className="h-4 w-4 text-green-600" />
      default:
        return <GraduationCap className="h-4 w-4 text-gray-600" />
    }
  }

  const CourseForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course_name">Course Name *</Label>
        <Input
          id="course_name"
          value={formData.course_name}
          onChange={(e) => handleInputChange('course_name', e.target.value)}
          placeholder="Enter course name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course_type">Course Type *</Label>
          <Select value={formData.course_type} onValueChange={(value) => handleInputChange('course_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="judge">Judge</SelectItem>
              <SelectItem value="rules">Rules</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization *</Label>
          <Select value={formData.organization} onValueChange={(value) => handleInputChange('organization', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ICA">ICA</SelectItem>
              <SelectItem value="ICU">ICU</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input
            id="level"
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            placeholder="e.g., Level 1, Level 2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="module">Module</Label>
          <Input
            id="module"
            value={formData.module}
            onChange={(e) => handleInputChange('module', e.target.value)}
            placeholder="e.g., Module A, Module B"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter course description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          value={formData.sort_order}
          onChange={(e) => handleInputChange('sort_order', e.target.value)}
          placeholder="0"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">License Courses Management</h2>
          <p className="text-gray-600">Manage coach and judge certification courses</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New License Course</DialogTitle>
              <DialogDescription>
                Add a new certification course to the system
              </DialogDescription>
            </DialogHeader>
            <CourseForm />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse} disabled={loading}>
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => dispatch(clearError())}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courses.filter(c => c.course_type === 'coach').length}
            </div>
            <div className="text-sm text-gray-600">Coach Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courses.filter(c => c.course_type === 'judge').length}
            </div>
            <div className="text-sm text-gray-600">Judge Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {courses.filter(c => c.course_type === 'rules').length}
            </div>
            <div className="text-sm text-gray-600">Rules Courses</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getCourseIcon(course.course_type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.course_name}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={course.organization === 'ICA' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                          {course.organization}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {course.course_type}
                        </Badge>
                        {course.level && (
                          <Badge variant="secondary">{course.level}</Badge>
                        )}
                        {course.module && (
                          <Badge variant="secondary">{course.module}</Badge>
                        )}
                      </div>
                      {course.description && (
                        <p className="text-gray-600 text-sm mt-2">{course.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Sort Order: {course.sort_order} | Status: {course.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate "{course.course_name}"? 
                            This will make it invisible to users but preserve the data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCourse(course.id, course.course_name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses found. Add your first course to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit License Course</DialogTitle>
            <DialogDescription>
              Update the course information below
            </DialogDescription>
          </DialogHeader>
          <CourseForm />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingCourse(null)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
