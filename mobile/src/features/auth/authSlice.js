import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth slice — manages authentication state.
 *
 * What lives here:
 *   - Current user profile data
 *   - isAuthenticated flag
 *   - isLoading flag (for initial auth check)
 *
 * What does NOT live here:
 *   - JWT tokens (stored in SecureStore only)
 *   - Passwords (never stored)
 */
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true until initial token check completes
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Called after successful login or token validation.
     * @param {object} payload.user — user profile object from API
     */
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    /**
     * Called after logout or token expiry.
     */
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    /**
     * Controls the initial loading state during startup auth check.
     */
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setAuthLoading } =
  authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;

export default authSlice.reducer;
