"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import {
  fetchLicenseCourses,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  BookOpen,
  Loader2
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

// Move CourseForm component outside to prevent re-creation on each render
const CourseForm = ({ 
  formData, 
  onInputChange 
}: { 
  formData: CourseFormData, 
  onInputChange: (field: keyof CourseFormData, value: string) => void 
}) => (
  <div className="grid gap-4 py-4">
    <div className="grid gap-2">
      <Label htmlFor="course_name">Course Name *</Label>
      <Input
        id="course_name"
        value={formData.course_name}
        onChange={(e) => onInputChange('course_name', e.target.value)}
        placeholder="Enter course name"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="course_type">Course Type *</Label>
        <Select value={formData.course_type} onValueChange={(value) => onInputChange('course_type', value)}>
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

      <div className="grid gap-2">
        <Label htmlFor="organization">Organization *</Label>
        <Select value={formData.organization} onValueChange={(value) => onInputChange('organization', value)}>
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
      <div className="grid gap-2">
        <Label htmlFor="level">Level</Label>
        <Input
          id="level"
          value={formData.level}
          onChange={(e) => onInputChange('level', e.target.value)}
          placeholder="e.g., Level 1, Level 2"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="module">Module</Label>
        <Input
          id="module"
          value={formData.module}
          onChange={(e) => onInputChange('module', e.target.value)}
          placeholder="e.g., Module A, Module B"
        />
      </div>
    </div>

    <div className="grid gap-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => onInputChange('description', e.target.value)}
        placeholder="Enter course description"
        rows={3}
      />
    </div>

    <div className="grid gap-2">
      <Label htmlFor="sort_order">Sort Order</Label>
      <Input
        id="sort_order"
        type="number"
        value={formData.sort_order}
        onChange={(e) => onInputChange('sort_order', e.target.value)}
        placeholder="0"
      />
    </div>
  </div>
)

export default function AdminLicensePage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const courses = useAppSelector(selectAllLicenseCourses)
  const loading = useAppSelector(selectLicenseCoursesLoading)
  const error = useAppSelector(selectLicenseCoursesError)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<LicenseCourse | null>(null)
  const [formData, setFormData] = useState<CourseFormData>(initialFormData)

  useEffect(() => {
    dispatch(fetchLicenseCourses(false)) // Fetch all courses including inactive
  }, [dispatch])

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

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingCourse(null)
  }

  const handleAddCourse = async () => {
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
        description: "License course added successfully"
      })
      
      resetForm()
      setIsAddDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add course: ${error}`,
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
        level: formData.level.trim() === '' ? undefined : formData.level.trim(),
        module: formData.module.trim() === '' ? undefined : formData.module.trim(),
        description: formData.description.trim() === '' ? undefined : formData.description.trim(),
        sort_order: parseInt(formData.sort_order) || 0
      }

      await dispatch(updateLicenseCourse(updateData)).unwrap()
      
      toast({
        title: "Success",
        description: "License course updated successfully"
      })
      
      resetForm()
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

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 text-gray-600">Loading license courses...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Course Management</h1>
          <p className="text-gray-600 mt-1">Manage coach and judge certification courses</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add License Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New License Course</DialogTitle>
              <DialogDescription>
                Create a new certification course in the system
              </DialogDescription>
            </DialogHeader>
            <CourseForm formData={formData} onInputChange={handleInputChange} />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCourse} disabled={loading}>
                {loading ? "Adding..." : "Add Course"}
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
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Coach Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.course_type === 'coach').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Judge Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.course_type === 'judge').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rules Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.course_type === 'rules').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All License Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Level/Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getCourseIcon(course.course_type)}
                      <div>
                        <div className="font-medium">{course.course_name}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {course.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {course.course_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={course.organization === 'ICA' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {course.organization}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {course.level && (
                        <Badge variant="secondary" className="text-xs">
                          {course.level}
                        </Badge>
                      )}
                      {course.module && (
                        <Badge variant="secondary" className="text-xs">
                          {course.module}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={course.is_active ? "default" : "destructive"}
                    >
                      {course.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
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
                            <AlertDialogTitle>Delete Course</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{course.course_name}"? 
                              This action will deactivate the course.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCourse(course.id, course.course_name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {courses.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No license courses found. Add your first course to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit License Course</DialogTitle>
            <DialogDescription>
              Update the course information
            </DialogDescription>
          </DialogHeader>
          <CourseForm formData={formData} onInputChange={handleInputChange} />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
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
