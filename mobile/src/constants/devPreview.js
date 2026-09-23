/**
 * Development-Only Home Preview Mode
 *
 * Requirements:
 *  1. Only active when __DEV__ is true AND EXPO_PUBLIC_DEV_HOME_PREVIEW is 'true'.
 *  2. In production builds (__DEV__ === false), this flag is strictly guaranteed to be FALSE.
 *  3. Does NOT fake authentication, tokens, or customer data.
 */

export const IS_DEV_HOME_PREVIEW = Boolean(
  typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    process.env.EXPO_PUBLIC_DEV_HOME_PREVIEW === 'true'
);
