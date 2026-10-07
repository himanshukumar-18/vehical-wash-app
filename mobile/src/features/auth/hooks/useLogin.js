import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { API_BASE_URL } from '@/constants/api';
import { saveTokens } from '@/services/storage/secureStorage';
import { setCredentials } from '../authSlice';
import { useLoginMutation } from '../authApi';
import { getAuthErrorMessage } from '../utils/authErrors';

/**
 * useLogin
 *
 * Handles the full login flow:
 *  1. POST /api/auth/login/ → receives tokens and user object
 *  2. Save access & refresh tokens securely in SecureStore
 *  3. Use returned user object or fetch fresh profile from /api/auth/me/
 *  4. Dispatch setCredentials with user profile
 *  5. Call onSuccess callback for navigation
 *
 * @returns {{ submit, isLoading, apiError, clearError }}
 */
export const useLogin = () => {
  const dispatch = useDispatch();
  const [loginMutation, { isLoading: isMutating }] = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const submit = useCallback(
    async (formData, { onSuccess } = {}) => {
      setApiError(null);
      setIsLoading(true);

      try {
        // Step 1 — POST /api/auth/login/
        const res = await loginMutation({
          email: formData.email,
          password: formData.password,
        }).unwrap();

        // Extract tokens and user from standard backend payload
        const accessToken =
          res.data?.tokens?.access ||
          res.tokens?.access ||
          res.data?.access ||
          res.access;

        const refreshToken =
          res.data?.tokens?.refresh ||
          res.tokens?.refresh ||
          res.data?.refresh ||
          res.refresh;

        if (!accessToken) {
          throw new Error('Authentication failed. No access token returned.');
        }

        // Step 2 — Persist tokens securely
        await saveTokens(accessToken, refreshToken || '');

        // Step 3 — Get user profile (from response or fallback to /api/auth/me/)
        let user = res.data?.user || res.user;

        if (!user) {
          try {
            const profileRes = await fetch(`${API_BASE_URL}auth/me/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
              },
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              user = profileData.data || profileData;
            }
          } catch {
            user = { email: formData.email, fullname: '' };
          }
        }

        // Step 4 — Update Redux auth state
        dispatch(setCredentials({ user }));

        // Step 5 — Notify caller to navigate
        onSuccess?.();
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [loginMutation, dispatch],
  );

  return {
    submit,
    isLoading: isLoading || isMutating,
    apiError,
    clearError: () => setApiError(null),
  };
};
