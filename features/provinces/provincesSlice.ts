import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase'

interface Province {
  id_province: string
  name: string
}

interface ProvincesState {
  provinces: Province[]
  loading: boolean
  error: string | null
}

const initialState: ProvincesState = {
  provinces: [],
  loading: false,
  error: null,
}

// Async thunk to fetch provinces
export const fetchProvinces = createAsyncThunk(
  'provinces/fetchProvinces',
  async (_, { rejectWithValue }) => {
    try {
      
      const { data, error } = await supabase
        .from('provinces')
        .select('id_province, name')
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching provinces:', error)
        return rejectWithValue(error.message)
      }

      return data || []
    } catch (error) {
      console.error('❌ Unexpected error fetching provinces:', error)
      return rejectWithValue('Failed to fetch provinces')
    }
  }
)

const provincesSlice = createSlice({
  name: 'provinces',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvinces.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loading = false
        state.provinces = action.payload
        state.error = null
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default provincesSlice.reducer

// Selectors
export const selectProvinces = (state: { provinces: ProvincesState }) => state.provinces.provinces
export const selectProvincesLoading = (state: { provinces: ProvincesState }) => state.provinces.loading
export const selectProvincesError = (state: { provinces: ProvincesState }) => state.provinces.error

// Helper selector to get province name by id
export const selectProvinceNameById = (state: { provinces: ProvincesState }, provinceId: string) => {
  const province = state.provinces.provinces.find(p => p.id_province === provinceId)
  return province?.name || provinceId
}
