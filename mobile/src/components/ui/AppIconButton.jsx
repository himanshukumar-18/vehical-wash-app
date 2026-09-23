import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Radius } from '@/theme';

/**
 * AppIconButton — icon-only pressable with accessibility.
 *
 * @param {React.ReactNode} icon
 * @param {'sm'|'md'|'lg'} size
 * @param {'default'|'filled'|'ghost'} variant
 * @param {string} accessibilityLabel — required for screen readers
 * @param {Function} onPress
 */

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const sizes = {
  sm: 32,
  md: 40,
  lg: 48,
};

const AppIconButton = ({
  icon,
  size = 'md',
  variant = 'default',
  accessibilityLabel,
  onPress,
  disabled = false,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dim = sizes[size] || sizes.md;

  const bgColor =
    variant === 'filled'
      ? Colors.cyanBlue
      : variant === 'ghost'
      ? 'transparent'
      : Colors.surfaceCard;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: Radius.full,
          backgroundColor: bgColor,
        },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      {icon}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default AppIconButton;
