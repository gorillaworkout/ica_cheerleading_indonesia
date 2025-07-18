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
export const fetchNews = createAsyncThunk<NewsItem[]>("news/fetchNews", async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from("news").select("*");
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data) {
      return [];
    }
    
    return data as NewsItem[];
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch news");
  }
});

// Test action for debugging connection
export const testSupabaseConnection = createAsyncThunk(
  "news/testConnection", 
  async (_, { rejectWithValue }) => {
    try {
      // Test basic connection
      const { data: healthCheck, error: healthError } = await supabase
        .from("news")
        .select("count", { count: "exact", head: true });
      
      // Test table schema
      const { data: schemaTest, error: schemaError } = await supabase
        .from("news")
        .select("*")
        .limit(1);
      
      // Test with auth
      const { data: { user } } = await supabase.auth.getUser();
      
      return { 
        connection: !healthError, 
        schema: !schemaError,
        user: user?.email || null 
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Connection test failed");
    }
  }
);

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
  reducers: {
    clearNewsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.newsList = action.payload;
        state.error = null;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default newsSlice.reducer;
