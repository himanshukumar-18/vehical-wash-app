import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';

import { Colors } from '@/theme';

// Custom background provided for The Black Wash authentication experience
const AUTH_BG_IMAGE = require('@/assets/images/login-register.png');

/**
 * AuthBackground
 *
 * Full-screen wrapper using the authentic "The Black Wash" vehicle branding background.
 * Applies a cinematic dark scrim overlay to ensure maximum text contrast,
 * readable form fields, and accessibility on all device dimensions.
 *
 * @param {React.ReactNode} children
 * @param {number} overlayOpacity - default 0.82
 * @param {object} style - optional container style
 */
const AuthBackground = ({
  children,
  overlayOpacity = 0.84,
  style,
}) => {
  return (
    <ImageBackground
      source={AUTH_BG_IMAGE}
      style={[styles.background, style]}
      resizeMode="cover"
    >
      {/* Cinematic dark overlay to guarantee contrast & readability */}
      <View
        style={[
          styles.overlay,
          { backgroundColor: `rgba(8, 11, 16, ${overlayOpacity})` },
        ]}
      />
      {/* Subtle top/bottom radial gradient approximation for depth */}
      <View style={styles.topVignette} pointerEvents="none" />
      <View style={styles.bottomVignette} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(8, 11, 16, 0.45)',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(8, 11, 16, 0.65)',
  },
});

export default AuthBackground;
