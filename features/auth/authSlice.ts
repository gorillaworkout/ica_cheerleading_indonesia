import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { Profile } from "@/types/profiles/profiles";


interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;

}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  error: null,
  hydrated:false
};

// Thunk untuk inisialisasi session + profile
export const fetchSessionAndProfile = createAsyncThunk("auth/fetchSessionAndProfile", async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Clear supabase auth data di localStorage kalau session null
    supabase.auth.signOut(); // ini otomatis clear localStorage untuk supabase auth
    return { session: null, user: null, profile: null };
  }

  let profile = null;
  if (session?.user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    profile = data;
  }
  console.log(profile, 'profile fetchSessionAndProfile')
  return { session, user: session?.user ?? null, profile };
});

// Tambahan: Sign In with Email
export const signInWithEmailThunk = createAsyncThunk(
  "auth/signInWithEmail",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return rejectWithValue(error.message)

    if (!data.user?.email_confirmed_at) {
      return rejectWithValue("Email belum dikonfirmasi. Silakan cek email kamu untuk aktivasi.")
    }

    return { session: data.session, user: data.user }
  }
)


// Tambahan: Sign In with Google
export const signInWithGoogleThunk = createAsyncThunk(
  "auth/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    if (error) return rejectWithValue(error.message);
    return data;
  }
);

// Tambahan: Sign Up with Email + basic profile
export const signUpWithEmailThunk = createAsyncThunk(
  "auth/signUpWithEmail",
  async (
    {
      email,
      password,
      display_name,
      member_code,
      gender,
      birth_date,
      phone_number,
      province_code,
      profile_photo_file,
      role,
      id_photo_file,
    }: {
      email: string
      password: string
      display_name: string
      member_code: string
      gender: string
      birth_date: string
      phone_number: string
      province_code: string
      role: string
      id_photo_file?: File
      profile_photo_file?: File
    },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return rejectWithValue(error.message);

    const userId = data.user?.id;
    if (!userId) return rejectWithValue("User ID not found");

    let id_photo_url: string | null = null;
    let profile_photo_url:string | null = null
    if (id_photo_file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(`id-photos/${userId}-${Date.now()}`, id_photo_file);

      if (uploadError) return rejectWithValue(uploadError.message);
      id_photo_url = uploadData?.path ?? null;
    }

     if (profile_photo_file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(`profile-photos/${userId}-${Date.now()}`, profile_photo_file);

      if (uploadError) return rejectWithValue(uploadError.message);
      profile_photo_url = uploadData?.path ?? null;
    }

    const now = new Date().toISOString();

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      user_id: userId,
      member_code,
      email,
      display_name,
      gender,
      birth_date,
      phone_number,
      province_code,
      role,
      id_photo_url,
      profile_photo_url,
      is_verified: false,
      created_at: now,
      updated_at: now,
    });

    if (profileError) return rejectWithValue(profileError.message);

    return { session: data.session, user: data.user };
  }
);



// End of THUNK

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.session = null;
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.hydrated = false // ✅ Reset

    },
    setAuthState(state, action: PayloadAction<{ session: Session | null; user: User | null }>) {
      state.session = action.payload.session
      state.user = action.payload.user
      // Kalau mau clear profile juga pas logout:
      if (!action.payload.session) {
        state.profile = null
      }
    },
    clearProfile(state) {
    state.profile = null
  },
  },
  extraReducers: (builder) => {
  builder
    .addCase(signInWithEmailThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(signInWithEmailThunk.fulfilled, (state, action) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    })
    .addCase(signInWithEmailThunk.rejected, (state, action) => {
      state.session = null;
      state.user = null;
      state.loading = false;
      state.error = action.payload as string ?? "Unknown error";
    });

  builder
    .addCase(signUpWithEmailThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(signUpWithEmailThunk.fulfilled, (state, action) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    })
    .addCase(signUpWithEmailThunk.rejected, (state, action) => {
      state.session = null;
      state.user = null;
      state.loading = false;
      state.error = action.payload as string ?? "Unknown error";
    });

  builder
    .addCase(signInWithGoogleThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(signInWithGoogleThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    })
    .addCase(signInWithGoogleThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string ?? "Unknown error";
    });

  // ✅ Tambahkan ini untuk fetchSessionAndProfile
  builder
    .addCase(fetchSessionAndProfile.pending, (state) => {
      console.log('fetch session and profile loading jadi true')
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchSessionAndProfile.fulfilled, (state, action) => {
      console.log('fetchSessionAndProfile fulfiled loading jadi false')
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.profile = action.payload.profile; // ✅ ini dia
      state.loading = false;
      state.error = null;
      state.hydrated = true; // ✅ Tanda bahwa session sudah siap

    })
    .addCase(fetchSessionAndProfile.rejected, (state, action) => {
      state.session = null;
      state.user = null;
      state.profile = null;
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch session and profile";
    });
}


});

export const { clearAuth,setAuthState,clearProfile } = authSlice.actions;
export default authSlice.reducer;
