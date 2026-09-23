import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { API_BASE_URL } from '@/constants/api';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '@/services/storage/secureStorage';
import { setCredentials, clearCredentials, setAuthLoading } from '../authSlice';

/**
 * useSessionRestore
 *
 * Runs once on app startup to restore an existing authenticated session.
 * Handles token validation, refresh, and failure cases.
 *
 * Strategy:
 *  1. Read access token from SecureStore.
 *  2. If no token → not authenticated.
 *  3. If token → fetch profile with it.
 *  4. If 200 → authenticated.
 *  5. If 401 → try token refresh.
 *  6. If refresh 200 → save new tokens → retry profile.
 *  7. If refresh fails → clear tokens → not authenticated.
 *  8. Network error → mark loading=false WITHOUT clearing tokens.
 *     (Preserve tokens across temporary network failures.)
 *
 * @param {Function} onComplete — called with { authenticated: boolean, error?: string }
 */
export const useSessionRestore = (onComplete) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
          if (!cancelled) dispatch(clearCredentials());
          if (!cancelled) onComplete?.({ authenticated: false });
          return;
        }

        // --- Attempt 1: validate with current access token ---
        let profileRes;
        try {
          profileRes = await fetch(`${API_BASE_URL}auth/profile/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          });
        } catch {
          // Network error on first attempt — preserve tokens
          if (!cancelled) dispatch(setAuthLoading(false));
          if (!cancelled) onComplete?.({ authenticated: false, error: 'network' });
          return;
        }

        if (profileRes.ok) {
          const user = await profileRes.json();
          if (!cancelled) dispatch(setCredentials({ user }));
          if (!cancelled) onComplete?.({ authenticated: true });
          return;
        }

        // --- Attempt 2: try token refresh on 401 ---
        if (profileRes.status === 401) {
          const refreshToken = await getRefreshToken();

          if (!refreshToken) {
            await clearTokens();
            if (!cancelled) dispatch(clearCredentials());
            if (!cancelled) onComplete?.({ authenticated: false });
            return;
          }

          let refreshRes;
          try {
            refreshRes = await fetch(`${API_BASE_URL}auth/token/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({ refresh: refreshToken }),
            });
          } catch {
            // Network error during refresh — preserve tokens
            if (!cancelled) dispatch(setAuthLoading(false));
            if (!cancelled) onComplete?.({ authenticated: false, error: 'network' });
            return;
          }

          if (refreshRes.ok) {
            const tokens = await refreshRes.json();
            // Save both tokens — ROTATE_REFRESH_TOKENS=True means new refresh is issued
            await saveTokens(tokens.access, tokens.refresh);

            // Retry profile with new access token
            let retryRes;
            try {
              retryRes = await fetch(`${API_BASE_URL}auth/profile/`, {
                headers: {
                  Authorization: `Bearer ${tokens.access}`,
                  Accept: 'application/json',
                },
              });
            } catch {
              if (!cancelled) dispatch(setAuthLoading(false));
              if (!cancelled) onComplete?.({ authenticated: false, error: 'network' });
              return;
            }

            if (retryRes.ok) {
              const user = await retryRes.json();
              if (!cancelled) dispatch(setCredentials({ user }));
              if (!cancelled) onComplete?.({ authenticated: true });
            } else {
              await clearTokens();
              if (!cancelled) dispatch(clearCredentials());
              if (!cancelled) onComplete?.({ authenticated: false });
            }
          } else {
            // Refresh token is also invalid/expired
            await clearTokens();
            if (!cancelled) dispatch(clearCredentials());
            if (!cancelled) onComplete?.({ authenticated: false });
          }
          return;
        }

        // Other server-side error (500, etc.) — don't clear valid tokens
        if (!cancelled) dispatch(setAuthLoading(false));
        if (!cancelled) onComplete?.({ authenticated: false, error: 'server' });
      } catch {
        // Unexpected error — safe fallback
        if (!cancelled) dispatch(setAuthLoading(false));
        if (!cancelled) onComplete?.({ authenticated: false, error: 'unknown' });
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
