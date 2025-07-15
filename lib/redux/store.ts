import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import counterReducer from "@/features/counter/counterSlice";
import publicImagesReducer from '@/features/publicImages/publicImagesSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    counter: counterReducer,
    publicImages: publicImagesReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
