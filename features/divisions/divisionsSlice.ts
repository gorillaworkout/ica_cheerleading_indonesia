import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { Division } from "@/types/types";

// Define Division type
// Initial state
const initialState = {
  divisions: [] as Division[],
  loading: false,
  error: null as string | null,
};

// Async thunk for fetching divisions
export const fetchDivisions = createAsyncThunk<Division[], void, { rejectValue: string }>(
  "divisions/fetchDivisions",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("divisions").select("*");
      if (error) {
        throw error;
      }
      return data as Division[];
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Slice
const divisionsSlice = createSlice({
  name: "divisions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDivisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDivisions.fulfilled, (state, action: PayloadAction<Division[]>) => {
        state.loading = false;
        state.divisions = action.payload;
      })
      .addCase(fetchDivisions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export default divisionsSlice.reducer;
