import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { AutoIDCardGenerator } from "@/utils/autoGenerateIdCard";
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
    // ✅ CRITICAL FIX: Don't call signOut() automatically
    // This was interfering with password reset recovery tokens
    // Let the app handle signOut explicitly when needed
    console.log('📝 No session found in fetchSessionAndProfile - returning null without signOut')
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) return rejectWithValue(error.message);
    // Tidak return apa-apa karena browser akan redirect.
    return;
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
    // Enable email confirmation with redirect URL
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) return rejectWithValue(error.message);

    const userId = data.user?.id;
    if (!userId) return rejectWithValue("User ID not found");

    console.log('User created successfully with ID:', userId);

    let id_photo_url: string | null = null;
    let profile_photo_url:string | null = null
    
    if (id_photo_file) {
      console.log('📤 Uploading ID photo for user:', userId);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(`id-photos/${userId}-${Date.now()}`, id_photo_file);

      if (uploadError) {
        console.error('❌ ID photo upload error:', uploadError);
        return rejectWithValue(`Failed to upload ID photo: ${uploadError.message}`);
      }
      id_photo_url = uploadData?.path ?? null;
      console.log('✅ ID photo uploaded:', id_photo_url);
    }

     if (profile_photo_file) {
      console.log('📤 Uploading profile photo for user:', userId);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(`profile-photos/${userId}-${Date.now()}`, profile_photo_file);

      if (uploadError) {
        console.error('❌ Profile photo upload error:', uploadError);
        return rejectWithValue(`Failed to upload profile photo: ${uploadError.message}`);
      }
      profile_photo_url = uploadData?.path ?? null;
      console.log('✅ Profile photo uploaded:', profile_photo_url);
    }

    const now = new Date().toISOString();

    // Try to insert profile with error handling for foreign key constraint
    let profileData: any = null;
    const { data: initialProfileData, error: profileError } = await supabase.from("profiles").insert({
      id: userId, // profiles.id = auth.users.id (UUID)
      user_id: userId, // Keep this as text for compatibility
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
      is_edit_allowed: false,
      is_request_edit: false
    }).select().single();

    profileData = initialProfileData;

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // If it's a foreign key constraint error, try alternative approach
      if (profileError.message.includes('profiles_id_fkey')) {
        // Wait a bit for auth user to be fully committed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry the insert
        const { data: retryProfileData, error: retryError } = await supabase.from("profiles").insert({
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
          is_edit_allowed: false,
          is_request_edit: false
        }).select().single();
        
        if (retryError) {
          return rejectWithValue(`Failed to create profile after retry: ${retryError.message}`);
        }
        // Update profileData with retry data
        profileData = retryProfileData;
      } else {
        return rejectWithValue(`Failed to create profile: ${profileError.message}`);
      }
    }

    console.log('Profile created successfully for user:', userId);
    console.log('Profile data:', profileData);
    console.log('User role:', role);
    console.log('Role type:', typeof role);
    console.log('Role === "coach":', role === 'coach');

    // If role is coach, create coach profile
    if (role === 'coach') {
      console.log('✅ Entering coach creation block for user:', userId);
      
      const coachData = {
        // id akan auto-generated oleh database (gen_random_uuid())
        name: display_name || email.split('@')[0],
        title: 'Cheerleading Coach',
        specialization: 'General Cheerleading',
        experience: '0-1 years',
        bio: `Passionate cheerleading coach committed to developing athletes' skills and teamwork.`,
        location: province_code || '',
        email: email,
        phone: phone_number || '',
        image_url: profile_photo_url,
        philosophy: 'Building confidence, teamwork, and excellence through cheerleading.',
        certifications: [],
        achievements: [],
        specialties: ['Cheerleading'],
        teams_coached: 0,
        champions_produced: 0,
        years_experience: 0,
        success_rate: 0,
        is_active: true,
        is_featured: false,
        sort_order: 0,
        created_by: userId,
        updated_by: userId,
        user_id: profileData?.id || userId  // Reference to profiles.id (UUID)
        
      };
      
      console.log('🔍 Coach data to insert:', JSON.stringify(coachData, null, 2));
      
      const { data: coachInsertData, error: coachError } = await supabase.from("coaches").insert(coachData).select();

      if (coachError) {
        console.error('Failed to create coach profile:', coachError);
        console.error('Coach error details:', JSON.stringify(coachError, null, 2));
        // You might want to rollback the profile creation here
        // For now, we'll continue but log the error
        return rejectWithValue(`Profile created but failed to create coach profile: ${coachError.message}`);
      }
      
      console.log('✅ Coach profile created successfully for user:', userId);
      console.log('🎯 Coach insert result:', coachInsertData);
    } else {
      console.log('❌ User role is not coach, skipping coach profile creation. Role:', role);
    }



    // Sign out user after successful registration (don't auto login)
    console.log('🔐 Signing out user after all operations completed');
    await supabase.auth.signOut();
    console.log('🚪 User signed out after successful registration');

    // Return null session to indicate user needs to login manually
    return { 
      session: null, 
      user: null,
      message: "Registrasi berhasil! Silakan cek email Anda untuk aktivasi akun sebelum login."
    };
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
      // state.hydrated = false // ✅ Reset

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
      // Don't set session and user (user needs to login manually)
      state.session = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      // You can show success message if needed
      console.log('Registration completed successfully - user needs to login manually');
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
