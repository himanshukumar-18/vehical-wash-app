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
 * Returns dynamic user initials from a full name / username or user object.
 *
 * Rules:
 * 1. Trim leading/trailing spaces.
 * 2. Split by whitespace ignoring multiple spaces.
 * 3. 2 or more words: First char of first word + First char of last word in uppercase.
 * 4. 1 word: First char in uppercase.
 * 5. Empty / null / undefined: Returns neutral fallback "U".
 *
 * Examples:
 * - "Himanshu Kumar" -> "HK"
 * - "Himanshu Kumar Singh" -> "HS"
 * - "Rahul Sharma" -> "RS"
 * - "Aman" -> "A"
 * - "  Aman   Verma  " -> "AV"
 * - "" / null / undefined -> "U"
 *
 * @param {string|object} nameOrUser
 * @returns {string}
 */
export const getUserInitials = (nameOrUser) => {
  if (!nameOrUser) return 'U';

  let raw = '';
  if (typeof nameOrUser === 'string') {
    raw = nameOrUser;
  } else if (typeof nameOrUser === 'object') {
    raw =
      nameOrUser.fullname ||
      nameOrUser.full_name ||
      nameOrUser.name ||
      (nameOrUser.first_name || nameOrUser.last_name
        ? `${nameOrUser.first_name || ''} ${nameOrUser.last_name || ''}`
        : '') ||
      nameOrUser.username ||
      '';
  }

  if (typeof raw !== 'string') return 'U';
  const words = raw.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0][0].toUpperCase();
  const firstInitial = words[0][0].toUpperCase();
  const lastInitial = words[words.length - 1][0].toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

export const getInitials = getUserInitials;
