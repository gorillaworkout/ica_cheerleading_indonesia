import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: "admin" | "coach" | "user";
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,
};

export const fetchSessionAndProfile = createAsyncThunk(
  "auth/fetchSessionAndProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return rejectWithValue(error.message);

      let profile = null;

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          return rejectWithValue(profileError.message);
        }

        if (!profileData) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "",
              role: session.user.email === "cheerleadingindonesiaweb@gmail.com" ? "admin" : "user",
            })
            .select()
            .single();

          if (insertError) return rejectWithValue(insertError.message);

          profile = newProfile;
        } else {
          profile = profileData;
        }
      }

      return { session, user: session?.user ?? null, profile };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionAndProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessionAndProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(fetchSessionAndProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
