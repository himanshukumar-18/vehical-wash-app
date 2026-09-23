/**
 * API configuration constants.
 * Base URL is read from the EXPO_PUBLIC_API_BASE_URL environment variable.
 * Never hardcode production URLs or secrets here.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/';

export const API_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';

/** Endpoint paths — matched to docs/API.md */
export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: 'auth/register/',
  AUTH_VERIFY_OTP: 'auth/verify-otp/',
  AUTH_RESEND_OTP: 'auth/resend-otp/',
  AUTH_LOGIN: 'auth/login/',
  AUTH_TOKEN_REFRESH: 'auth/token/refresh/',
  AUTH_PROFILE: 'auth/profile/',

  // Vehicles
  VEHICLES: 'vehicles/',
  VEHICLE_DETAIL: (id) => `vehicles/${id}/`,
  VEHICLE_SET_DEFAULT: (id) => `vehicles/${id}/set_default/`,

  // Services
  SERVICES: 'services/',

  // Bookings
  BOOKINGS: 'bookings/',
  BOOKING_DETAIL: (id) => `bookings/${id}/`,
  BOOKING_CANCEL: (id) => `bookings/${id}/cancel/`,

  // Payments
  PAYMENT_CREATE_ORDER: 'payments/create-order/',
  PAYMENT_VERIFY: 'payments/verify/',

  // Public
  IMAGES: 'images/',
  TESTIMONIALS: 'testimonials/',
};
