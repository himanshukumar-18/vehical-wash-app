/**
 * Maps backend error responses to human-readable messages.
 *
 * Backend error shape (from config/exceptions.py):
 *   { success: false, message: string, code: string, errors: object | null }
 *
 * Known error codes:
 *   VALIDATION_ERROR    — field validation failed
 *   INVALID_OTP         — wrong OTP code
 *   RATE_LIMIT_EXCEEDED — too many OTP attempts (max 5)
 *   INVALID_CREDENTIALS — wrong email/password
 *   AUTHENTICATION_REQUIRED — no auth header
 *   RESOURCE_NOT_FOUND  — user not found
 *   IDEMPOTENCY_CONFLICT — duplicate registration
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
    // Login: unverified email error comes in errors.error
    if (errors.error) {
      const msg = Array.isArray(errors.error) ? errors.error[0] : errors.error;
      return String(msg);
    }
    // Email field errors
    if (errors.email) {
      const msg = Array.isArray(errors.email) ? errors.email[0] : errors.email;
      return String(msg);
    }
    // Password field errors
    if (errors.password) {
      const msg = Array.isArray(errors.password) ? errors.password[0] : errors.password;
      return String(msg);
    }
    // Fullname field errors
    if (errors.fullname) {
      const msg = Array.isArray(errors.fullname) ? errors.fullname[0] : errors.fullname;
      return String(msg);
    }
    // Non-field errors
    if (errors.non_field_errors) {
      const msg = Array.isArray(errors.non_field_errors)
        ? errors.non_field_errors[0]
        : errors.non_field_errors;
      return String(msg);
    }
    // Return first available error
    const firstKey = Object.keys(errors)[0];
    if (firstKey) {
      const val = errors[firstKey];
      return String(Array.isArray(val) ? val[0] : val);
    }
  }

  // Specific known codes
  if (code === 'INVALID_OTP') return 'Invalid OTP code. Please try again.';
  if (code === 'RATE_LIMIT_EXCEEDED')
    return 'Too many incorrect attempts. Please try again later.';
  if (code === 'INVALID_CREDENTIALS') return 'Invalid email or password.';
  if (code === 'AUTHENTICATION_REQUIRED') return 'Please log in to continue.';
  if (code === 'RESOURCE_NOT_FOUND')
    return 'Account not found. Please register first.';
  if (code === 'IDEMPOTENCY_CONFLICT')
    return 'An account with this email already exists.';

  // Use backend message if available
  if (data.message) return data.message;

  return 'Something went wrong. Please try again.';
};
