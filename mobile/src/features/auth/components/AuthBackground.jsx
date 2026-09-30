import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { Colors } from '@/theme';

// Custom background provided for The Black Wash authentication experience
const AUTH_BG_IMAGE = require('@/assets/images/login-register.png');

/**
 * AuthBackground
 *
 * Full-screen wrapper using the authentic "The Black Wash" vehicle branding background.
 * Applies a smooth, multi-stop SVG linear gradient overlay to ensure seamless transitions,
 * crystal clear text contrast, and no harsh visual cutoffs.
 *
 * @param {React.ReactNode} children
 * @param {object} style - optional container style
 */
const AuthBackground = ({
  children,
  style,
}) => {
  return (
    <ImageBackground
      source={AUTH_BG_IMAGE}
      style={[styles.background, style]}
      resizeMode="cover"
    >
      {/* Seamless Full-Screen Multi-Stop Linear Gradient Scrim */}
      <Svg
        height="100%"
        width="100%"
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="authBgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#080B10" stopOpacity="0.75" />
            <Stop offset="25%" stopColor="#080B10" stopOpacity="0.40" />
            <Stop offset="55%" stopColor="#080B10" stopOpacity="0.75" />
            <Stop offset="80%" stopColor="#080B10" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#080B10" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#authBgGradient)" />
      </Svg>
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
});

export default AuthBackground;
