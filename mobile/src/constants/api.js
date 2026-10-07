import { Platform } from 'react-native';

/**
 * API configuration constants.
 *
 * Automatically normalizes the backend URL so it always ends with `/api/`.
 * Supports Android Emulator (10.0.2.2), iOS Simulator / Web (localhost), and Production.
 */

const getDevDefaultUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8011/api/';
  }
  return 'http://localhost:8011/api/';
};

const rawUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  getDevDefaultUrl();

// Ensure the Base URL always ends with `/api/`
export const API_BASE_URL = (() => {
  let url = rawUrl.trim();
  if (url.endsWith('/api/')) return url;
  if (url.endsWith('/api')) return `${url}/`;
  if (url.endsWith('/')) return `${url}api/`;
  return `${url}/api/`;
})();

export const API_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';
