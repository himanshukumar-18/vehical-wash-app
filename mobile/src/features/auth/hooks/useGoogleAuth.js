import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

import { saveTokens } from '@/services/storage/secureStorage';
import { setCredentials } from '../authSlice';
import { useGoogleAuthMutation } from '../authApi';
import { getAuthErrorMessage } from '../utils/authErrors';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Discovery Document
const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * useGoogleAuth
 *
 * Full end-to-end Google OAuth 2.0 / OpenID Connect authentication hook:
 * 1. Launches Google authentication session via AuthSession / WebBrowser
 * 2. Receives Google id_token from Google OAuth response
 * 3. Sends id_token to Django backend: POST /api/auth/google/
 * 4. Backend verifies Google signature & claims, issues application JWT (access & refresh)
 * 5. Saves JWT securely in SecureStore and updates Redux auth state
 */
export const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const [googleAuthMutation, { isLoading: isBackendVerifying }] = useGoogleAuthMutation();
  const [isPrompting, setIsPrompting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const clientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    '';

  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: 'theblackwash',
        preferLocalhost: true,
      }),
    [],
  );

  const [, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || 'theblackwash-google-client',
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri,
    },
    googleDiscovery,
  );

  const authenticateWithToken = useCallback(
    async (idToken, { onSuccess } = {}) => {
      if (!idToken) {
        setApiError('No Google ID token provided.');
        return;
      }

      setApiError(null);

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

        // Persist JWT tokens securely
        await saveTokens(accessToken, refreshToken || '');

        // Update Redux state
        const user = res.data?.user || res.user;
        dispatch(setCredentials({ user }));

        onSuccess?.(user);
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      }
    },
    [googleAuthMutation, dispatch],
  );

  const promptGoogleSignIn = useCallback(
    async ({ onSuccess } = {}) => {
      setApiError(null);

      if (!clientId) {
        if (Platform.OS === 'web') {
          Alert.alert(
            'Google Sign-In Setup',
            'To enable Google Sign-In, please configure EXPO_PUBLIC_GOOGLE_CLIENT_ID in your mobile/.env file with your Google OAuth 2.0 Client ID from Google Cloud Console.\n\nYou can also sign in with Email or Phone OTP in the meantime.',
          );
        } else {
          Alert.alert(
            'Google Sign-In',
            'Google Client ID is not configured (EXPO_PUBLIC_GOOGLE_CLIENT_ID). Please use Email or Phone OTP login.',
          );
        }
        return;
      }

      try {
        setIsPrompting(true);
        const res = await promptAsync();

        if (res?.type === 'success') {
          const idToken =
            res.params?.id_token ||
            res.authentication?.idToken;

          if (idToken) {
            await authenticateWithToken(idToken, { onSuccess });
          } else {
            setApiError('Unable to retrieve Google ID token from OAuth response.');
          }
        } else if (res?.type === 'error') {
          setApiError(res.error?.message || 'Google authentication was cancelled or failed.');
        }
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      } finally {
        setIsPrompting(false);
      }
    },
    [clientId, promptAsync, authenticateWithToken],
  );

  return {
    authenticateWithToken,
    promptGoogleSignIn,
    isLoading: isPrompting || isBackendVerifying,
    apiError,
    clearError: () => setApiError(null),
    isConfigured: Boolean(clientId),
  };
};

export default useGoogleAuth;
