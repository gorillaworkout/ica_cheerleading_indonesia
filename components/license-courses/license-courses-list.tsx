"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import {
  fetchLicenseCourses,
  selectAllLicenseCourses,
  selectLicenseCoursesLoading,
  selectLicenseCoursesError,
  selectCoachCourses,
  selectJudgeCourses,
  selectRulesCourses,
  selectLicenseCoursesByOrganization
} from "@/features/license-courses/licenseCoursesSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GraduationCap, 
  Scale, 
  BookOpen, 
  Award,
  Users,
  Star,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { LicenseCourse } from "@/types/license-courses"

interface LicenseCoursesListProps {
  showAdminActions?: boolean
  filterByOrganization?: 'ICA' | 'ICU'
  filterByType?: 'coach' | 'judge' | 'rules'
}

export function LicenseCoursesList({ 
  showAdminActions = false,
  filterByOrganization,
  filterByType 
}: LicenseCoursesListProps) {
  const dispatch = useAppDispatch()
  const allCourses = useAppSelector(selectAllLicenseCourses)
  const coachCourses = useAppSelector(selectCoachCourses)
  const judgeCourses = useAppSelector(selectJudgeCourses)
  const rulesCourses = useAppSelector(selectRulesCourses)
  const loading = useAppSelector(selectLicenseCoursesLoading)
  const error = useAppSelector(selectLicenseCoursesError)

  // Apply filters
  let displayCourses = allCourses
  if (filterByOrganization) {
    displayCourses = allCourses.filter(course => course.organization === filterByOrganization)
  }
  if (filterByType) {
    displayCourses = displayCourses.filter(course => course.course_type === filterByType)
  }

  useEffect(() => {
    if (allCourses.length === 0) {
      dispatch(fetchLicenseCourses(true))
    }
  }, [dispatch, allCourses.length])

  const getCourseIcon = (type: string) => {
    switch (type) {
      case 'coach':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'judge':
        return <Scale className="h-5 w-5 text-purple-600" />
      case 'rules':
        return <BookOpen className="h-5 w-5 text-green-600" />
      default:
        return <GraduationCap className="h-5 w-5 text-gray-600" />
    }
  }

  const getOrganizationColor = (org: string) => {
    return org === 'ICA' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
  }

  const CourseCard = ({ course }: { course: LicenseCourse }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getCourseIcon(course.course_type)}
            <div>
              <h3 className="font-semibold text-lg leading-tight">{course.course_name}</h3>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getOrganizationColor(course.organization)}>
                  {course.organization}
                </Badge>
                {course.level && (
                  <Badge variant="outline">
                    {course.level}
                  </Badge>
                )}
                {course.module && (
                  <Badge variant="secondary">
                    {course.module}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Award className="h-6 w-6 text-yellow-500" />
        </div>
        
        {course.description && (
          <p className="text-gray-600 text-sm mb-4">{course.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {course.course_type} Course
          </span>
          {showAdminActions && (
            <div className="space-x-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm" variant="destructive">
                Deactivate
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 text-gray-600">Loading license courses...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load license courses: {error}
        </AlertDescription>
      </Alert>
    )
  }

  // If filters are applied, show simple list
  if (filterByOrganization || filterByType) {
    return (
      <div className="space-y-4">
        {displayCourses.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses found matching the criteria.</p>
          </div>
        ) : (
          displayCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    )
  }

  // Default tabbed view
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{allCourses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{coachCourses.length}</div>
            <div className="text-sm text-gray-600">Coach Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{judgeCourses.length}</div>
            <div className="text-sm text-gray-600">Judge Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{rulesCourses.length}</div>
            <div className="text-sm text-gray-600">Rules Courses</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="coach">Coach</TabsTrigger>
          <TabsTrigger value="judge">Judge</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="organization">By Org</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </TabsContent>

        <TabsContent value="coach" className="space-y-4">
          {coachCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </TabsContent>

        <TabsContent value="judge" className="space-y-4">
          {judgeCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          {rulesCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>ICA Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allCourses
                  .filter(course => course.organization === 'ICA')
                  .map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>ICU Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allCourses
                  .filter(course => course.organization === 'ICU')
                  .map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
