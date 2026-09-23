import { Stack } from 'expo-router';

import { Colors } from '@/theme';

/**
 * Auth group layout — contains all authentication screens.
 *
 * Screens:
 *   splash       — Animated brand reveal + session restoration
 *   login        — Email + password login
 *   register     — New account registration
 *   otp-verify   — Email OTP verification
 *   auth-success — Post-login success animation
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.primaryBlack },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="splash" options={{ animation: 'none' }} />
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="otp-verify" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="auth-success" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
