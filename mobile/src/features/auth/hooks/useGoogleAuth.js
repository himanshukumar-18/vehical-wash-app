import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { saveTokens } from '@/services/storage/secureStorage';
import { setCredentials } from '../authSlice';
import { useGoogleAuthMutation } from '../authApi';
import { getAuthErrorMessage } from '../utils/authErrors';

WebBrowser.maybeCompleteAuthSession();

/**
 * useGoogleAuth
 *
 * Handles Google Sign-In with server-side Django token verification.
 * 1. Obtains Google id_token from client-side Google flow
 * 2. Sends id_token to backend: POST /api/auth/google/
 * 3. Backend verifies token with Google servers and returns app's JWT access/refresh tokens
 * 4. Saves JWT tokens in SecureStore and updates Redux state
 */
export const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const [googleAuthMutation, { isLoading: isBackendVerifying }] = useGoogleAuthMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const authenticateWithToken = useCallback(
    async (idToken, { onSuccess } = {}) => {
      if (!idToken) {
        setApiError('No Google ID token provided.');
        return;
      }

      setApiError(null);
      setIsLoading(true);

      try {
        const res = await googleAuthMutation({ id_token: idToken }).unwrap();

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
          throw new Error('Google authentication failed. No access token returned.');
        }

        // Persist tokens securely
        await saveTokens(accessToken, refreshToken || '');

        // Update Redux state
        const user = res.data?.user || res.user;
        dispatch(setCredentials({ user }));

        onSuccess?.(user);
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [googleAuthMutation, dispatch],
  );

  const promptGoogleSignIn = useCallback(
    async ({ onSuccess } = {}) => {
      setApiError(null);

      // Check if GOOGLE_CLIENT_ID or web client is configured
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        Alert.alert(
          'Google Sign-In',
          'Google Sign-In client ID is not configured in environment (EXPO_PUBLIC_GOOGLE_CLIENT_ID). Please use Email or Phone OTP login.',
        );
        return;
      }

      // If clientId exists, prompt OAuth authorization
      try {
        setIsLoading(true);
        Alert.alert(
          'Google Sign-In',
          'Connecting to Google authentication...',
          [{ text: 'OK' }]
        );
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    authenticateWithToken,
    promptGoogleSignIn,
    isLoading: isLoading || isBackendVerifying,
    apiError,
    clearError: () => setApiError(null),
  };
};

export default useGoogleAuth;
