import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import counterReducer from "@/features/counter/counterSlice";
import publicImagesReducer from '@/features/publicImages/publicImagesSlice'
import divisionsReducer from "@/features/divisions/divisionsSlice";
import competitionsReducer from "@/features/competitions/competitionsSlice";
import newsReducer from "@/features/news/newsSlice";
import provincesReducer from "@/features/provinces/provincesSlice";
import coachesReducer from "@/features/coaches/coachesSlice";

import judgesReducer from "@/features/judges/judgesSlice";
import licenseCoursesReducer from "@/features/license-courses/licenseCoursesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    counter: counterReducer,
    publicImages: publicImagesReducer,
    divisions: divisionsReducer,
    competitions: competitionsReducer, // Added competitions reducer
    news: newsReducer, // Add the news reducer here
    provinces: provincesReducer, // Add the provinces reducer
    coaches: coachesReducer, // Add the coaches reducer

    judges: judgesReducer, // Add the judges reducer
    licenseCourses: licenseCoursesReducer, // Add the license courses reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
