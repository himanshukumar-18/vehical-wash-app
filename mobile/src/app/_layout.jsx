import '../global.css';

// RTK Query endpoint injections — must be imported before any screen mounts
// so all cache tags and endpoints are registered on the shared baseApi.
import '@/features/auth/authApi';
import '@/features/services/servicesApi';
import '@/features/vehicles/vehiclesApi';
import '@/features/bookings/bookingsApi';

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import { store } from '@/store';
import { Colors } from '@/theme';

// Keep the native splash screen visible until fonts are loaded and
// the custom splash screen takes over to run session restoration.
SplashScreen.preventAutoHideAsync();

/**
 * Root layout — wraps the entire app with:
 *  - RTK Query endpoint injection imports (registered at startup)
 *  - Poppins font loading gate
 *  - GestureHandlerRootView
 *  - SafeAreaProvider
 *  - Redux Provider
 *  - Stack Navigator with explicit screen declarations
 *
 * IMPORTANT: We NEVER return null here. Returning null prevents the navigator
 * tree from mounting, which causes Expo Router's async useLinking to try
 * setState on an unmounted component ("Can't perform a React state update on
 * a component that hasn't mounted yet").
 * Instead we always render the Stack, but keep the native splash screen
 * visible until fonts are ready via useEffect.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    // The splash.jsx screen calls SplashScreen.hideAsync() once the brand
    // animation begins. But if fonts fail to load, we still need to hide
    // the native splash so the app does not freeze.
    if (fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError]);

  // Render an invisible placeholder while fonts are loading.
  // The native splash screen remains visible on top, so the user sees nothing.
  // The navigator tree IS mounted, allowing Expo Router's useLinking to work.
  if (!fontsLoaded && !fontError) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <ReduxProvider store={store}>
            <View style={styles.loading} />
          </ReduxProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'fade',
            }}
          >
            {/* Auth group — handled by (auth)/_layout.jsx */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />

            {/* Main tabs — handled by (tabs)/_layout.jsx */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Booking flow — dedicated full-screen slide-up route */}
            <Stack.Screen
              name="booking"
              options={{
                headerShown: false,
                animation: 'slide_from_bottom',
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
          </Stack>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
});
