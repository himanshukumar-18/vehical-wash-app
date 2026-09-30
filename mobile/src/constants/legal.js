import { Linking, Alert } from 'react-native';

/**
 * The Black Wash — Centralized Legal & Privacy URLs
 *
 * These URLs point to the production/staging Vercel legal website.
 * Update EXPO_PUBLIC_LEGAL_SITE_URL in .env to customize the domain.
 */
export const LEGAL_SITE_BASE_URL =
  process.env.EXPO_PUBLIC_LEGAL_SITE_URL || 'https://theblackwash.vercel.app';

export const LEGAL_URLS = {
  privacyPolicy: `${LEGAL_SITE_BASE_URL}/privacy-policy`,
  terms: `${LEGAL_SITE_BASE_URL}/terms`,
  accountDeletion: `${LEGAL_SITE_BASE_URL}/account-deletion`,
  contact: `${LEGAL_SITE_BASE_URL}/contact`,
};

/**
 * Safely opens a legal web page in the device's default browser.
 * @param {string} url - Target legal URL
 */
export async function openLegalUrl(url) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Unable to Open Link', `Please visit ${url} in your web browser.`);
    }
  } catch {
    Alert.alert('Unable to Open Link', `Please visit ${url} in your web browser.`);
  }
}
