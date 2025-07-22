import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase'
import type { LicenseCourse, LicenseCoursesState, CreateLicenseCourseData, UpdateLicenseCourseData } from '@/types/license-courses'

const initialState: LicenseCoursesState = {
  courses: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchLicenseCourses = createAsyncThunk(
  'licenseCourses/fetchLicenseCourses',
  async (activeOnly: boolean = true) => {
    let query = supabase
      .from('license_courses')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('course_name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch license courses: ${error.message}`)
    }

    return data as LicenseCourse[]
  }
)

export const fetchLicenseCoursesByType = createAsyncThunk(
  'licenseCourses/fetchLicenseCoursesByType',
  async ({ type, organization }: { type?: string; organization?: string }) => {
    let query = supabase
      .from('license_courses')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (type) {
      query = query.eq('course_type', type)
    }

    if (organization) {
      query = query.eq('organization', organization)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch license courses: ${error.message}`)
    }

    return data as LicenseCourse[]
  }
)

export const createLicenseCourse = createAsyncThunk(
  'licenseCourses/createLicenseCourse',
  async (courseData: CreateLicenseCourseData) => {
    // Convert undefined values to null for database
    const dbCourseData = {
      ...courseData,
      level: courseData.level === undefined ? null : courseData.level,
      module: courseData.module === undefined ? null : courseData.module,
      description: courseData.description === undefined ? null : courseData.description,
      is_active: true,
      sort_order: courseData.sort_order || 0
    }

    const { data, error } = await supabase
      .from('license_courses')
      .insert([dbCourseData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create license course: ${error.message}`)
    }

    return data as LicenseCourse
  }
)

export const updateLicenseCourse = createAsyncThunk(
  'licenseCourses/updateLicenseCourse',
  async ({ id, ...updateData }: UpdateLicenseCourseData) => {
    // Convert undefined values to null for database
    const dbUpdateData = {
      ...updateData,
      level: updateData.level === undefined ? null : updateData.level,
      module: updateData.module === undefined ? null : updateData.module,
      description: updateData.description === undefined ? null : updateData.description,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('license_courses')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update license course: ${error.message}`)
    }

    return data as LicenseCourse
  }
)

export const deleteLicenseCourse = createAsyncThunk(
  'licenseCourses/deleteLicenseCourse',
  async (id: string) => {
    const { error } = await supabase
      .from('license_courses')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete license course: ${error.message}`)
    }

    return id
  }
)

const licenseCoursesSlice = createSlice({
  name: 'licenseCourses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCourses: (state) => {
      state.courses = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch license courses
      .addCase(fetchLicenseCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLicenseCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchLicenseCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch license courses'
      })

      // Fetch license courses by type
      .addCase(fetchLicenseCoursesByType.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLicenseCoursesByType.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchLicenseCoursesByType.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch license courses'
      })

      // Create license course
      .addCase(createLicenseCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLicenseCourse.fulfilled, (state, action) => {
        state.loading = false
        state.courses.push(action.payload)
        // Re-sort courses by sort_order
        state.courses.sort((a, b) => a.sort_order - b.sort_order)
      })
      .addCase(createLicenseCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create license course'
      })

      // Update license course
      .addCase(updateLicenseCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLicenseCourse.fulfilled, (state, action) => {
        state.loading = false
        const index = state.courses.findIndex(course => course.id === action.payload.id)
        if (index !== -1) {
          state.courses[index] = action.payload
        }
        // Re-sort courses by sort_order
        state.courses.sort((a, b) => a.sort_order - b.sort_order)
      })
      .addCase(updateLicenseCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update license course'
      })

      // Delete license course
      .addCase(deleteLicenseCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLicenseCourse.fulfilled, (state, action) => {
        state.loading = false
        state.courses = state.courses.filter(course => course.id !== action.payload)
      })
      .addCase(deleteLicenseCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete license course'
      })
  },
})

// Selectors
export const selectAllLicenseCourses = (state: { licenseCourses: LicenseCoursesState }) => 
  state.licenseCourses.courses

export const selectLicenseCoursesLoading = (state: { licenseCourses: LicenseCoursesState }) => 
  state.licenseCourses.loading

export const selectLicenseCoursesError = (state: { licenseCourses: LicenseCoursesState }) => 
  state.licenseCourses.error

export const selectLicenseCoursesByType = (state: { licenseCourses: LicenseCoursesState }, type: string) =>
  state.licenseCourses.courses.filter(course => course.course_type === type)

export const selectLicenseCoursesByOrganization = (state: { licenseCourses: LicenseCoursesState }, organization: string) =>
  state.licenseCourses.courses.filter(course => course.organization === organization)

export const selectCoachCourses = (state: { licenseCourses: LicenseCoursesState }) =>
  state.licenseCourses.courses.filter(course => course.course_type === 'coach')

export const selectJudgeCourses = (state: { licenseCourses: LicenseCoursesState }) =>
  state.licenseCourses.courses.filter(course => course.course_type === 'judge')

export const selectRulesCourses = (state: { licenseCourses: LicenseCoursesState }) =>
  state.licenseCourses.courses.filter(course => course.course_type === 'rules')

export const { clearError, clearCourses } = licenseCoursesSlice.actions
export default licenseCoursesSlice.reducer
