import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '@/constants/api';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '@/services/storage/secureStorage';
import { clearCredentials } from '@/features/auth/authSlice';

/**
 * Raw fetchBaseQuery with JWT Authorization header injection.
 */
const rawBaseQuery = fetchBaseQuery({
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
});

/**
 * Enhanced baseQuery with automatic JWT token refresh on 401 / AUTHENTICATION_REQUIRED.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    (result.error.status === 401 ||
      result.error.data?.code === 'AUTHENTICATION_REQUIRED' ||
      result.error.data?.code === 'token_not_valid')
  ) {
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      // Attempt token refresh
      const refreshResult = await rawBaseQuery(
        {
          url: 'auth/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data && refreshResult.data.access) {
        // Save new access token (and new refresh token if rotated)
        await saveTokens(
          refreshResult.data.access,
          refreshResult.data.refresh || refreshToken
        );

        // Retry the original query with the refreshed access token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh token failed/expired — clear session
        await clearTokens();
        api.dispatch(clearCredentials());
      }
    } else {
      // No refresh token available
      await clearTokens();
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

/**
 * RTK Query base API.
 * All feature-specific API slices inject their endpoints into this base.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Profile', 'Vehicles', 'Services', 'Bookings'],
  endpoints: () => ({}),
});

export default baseApi;
