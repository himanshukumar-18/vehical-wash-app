import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export { SCREEN_WIDTH, SCREEN_HEIGHT };

/** True if device has a small screen (e.g. iPhone SE) */
export const IS_SMALL_DEVICE = SCREEN_WIDTH < 380;

/** True if running on iOS */
export const IS_IOS = Platform.OS === 'ios';

/** True if running on Android */
export const IS_ANDROID = Platform.OS === 'android';

/** Standard hit slop for touchable elements */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/** Bottom tab bar height (approximate, before safe area inset) */
export const TAB_BAR_HEIGHT = IS_IOS ? 83 : 60;

/** Horizontal screen padding */
export const SCREEN_PADDING_H = 20;
