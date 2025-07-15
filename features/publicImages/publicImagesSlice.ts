import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

export interface PublicImage {
  name: string;
  url: string;
}

interface PublicImagesState {
  images: PublicImage[];
  loading: boolean;
}

const initialState: PublicImagesState = {
  images: [],
  loading: false,
};

export const fetchPublicImages = createAsyncThunk(
  "publicImages/fetch",
  async () => {
    const { data, error } = await supabase.storage.from("uploads").list("public", {
      limit: 100,
      offset: 0,
    });

    if (error) throw error;

    const urls = data
      .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
      .map((file) => ({
        name: file.name,
        url: supabase.storage.from("uploads").getPublicUrl(`public/${file.name}`).data.publicUrl,
      }));

    return urls as PublicImage[];
  }
);

export const publicImagesSlice = createSlice({
  name: "publicImages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(fetchPublicImages.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default publicImagesSlice.reducer;
