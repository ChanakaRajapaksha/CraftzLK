import { configureStore } from "@reduxjs/toolkit";
import { emptyAuthUser, readStoredAuthUser } from "./authUser";
import authReducer from "./slices/authSlice";

const cachedUser = readStoredAuthUser();

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: {
      user: cachedUser || emptyAuthUser,
      isAuthenticated: false,
      isAuthInitialized: false,
    },
  },
});

export default store;
