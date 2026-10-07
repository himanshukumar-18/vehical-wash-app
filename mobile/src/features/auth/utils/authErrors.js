/**
 * Maps backend error responses to human-readable messages.
 *
 * Backend error shape (from config/exceptions.py):
 *   { success: false, message: string, code: string, errors: object | null }
 *
 * Known error codes:
 *   VALIDATION_ERROR        — field validation failed
 *   INVALID_OTP             — wrong OTP code
 *   OTP_EXPIRED             — OTP has expired
 *   OTP_RESEND_COOLDOWN     — resend requested too quickly
 *   RATE_LIMIT_EXCEEDED     — too many OTP attempts (max 5)
 *   INVALID_CREDENTIALS     — wrong email/password
 *   AUTHENTICATION_REQUIRED — no auth header
 *   RESOURCE_NOT_FOUND      — user/object not found
 *   USER_NOT_FOUND          — user account not found
 *   IDEMPOTENCY_CONFLICT    — duplicate registration / record
 *   GOOGLE_AUTH_FAILED      — Google sign-in validation failure
 */

/**
 * Returns a user-friendly error message from an RTK Query error.
 * @param {any} error — RTK Query error object
 * @returns {string}
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // Network / fetch error (no response received)
  if (!error.data && error.error) {
    return 'Network error. Please check your connection and try again.';
  }

  const data = error.data;
  if (!data) return 'An unexpected error occurred.';

  const { code, errors } = data;

  // VALIDATION_ERROR — may have field-level errors
  if (code === 'VALIDATION_ERROR' && errors) {
    if (errors.error) {
      const msg = Array.isArray(errors.error) ? errors.error[0] : errors.error;
      return String(msg);
    }
    if (errors.email) {
      const msg = Array.isArray(errors.email) ? errors.email[0] : errors.email;
      return String(msg);
    }
    if (errors.password) {
      const msg = Array.isArray(errors.password) ? errors.password[0] : errors.password;
      return String(msg);
    }
    if (errors.phone) {
      const msg = Array.isArray(errors.phone) ? errors.phone[0] : errors.phone;
      return String(msg);
    }
    if (errors.fullname) {
      const msg = Array.isArray(errors.fullname) ? errors.fullname[0] : errors.fullname;
      return String(msg);
    }
    if (errors.otp) {
      const msg = Array.isArray(errors.otp) ? errors.otp[0] : errors.otp;
      return String(msg);
    }
    if (errors.non_field_errors) {
      const msg = Array.isArray(errors.non_field_errors)
        ? errors.non_field_errors[0]
        : errors.non_field_errors;
      return String(msg);
    }
    const firstKey = Object.keys(errors)[0];
    if (firstKey) {
      const val = errors[firstKey];
      return String(Array.isArray(val) ? val[0] : val);
    }
  }

  // Specific known codes
  if (code === 'INVALID_OTP') return 'Invalid OTP code. Please try again.';
  if (code === 'OTP_EXPIRED') return 'OTP has expired. Please request a new one.';
  if (code === 'OTP_RESEND_COOLDOWN') return 'Please wait before requesting another OTP.';
  if (code === 'RATE_LIMIT_EXCEEDED')
    return 'Too many attempts. Please try again in a few minutes.';
  if (code === 'INVALID_CREDENTIALS') return 'Invalid email or password.';
  if (code === 'AUTHENTICATION_REQUIRED') return 'Please log in to continue.';
  if (code === 'RESOURCE_NOT_FOUND' || code === 'USER_NOT_FOUND')
    return 'Account not found. Please register first.';
  if (code === 'IDEMPOTENCY_CONFLICT')
    return 'An account with this email/phone already exists.';
  if (code === 'GOOGLE_AUTH_FAILED')
    return 'Google authentication failed. Please try again.';

  // Use backend message if available
  if (data.message) return data.message;

  return 'Something went wrong. Please try again.';
};
