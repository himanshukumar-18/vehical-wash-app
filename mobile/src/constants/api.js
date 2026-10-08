import { Platform } from 'react-native';

/**
 * API configuration constants.
 *
 * Automatically normalizes the backend URL so it always ends with `/api/`.
 * Automatically adjusts 10.0.2.2 (Android emulator loopback) to localhost when testing in Web / iOS.
 */

const getResolvedBaseUrl = () => {
  let configuredUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    '';

  configuredUrl = configuredUrl.trim();

  // If no URL configured, default by platform
  if (!configuredUrl) {
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:8011/api/'
      : 'http://localhost:8011/api/';
  }

  // If testing on Web or iOS but .env has Android 10.0.2.2, adapt to localhost
  if (Platform.OS !== 'android' && configuredUrl.includes('10.0.2.2')) {
    configuredUrl = configuredUrl.replace('10.0.2.2', 'localhost');
  }

  // If testing on Android emulator but .env has localhost, adapt to 10.0.2.2
  if (Platform.OS === 'android' && configuredUrl.includes('localhost')) {
    configuredUrl = configuredUrl.replace('localhost', '10.0.2.2');
  }

  // Ensure trailing /api/
  if (configuredUrl.endsWith('/api/')) return configuredUrl;
  if (configuredUrl.endsWith('/api')) return `${configuredUrl}/`;
  if (configuredUrl.endsWith('/')) return `${configuredUrl}api/`;
  return `${configuredUrl}/api/`;
};

export const API_BASE_URL = getResolvedBaseUrl();
export const API_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';
