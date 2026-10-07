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
 * Enhanced baseQuery with automatic JWT token refresh on 401.
 * Refresh endpoint: POST /api/auth/refresh/
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
      // Attempt token refresh via Django SimpleJWT refresh endpoint
      const refreshResult = await rawBaseQuery(
        {
          url: 'auth/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      const access =
        refreshResult.data?.access ||
        refreshResult.data?.tokens?.access ||
        refreshResult.data?.data?.access;
      const refresh =
        refreshResult.data?.refresh ||
        refreshResult.data?.tokens?.refresh ||
        refreshResult.data?.data?.refresh ||
        refreshToken;

      if (access) {
        // Save new access token (and new refresh token if rotated)
        await saveTokens(access, refresh);

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
  tagTypes: ['Auth', 'Profile', 'Vehicles', 'Services'],
  endpoints: () => ({}),
});

export default baseApi;
