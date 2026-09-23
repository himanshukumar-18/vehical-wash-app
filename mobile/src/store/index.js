import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from './api/baseApi';
import authReducer from '@/features/auth/authSlice';

/**
 * Redux store for The Black Wash mobile app.
 *
 * Slices:
 *   auth    — authentication state (user, isAuthenticated)
 *   api     — RTK Query cache for all API requests (baseApi)
 *
 * All feature APIs inject endpoints into baseApi via injectEndpoints().
 * They are imported in _layout.jsx before any screen mounts to ensure
 * all tags and endpoint hooks are registered at startup.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // RTK Query internally uses non-serializable values (Promises, etc.)
        ignoredActions: [baseApi.reducerPath],
        ignoredPaths: [baseApi.reducerPath],
      },
    }).concat(baseApi.middleware),
});

export default store;
