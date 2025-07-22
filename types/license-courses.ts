// License Course Types
export interface LicenseCourse {
  id: string
  course_name: string
  course_type: 'coach' | 'judge' | 'rules'
  level?: string
  organization: 'ICA' | 'ICU'
  module?: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface LicenseCoursesState {
  courses: LicenseCourse[]
  loading: boolean
  error: string | null
}

export interface CreateLicenseCourseData {
  course_name: string
  course_type: 'coach' | 'judge' | 'rules'
  level?: string
  organization: 'ICA' | 'ICU'
  module?: string
  description?: string
  sort_order?: number
}

export interface UpdateLicenseCourseData extends Partial<CreateLicenseCourseData> {
  id: string
  is_active?: boolean
}
