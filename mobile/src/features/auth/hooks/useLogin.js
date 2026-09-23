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
 *  1. POST /api/auth/login/ → receives { access, refresh }
 *  2. Save tokens to SecureStore
 *  3. GET /api/auth/profile/ with the new access token
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
        // Response: { access, refresh } — direct SimpleJWT format, no wrapper
        const tokens = await loginMutation({
          email: formData.email,
          password: formData.password,
        }).unwrap();

        // Step 2 — Persist tokens securely
        await saveTokens(tokens.access, tokens.refresh);

        // Step 3 — Fetch full user profile with new access token
        // Using fetch directly since RTK Query hooks cannot be called in callbacks
        let user = { email: formData.email, fullname: '' };
        try {
          const profileRes = await fetch(`${API_BASE_URL}auth/profile/`, {
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              Accept: 'application/json',
            },
          });
          if (profileRes.ok) {
            user = await profileRes.json();
          }
        } catch {
          // Profile fetch network error — proceed with partial user data
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
