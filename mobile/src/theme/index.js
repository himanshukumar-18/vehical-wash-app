/**
 * The Black Wash — Design System Theme
 * Single import point for all design tokens.
 *
 * Usage:
 *   import { Colors, Spacing, Radius, Shadows, TextVariants } from '@/theme';
 */

export { Colors, default as ColorsDefault } from './colors';
export { Spacing, HIT_SLOP } from './spacing';
export {
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  TextVariants,
} from './typography';
export { Radius } from './radius';
export { Shadows, createShadow } from './shadows';

/** Convenience layout constants */
export const Layout = {
  /** Maximum content width for tablet support */
  maxContentWidth: 560,
  /** Screen padding (horizontal) */
  screenPadding: 20,
};
