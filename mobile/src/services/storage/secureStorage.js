import * as SecureStore from 'expo-secure-store';

/**
 * Secure token storage using Expo SecureStore with in-memory caching and web fallback.
 * JWT tokens are NEVER stored in AsyncStorage, Redux state, or .env files.
 *
 * Keys used:
 *   tbw_access_token  — short-lived JWT access token (1 hour)
 *   tbw_refresh_token — long-lived JWT refresh token (7 days)
 */

const KEYS = {
  ACCESS_TOKEN: 'tbw_access_token',
  REFRESH_TOKEN: 'tbw_refresh_token',
};

// In-memory cache for fast, synchronous access during app session
let inMemoryAccessToken = null;
let inMemoryRefreshToken = null;

/**
 * Saves both JWT tokens securely.
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export const saveTokens = async (accessToken, refreshToken) => {
  inMemoryAccessToken = accessToken;
  inMemoryRefreshToken = refreshToken;

  try {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
  } catch {
    // Web fallback if SecureStore is unavailable
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
      } catch {
        // No-op
      }
    }
  }
};

/**
 * Retrieves the stored access token.
 * Checks memory cache -> SecureStore -> Web localStorage.
 * @returns {Promise<string|null>}
 */
export const getAccessToken = async () => {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  try {
    const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    if (token) {
      inMemoryAccessToken = token;
      return token;
    }
  } catch {
    // Fallback to web localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const token = localStorage.getItem(KEYS.ACCESS_TOKEN);
        if (token) {
          inMemoryAccessToken = token;
          return token;
        }
      } catch {
        // No-op
      }
    }
  }

  return null;
};

/**
 * Retrieves the stored refresh token.
 * Checks memory cache -> SecureStore -> Web localStorage.
 * @returns {Promise<string|null>}
 */
export const getRefreshToken = async () => {
  if (inMemoryRefreshToken) {
    return inMemoryRefreshToken;
  }

  try {
    const token = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    if (token) {
      inMemoryRefreshToken = token;
      return token;
    }
  } catch {
    // Fallback to web localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const token = localStorage.getItem(KEYS.REFRESH_TOKEN);
        if (token) {
          inMemoryRefreshToken = token;
          return token;
        }
      } catch {
        // No-op
      }
    }
  }

  return null;
};

/**
 * Deletes all stored tokens (call on logout).
 */
export const clearTokens = async () => {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;

  try {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  } catch {
    // Web fallback
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(KEYS.ACCESS_TOKEN);
        localStorage.removeItem(KEYS.REFRESH_TOKEN);
      } catch {
        // No-op
      }
    }
  }
};

export default { saveTokens, getAccessToken, getRefreshToken, clearTokens };
