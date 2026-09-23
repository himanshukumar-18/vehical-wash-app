/**
 * General utility helpers.
 */

/**
 * Formats a price number in Indian Rupee format.
 * @param {number} amount
 * @returns {string} e.g. '₹299'
 */
export const formatPrice = (amount) => {
  if (amount == null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * Extracts a user-friendly error message from an RTK Query / API error.
 * Follows the backend's standard error shape: { success, message, code, errors }
 * @param {any} error
 * @returns {string}
 */
export const getApiErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred.';
  // RTK Query error shapes
  if (error.data?.message) return error.data.message;
  if (error.error) return error.error;
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

/**
 * Trims and validates that a string is not empty.
 * @param {string} value
 * @returns {boolean}
 */
export const isNonEmpty = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Returns initials from a full name (max 2 chars).
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
};
