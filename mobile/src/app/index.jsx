import { Redirect } from 'expo-router';

/**
 * App entry point.
 *
 * Always routes to the custom splash screen on cold start.
 * The splash screen handles:
 *   1. Animated brand reveal
 *   2. Session restoration (SecureStore token check + profile validation)
 *   3. Navigation to /(tabs) if authenticated, or /(auth)/login if not
 *
 * This avoids any flash of the login screen for returning users.
 */
export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}
