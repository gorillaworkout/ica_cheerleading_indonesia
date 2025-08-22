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
    // console.log('📝 No session found in fetchSessionAndProfile - returning null without signOut')
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
    
    // ✅ CRITICAL FIX: Check if user is deleted and auto logout
    if (profile && profile.is_deleted === true) {
      console.log("🚫 User is deleted, auto logging out...");
      // Set flag for toast notification
      if (typeof window !== 'undefined') {
        localStorage.setItem("userWasDeleted", "true");
      }
      await supabase.auth.signOut();
      return { session: null, user: null, profile: null };
    }
  }
  // console.log(profile, 'profile fetchSessionAndProfile')
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

    // ✅ CRITICAL FIX: Check if user is deleted before allowing login
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_deleted")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error checking user profile:", profileError);
        return rejectWithValue("Terjadi kesalahan saat memeriksa profil user.");
      }

      if (profile && profile.is_deleted === true) {
        // Sign out the user immediately
        await supabase.auth.signOut();
        // Set flag for toast notification
        if (typeof window !== 'undefined') {
          localStorage.setItem("userWasDeleted", "true");
        }
        return rejectWithValue("Akun kamu telah dihapus dan tidak dapat digunakan lagi.");
      }
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
    // Pre-check: apakah email sudah ada dan/atau sudah terverifikasi
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        const info = await res.json()
        if (info.exists && info.verified) {
          return rejectWithValue('Email sudah terdaftar dan terverifikasi. Silakan login. Jika lupa password, gunakan menu Lupa Password.')
        }
        if (info.exists && !info.verified) {
          return rejectWithValue('Email sudah terdaftar namun belum diverifikasi. Silakan cek email Anda atau klik Kirim Ulang Email.')
        }
      }
    } catch {}

    // Enable email confirmation with redirect URL
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      const rawMsg = (error.message || "").toLowerCase()
      let friendly = "Terjadi kesalahan saat pendaftaran. Silakan coba lagi."
      if (rawMsg.includes("already registered") || rawMsg.includes("already exists") || rawMsg.includes("exists")) {
        friendly = "Email sudah terdaftar. Silakan login. Jika belum menerima email verifikasi, gunakan tombol 'Kirim Ulang Email'."
      } else if (rawMsg.includes("rate limit") || rawMsg.includes("too many")) {
        friendly = "Terlalu banyak percobaan dalam waktu singkat. Coba lagi beberapa menit lagi."
      } else if (rawMsg.includes("invalid email")) {
        friendly = "Format email tidak valid. Periksa kembali alamat email Anda."
      } else if (rawMsg.includes("password") && rawMsg.includes("at least")) {
        friendly = "Password terlalu lemah. Gunakan kombinasi huruf dan angka dengan panjang minimal yang disyaratkan."
      }
      return rejectWithValue(friendly);
    }

    const userId = data.user?.id;
    if (!userId) return rejectWithValue("User ID not found");



    let id_photo_url: string | null = null;
    let profile_photo_url:string | null = null
    
    if (id_photo_file) {

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(`id-photos/${userId}-${Date.now()}`, id_photo_file);

      if (uploadError) {
        console.error('❌ ID photo upload error:', uploadError);
        return rejectWithValue(`Failed to upload ID photo: ${uploadError.message}`);
      }
      id_photo_url = uploadData?.path ?? null;

    }

     if (profile_photo_file) {

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(`profile-photos/${userId}-${Date.now()}`, profile_photo_file);

      if (uploadError) {
        console.error('❌ Profile photo upload error:', uploadError);
        return rejectWithValue(`Failed to upload profile photo: ${uploadError.message}`);
      }
      profile_photo_url = uploadData?.path ?? null;

    }

    const now = new Date().toISOString();

    // Verify birth_date format
    if (birth_date) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/
      if (!datePattern.test(birth_date)) {
        return rejectWithValue("Invalid birth date format. Please try again.")
      }
    }
    
    // Try to ensure profile exists for this userId
    let profileData: any = null;
    // Cek apakah profile dengan id user sudah ada
    const { data: existingById } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (existingById) {
      profileData = existingById
    }

    if (!profileData) {
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
      const rawMsg = (profileError.message || "").toLowerCase()
      
      // If it's a foreign key constraint error, try alternative approach
      if (rawMsg.includes('profiles_id_fkey')) {
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
          const retryMsg = (retryError.message || "").toLowerCase()
          if (retryMsg.includes('duplicate key value') || retryMsg.includes('unique constraint') || retryMsg.includes('profiles_email_key')) {
            // Fetch existing profile by email and continue
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', email)
              .single()
            profileData = existingProfile
          } else {
            return rejectWithValue("Gagal membuat profil. Silakan coba lagi.");
          }
        } else {
          // Update profileData with retry data
          profileData = retryProfileData;
        }
      } else if (rawMsg.includes('duplicate key value') || rawMsg.includes('unique constraint') || rawMsg.includes('profiles_email_key')) {
        // Email already exists: anggap akun lama. Jangan lanjut registrasi akun baru untuk email yang sama
        return rejectWithValue('Email sudah terdaftar. Silakan login menggunakan email tersebut.')
      } else {
        return rejectWithValue("Gagal membuat profil. Silakan coba lagi.");
      }
    }
    }







    // If role is coach, create coach profile
    if (role === 'coach') {
      // Hindari membuat coach jika profile.id tidak sama dengan userId (inkonsistensi)
      if (!profileData || profileData.id !== userId) {
        // Jangan block registrasi; cukup lewati pembuatan coach
        console.warn('Skip coach creation: profileData missing or mismatched with auth userId')
      } else {

      
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
        // Catatan: sengaja tidak mengisi created_by/updated_by untuk hindari FK error saat registrasi awal
        user_id: profileData?.id || userId  // Reference to profiles.id (UUID)
        
      };
      

      
      const { data: coachInsertData, error: coachError } = await supabase.from("coaches").insert(coachData).select();

      if (coachError) {
        console.warn('Coach auto-create skipped due to error (will not block registration):', coachError);
        // Jangan gagalkan registrasi hanya karena coach gagal dibuat otomatis.
        // Pengguna bisa lengkapi profil coach dari halaman profil nanti.
      }
      }
      


    } else if (role === 'athlete') {
      // ✅ CRITICAL FIX: Update profile with athlete-specific data instead of creating separate table
      if (!profileData || profileData.id !== userId) {
        console.warn('Skip athlete data update: profileData missing or mismatched with auth userId')
      } else {
        // Calculate age from birth_date if available
        let age = 18; // Default age
        if (birth_date) {
          const birthYear = new Date(birth_date).getFullYear();
          const currentYear = new Date().getFullYear();
          age = currentYear - birthYear;
        }

        // Update profile with athlete-specific data
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            age: age,
            team_id: null, // Will be assigned later when joining team
            division_id: null // Will be assigned later when joining division
          })
          .eq("id", profileData.id);

        if (updateError) {
          console.warn('Athlete data update skipped due to error (will not block registration):', updateError);
          // Jangan gagalkan registrasi hanya karena update athlete data gagal.
          // Pengguna bisa lengkapi profil athlete dari halaman profil nanti.
        } else {
          console.log('✅ Athlete data added to profile successfully');
        }
      }
    }


    // Sign out user after successful registration (don't auto login)

    await supabase.auth.signOut();


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
      // console.log('fetch session and profile loading jadi true')
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchSessionAndProfile.fulfilled, (state, action) => {
      // console.log('fetchSessionAndProfile fulfiled loading jadi false')
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
