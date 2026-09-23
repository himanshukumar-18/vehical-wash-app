import { Platform } from 'react-native';

/**
 * The Black Wash — Typography Scale with Poppins
 *
 * Balanced for real compact iPhone screens with clear hierarchy.
 */

export const FontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
};

export const FontSize = {
  /** 10px */ xxs: 10,
  /** 11px */ xs: 11,
  /** 12px */ sm: 12,
  /** 13px */ md: 13,
  /** 14px */ lg: 14,
  /** 16px */ xl: 16,
  /** 18px */ '2xl': 18,
  /** 20px */ '3xl': 20,
  /** 22px */ '4xl': 22,
  /** 24px */ '5xl': 24,
  /** 28px */ '6xl': 28,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const LineHeight = {
  tight: 1.25,
  normal: 1.45,
  relaxed: 1.6,
};

export const TextVariants = {
  display: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['6xl'],
    lineHeight: FontSize['6xl'] * 1.2,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['5xl'],
    lineHeight: FontSize['5xl'] * 1.25,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    lineHeight: FontSize['4xl'] * 1.25,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'] * 1.3,
  },
  h4: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'] * 1.35,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * 1.45,
  },
  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * 1.45,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.45,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
    letterSpacing: 0.2,
  },
  overline: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.4,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
};

export default { FontFamily, FontSize, FontWeight, LineHeight, TextVariants };
