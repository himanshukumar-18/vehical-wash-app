import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import { Colors, Spacing, Radius, FontSize, FontFamily } from '@/theme';
import AppText from './AppText';

/**
 * AppInput — labeled, accessible text input with explicit Poppins typography.
 *
 * @param {string} label
 * @param {string} placeholder
 * @param {string} value
 * @param {Function} onChangeText
 * @param {string} error — error message text
 * @param {string} helper — helper text (shown below input)
 * @param {boolean} secureTextEntry
 * @param {boolean} disabled
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {string} labelColor
 * @param {object} style — outer wrapper style
 * @param {object} inputContainerStyle — input box container style
 * @param {object} inputStyle — TextInput style
 */
const AppInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helper,
  secureTextEntry = false,
  disabled = false,
  leftIcon,
  rightIcon,
  labelColor = Colors.textSecondary,
  style,
  inputContainerStyle,
  inputStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? Colors.error
    : isFocused
    ? Colors.cyanBlue
    : Colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <AppText variant="label" color={labelColor} style={styles.label}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor },
          isFocused && styles.inputFocused,
          inputContainerStyle,
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : null,
            rightIcon ? styles.inputWithRight : null,
            inputStyle,
          ]}
          accessibilityLabel={label || placeholder}
          accessibilityState={{ disabled }}
          {...rest}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error ? (
        <AppText variant="caption" color={Colors.error} style={styles.helperText}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color={Colors.textMuted} style={styles.helperText}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  label: {
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceDark,
    minHeight: 46,
    paddingHorizontal: Spacing.md,
  },
  inputFocused: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.cyanBlue,
  },
  inputDisabled: {
    backgroundColor: Colors.primaryBlack,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  inputWithLeft: {
    marginLeft: Spacing.xs,
  },
  inputWithRight: {
    marginRight: Spacing.xs,
  },
  iconLeft: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 2,
    fontSize: FontSize.xs,
  },
});

export default AppInput;
