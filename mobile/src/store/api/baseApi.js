import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '@/constants/api';
import { getAccessToken } from '@/services/storage/secureStorage';

/**
 * RTK Query base API.
 * All feature-specific API slices inject their endpoints into this base.
 *
 * Auth header strategy:
 *   - prepareHeaders reads the JWT access token from SecureStore on every request.
 *   - Token refresh logic will be added in Phase 2 (auth feature implementation).
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  // Tag types for cache invalidation — expand as features are added
  tagTypes: ['Auth', 'Profile', 'Vehicles', 'Services', 'Bookings', 'Payments'],
  // Feature endpoints are injected via injectEndpoints()
  endpoints: () => ({}),
});

export default baseApi;
