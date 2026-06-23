import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import AuthController from "../../controllers/auth.controller";

import {

  fetchDataFromApi,

  invalidateRestoreSessionCache,

  restoreSession,

} from "../../utils/api";

import {

  clearPersistedAuthUser,

  emptyAuthUser,

  mapApiUserToAuthUser,

  persistAuthUser,

  readStoredAuthUser,

} from "../authUser";



async function resolveAuthUser(cachedUser) {

  let user = cachedUser;



  if (!user) {

    const profile = await fetchDataFromApi("/api/auth/profile");

    const profileUser = profile?.data?.user || profile?.user;

    if (profileUser) {

      user = mapApiUserToAuthUser(profileUser);

      persistAuthUser(user);

    }

  }



  return user;

}



export const initializeAuth = createAsyncThunk(

  "auth/initialize",

  async () => {

    invalidateRestoreSessionCache();

    const cachedUser = readStoredAuthUser();

    const restored = await restoreSession({ bypassCache: true });



    if (restored === false) {

      AuthController.clearLocalSession();

      return { user: emptyAuthUser, isAuthenticated: false };

    }



    if (restored === null) {

      if (cachedUser) {

        return { user: cachedUser, isAuthenticated: true };

      }

      return { user: emptyAuthUser, isAuthenticated: false };

    }



    const user = await resolveAuthUser(cachedUser);

    if (user && (user.userId || user.email)) {

      return { user, isAuthenticated: true };

    }



    AuthController.clearLocalSession();

    return { user: emptyAuthUser, isAuthenticated: false };

  }

);



export const revalidateAuth = createAsyncThunk(

  "auth/revalidate",

  async (_, { getState }) => {

    invalidateRestoreSessionCache();

    const restored = await restoreSession({ bypassCache: true });



    if (restored === false) {

      AuthController.clearLocalSession();

      return { user: emptyAuthUser, isAuthenticated: false };

    }



    if (restored === true) {

      const cachedUser = readStoredAuthUser();

      const currentUser = getState().auth.user;

      const user = cachedUser || currentUser;

      const isAuthenticated = !!(user?.userId || user?.email);

      return { user: isAuthenticated ? user : emptyAuthUser, isAuthenticated };

    }



    return null;

  }

);



export const selectIsLoggedIn = (state) => {

  const { isAuthenticated, isAuthInitialized } = state.auth;

  if (isAuthInitialized) return isAuthenticated;

  return !!readStoredAuthUser();

};



const authSlice = createSlice({

  name: "auth",

  initialState: {

    user: emptyAuthUser,

    isAuthenticated: false,

    isAuthInitialized: false,

  },

  reducers: {

    setAuthUser(state, action) {

      state.user = action.payload;

      state.isAuthenticated = !!(action.payload?.userId || action.payload?.email);

      state.isAuthInitialized = true;

      persistAuthUser(action.payload);

    },

    clearAuth(state) {

      state.user = emptyAuthUser;

      state.isAuthenticated = false;

      state.isAuthInitialized = true;

      clearPersistedAuthUser();

    },

    hydrateAuthFromStorage(state) {

      const cached = readStoredAuthUser();

      if (cached) {

        state.user = cached;

      }

    },

  },

  extraReducers: (builder) => {

    builder

      .addCase(initializeAuth.pending, (state) => {

        const cached = readStoredAuthUser();

        if (cached) {

          state.user = cached;

        }

      })

      .addCase(initializeAuth.fulfilled, (state, action) => {

        state.user = action.payload.user;

        state.isAuthenticated = action.payload.isAuthenticated;

        state.isAuthInitialized = true;

      })

      .addCase(initializeAuth.rejected, (state) => {

        state.user = emptyAuthUser;

        state.isAuthenticated = false;

        state.isAuthInitialized = true;

        clearPersistedAuthUser();

      })

      .addCase(revalidateAuth.fulfilled, (state, action) => {

        if (!action.payload) return;

        state.user = action.payload.user;

        state.isAuthenticated = action.payload.isAuthenticated;

        state.isAuthInitialized = true;

      });

  },

});



export const { setAuthUser, clearAuth, hydrateAuthFromStorage } = authSlice.actions;

export default authSlice.reducer;


