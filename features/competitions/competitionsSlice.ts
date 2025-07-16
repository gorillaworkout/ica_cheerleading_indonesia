import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

// Async thunk for fetching competitions
export const fetchCompetitions = createAsyncThunk(
  "competitions/fetchCompetitions",
  async () => {
    const { data, error } = await supabase.from("competitions").select();
    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }
);

const competitionsSlice = createSlice({
  name: "competitions",
  initialState: {
    competitions: [] as any[], // Explicitly define type for competitions
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null, // Explicitly define type for error
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompetitions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCompetitions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.competitions = action.payload;
      })
      .addCase(fetchCompetitions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default competitionsSlice.reducer;
