import * as SecureStore from 'expo-secure-store';

/**
 * Secure token storage using Expo SecureStore.
 * JWT tokens are NEVER stored in AsyncStorage, Redux state, or .env files.
 *
 * Keys used:
 *   tbw_access_token  — short-lived JWT access token (1 hour)
 *   tbw_refresh_token — long-lived JWT refresh token (7 days)
 *
 * Platform safety: On web, expo-secure-store's native module is an empty
 * object stub, so all async methods are undefined. All calls here are
 * wrapped with try/catch and return null gracefully instead of crashing
 * with "getValueWithKeyAsync is not a function".
 */

const KEYS = {
  ACCESS_TOKEN: 'tbw_access_token',
  REFRESH_TOKEN: 'tbw_refresh_token',
};

/**
 * Saves both JWT tokens securely.
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
  } catch {
    // SecureStore unavailable (web / unsupported platform) — no-op
  }
};

/**
 * Retrieves the stored access token.
 * Returns null when SecureStore is unavailable (e.g. web platform).
 * @returns {Promise<string|null>}
 */
export const getAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
};

/**
 * Retrieves the stored refresh token.
 * Returns null when SecureStore is unavailable (e.g. web platform).
 * @returns {Promise<string|null>}
 */
export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
};

/**
 * Deletes all stored tokens (call on logout).
 */
export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  } catch {
    // SecureStore unavailable (web / unsupported platform) — no-op
  }
};

export default { saveTokens, getAccessToken, getRefreshToken, clearTokens };
