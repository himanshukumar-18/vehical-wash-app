/**
 * The Black Wash — Mandatory Premium Dark Brand Color Palette
 * All colors are defined here. Never hardcode colors in components.
 */

export const Colors = {
  // Core Brand Backgrounds
  primaryBlack: '#080B10',       // Primary background
  deepNavy: '#101923',           // Secondary background
  surfaceDark: '#101923',        // Dark surface container
  surfaceCard: '#121C27',        // Card background
  surfaceElevated: '#182431',    // Elevated surface (modals, dropdowns)
  surfaceLight: '#182431',       // Remapped to dark elevated for safety
  background: '#080B10',         // App background default

  // Brand Accents
  cyanBlue: '#00CFFF',           // Primary brand accent
  electricBlue: '#168BFF',       // Secondary accent
  accentGlow: 'rgba(0, 207, 255, 0.20)',

  // Typography & Text
  textPrimary: '#F5F7FA',        // High-contrast primary text
  textSecondary: '#A7B2C0',      // Muted secondary text
  textMuted: '#788594',          // Subtle label / helper text
  textDisabled: '#4B5565',       // Disabled text
  textInverse: '#080B10',        // Text on bright cyan button
  textOnDark: '#F5F7FA',         // Direct white on dark scrims

  // Borders & Dividers
  border: '#263442',             // Standard surface border
  borderDark: '#1E2D3D',         // Subtle container border
  borderLight: '#334454',        // Highlighted border
  divider: '#1E2B38',            // Divider lines

  // Status & Feedback
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#00CFFF',
  infoLight: 'rgba(0, 207, 255, 0.15)',

  // Overlays & Glassmorphism
  overlayDark: 'rgba(8, 11, 16, 0.75)',
  overlayLight: 'rgba(255, 255, 255, 0.08)',
  glassBg: 'rgba(18, 28, 39, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  dockBg: 'rgba(16, 25, 35, 0.92)',
  dockBorder: 'rgba(255, 255, 255, 0.10)',

  // Primitives
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

export default Colors;
