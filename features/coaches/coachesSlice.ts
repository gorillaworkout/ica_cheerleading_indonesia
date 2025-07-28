import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase'

// Types
export interface Coach {
  id: string
  name: string
  title: string
  specialization: string
  experience: string
  bio: string
  location: string
  email: string
  phone: string
  image_url: string
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
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CoachesState {
  coaches: Coach[]
  featuredCoaches: Coach[]
  loading: boolean
  error: string | null
  lastFetched: number | null
}

const initialState: CoachesState = {
  coaches: [],
  featuredCoaches: [],
  loading: false,
  error: null,
  lastFetched: null,
}

// Async thunks
export const fetchCoaches = createAsyncThunk(
  'coaches/fetchCoaches',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error('Error fetching coaches:', error)
      return rejectWithValue(error.message || 'Failed to fetch coaches')
    }
  }
)

export const fetchFeaturedCoaches = createAsyncThunk(
  'coaches/fetchFeaturedCoaches',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('featured_coaches')
        .select('*')
        .limit(3)

      if (error) {
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error('Error fetching featured coaches:', error)
      return rejectWithValue(error.message || 'Failed to fetch featured coaches')
    }
  }
)

// Slice
const coachesSlice = createSlice({
  name: 'coaches',
  initialState,
  reducers: {
    clearCoaches: (state) => {
      state.coaches = []
      state.featuredCoaches = []
      state.error = null
      state.lastFetched = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all coaches
    builder
      .addCase(fetchCoaches.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCoaches.fulfilled, (state, action: PayloadAction<Coach[]>) => {
        state.loading = false
        state.coaches = action.payload
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchCoaches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch featured coaches
    builder
      .addCase(fetchFeaturedCoaches.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeaturedCoaches.fulfilled, (state, action: PayloadAction<Coach[]>) => {
        state.loading = false
        state.featuredCoaches = action.payload
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchFeaturedCoaches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCoaches, clearError } = coachesSlice.actions
export default coachesSlice.reducer

// Selectors
export const selectCoaches = (state: { coaches: CoachesState }) => state.coaches.coaches
export const selectFeaturedCoaches = (state: { coaches: CoachesState }) => state.coaches.featuredCoaches
export const selectCoachesLoading = (state: { coaches: CoachesState }) => state.coaches.loading
export const selectCoachesError = (state: { coaches: CoachesState }) => state.coaches.error
export const selectCoachById = (state: { coaches: CoachesState }, id: string) => 
  state.coaches.coaches.find(coach => coach.id === id)
