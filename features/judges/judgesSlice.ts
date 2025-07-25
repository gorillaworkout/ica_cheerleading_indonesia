import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase'
import { RootState } from '@/lib/redux/store'
import { Judge, JudgesState, CreateJudgeRequest, UpdateJudgeRequest } from '@/types/judges'

// Initial state
const initialState: JudgesState = {
  judges: [],
  loading: false,
  error: null,
  selectedJudge: null,
}

// Async thunks
export const fetchJudges = createAsyncThunk(
  'judges/fetchJudges',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching judges...')
      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('❌ Error fetching judges:', error)
        throw error
      }

      console.log('✅ Judges fetched successfully:', data?.length || 0)
      return data as Judge[]
    } catch (error: any) {
      console.error('❌ Failed to fetch judges:', error)
      return rejectWithValue(error.message || 'Failed to fetch judges')
    }
  }
)

export const fetchAllJudges = createAsyncThunk(
  'judges/fetchAllJudges',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching all judges (including inactive)...')
      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('❌ Error fetching all judges:', error)
        throw error
      }

      console.log('✅ All judges fetched successfully:', data?.length || 0)
      return data as Judge[]
    } catch (error: any) {
      console.error('❌ Failed to fetch all judges:', error)
      return rejectWithValue(error.message || 'Failed to fetch all judges')
    }
  }
)

export const fetchJudgeById = createAsyncThunk(
  'judges/fetchJudgeById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching judge by ID:', id)
      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error fetching judge:', error)
        throw error
      }

      console.log('✅ Judge fetched successfully:', data?.name)
      return data as Judge
    } catch (error: any) {
      console.error('❌ Failed to fetch judge:', error)
      return rejectWithValue(error.message || 'Failed to fetch judge')
    }
  }
)

export const createJudge = createAsyncThunk(
  'judges/createJudge',
  async (judgeData: CreateJudgeRequest, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating new judge:', judgeData.name)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const judgeToCreate = {
        ...judgeData,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('judges')
        .insert([judgeToCreate])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating judge:', error)
        throw error
      }

      console.log('✅ Judge created successfully:', data?.name)
      return data as Judge
    } catch (error: any) {
      console.error('❌ Failed to create judge:', error)
      return rejectWithValue(error.message || 'Failed to create judge')
    }
  }
)

export const updateJudge = createAsyncThunk(
  'judges/updateJudge',
  async ({ id, ...updateData }: UpdateJudgeRequest, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating judge:', id)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const judgeToUpdate = {
        ...updateData,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('judges')
        .update(judgeToUpdate)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating judge:', error)
        throw error
      }

      console.log('✅ Judge updated successfully:', data?.name)
      return data as Judge
    } catch (error: any) {
      console.error('❌ Failed to update judge:', error)
      return rejectWithValue(error.message || 'Failed to update judge')
    }
  }
)

export const deleteJudge = createAsyncThunk(
  'judges/deleteJudge',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Deleting judge:', id)
      
      const { error } = await supabase
        .from('judges')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting judge:', error)
        throw error
      }

      console.log('✅ Judge deleted successfully')
      return id
    } catch (error: any) {
      console.error('❌ Failed to delete judge:', error)
      return rejectWithValue(error.message || 'Failed to delete judge')
    }
  }
)

// Slice
const judgesSlice = createSlice({
  name: 'judges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedJudge: (state, action: PayloadAction<Judge | null>) => {
      state.selectedJudge = action.payload
    },
    clearSelectedJudge: (state) => {
      state.selectedJudge = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch judges
      .addCase(fetchJudges.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJudges.fulfilled, (state, action) => {
        state.loading = false
        state.judges = action.payload
      })
      .addCase(fetchJudges.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch all judges
      .addCase(fetchAllJudges.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllJudges.fulfilled, (state, action) => {
        state.loading = false
        state.judges = action.payload
      })
      .addCase(fetchAllJudges.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch judge by ID
      .addCase(fetchJudgeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJudgeById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedJudge = action.payload
      })
      .addCase(fetchJudgeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create judge
      .addCase(createJudge.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createJudge.fulfilled, (state, action) => {
        state.loading = false
        state.judges.push(action.payload)
      })
      .addCase(createJudge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update judge
      .addCase(updateJudge.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateJudge.fulfilled, (state, action) => {
        state.loading = false
        const index = state.judges.findIndex(judge => judge.id === action.payload.id)
        if (index !== -1) {
          state.judges[index] = action.payload
        }
        if (state.selectedJudge?.id === action.payload.id) {
          state.selectedJudge = action.payload
        }
      })
      .addCase(updateJudge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Delete judge
      .addCase(deleteJudge.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteJudge.fulfilled, (state, action) => {
        state.loading = false
        state.judges = state.judges.filter(judge => judge.id !== action.payload)
        if (state.selectedJudge?.id === action.payload) {
          state.selectedJudge = null
        }
      })
      .addCase(deleteJudge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// Actions
export const { clearError, setSelectedJudge, clearSelectedJudge } = judgesSlice.actions

// Selectors
export const selectJudges = (state: RootState) => state.judges.judges
export const selectJudgesLoading = (state: RootState) => state.judges.loading
export const selectJudgesError = (state: RootState) => state.judges.error
export const selectSelectedJudge = (state: RootState) => state.judges.selectedJudge
export const selectJudgeById = (state: RootState, judgeId: string) =>
  state.judges.judges.find(judge => judge.id === judgeId)
export const selectFeaturedJudges = (state: RootState) =>
  state.judges.judges.filter(judge => judge.is_featured && judge.is_active)
export const selectActiveJudges = (state: RootState) =>
  state.judges.judges.filter(judge => judge.is_active)

export default judgesSlice.reducer 