import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

// Define the type for a single news item
interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  images: string[];
  category: string;
}

// Define the state type
interface NewsState {
  newsList: NewsItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Async thunk to fetch news
export const fetchNews = createAsyncThunk<NewsItem[]>("news/fetchNews", async () => {
  const { data, error } = await supabase.from("news").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data as NewsItem[];
});

// Initial state
const initialState: NewsState = {
  newsList: [],
  status: "idle",
  error: null,
};

// News slice
const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.newsList = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null; // Ensure error is either string or null
      });
  },
});

export default newsSlice.reducer;
