/**
 * API configuration constants.
 * Base URL is read from the EXPO_PUBLIC_API_BASE_URL environment variable.
 * Never hardcode production URLs or secrets here.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/';

export const API_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';

