import React, { useRef, useCallback } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';

import { Colors, Radius, Spacing, FontSize, FontFamily } from '@/theme';

/**
 * OtpInput — 6-digit segmented OTP input with Poppins typography.
 *
 * - Each digit is a separate TextInput box.
 * - Auto-advances focus to next box on digit entry.
 * - Backspace moves focus to previous box.
 * - Supports paste of a 6-digit string into the first box.
 *
 * @param {string} value — current 6-char OTP string
 * @param {Function} onChange — called with new 6-char string on every change
 * @param {boolean} hasError — shows error border styling
 * @param {boolean} disabled
 */
const OTP_LENGTH = 6;

const OtpInput = ({ value = '', onChange, hasError = false, disabled = false }) => {
  const inputRefs = useRef([]);

  // Convert value string to array of single chars padded with ''
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '');

  const focusIndex = (index) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
  };

  const handleChange = useCallback(
    (text, index) => {
      // Handle paste — if user pastes 6+ digits into any box
      const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (cleaned.length > 1) {
        const newValue = cleaned.slice(0, OTP_LENGTH).padEnd(OTP_LENGTH, '');
        onChange?.(newValue);
        // Focus the last filled box or last box
        const nextIndex = Math.min(cleaned.length, OTP_LENGTH - 1);
        focusIndex(nextIndex);
        return;
      }

      // Single character entry
      const digit = cleaned.slice(-1); // take last char (handle Android quirks)
      const arr = digits.slice();
      arr[index] = digit;
      const newValue = arr.join('');
      onChange?.(newValue);

      if (digit && index < OTP_LENGTH - 1) {
        focusIndex(index + 1);
      }
    },
    [digits, onChange],
  );

  const handleKeyPress = useCallback(
    ({ nativeEvent }, index) => {
      if (nativeEvent.key === 'Backspace') {
        if (digits[index]) {
          // Clear current box
          const arr = digits.slice();
          arr[index] = '';
          onChange?.(arr.join(''));
        } else if (index > 0) {
          // Move to previous box and clear it
          const arr = digits.slice();
          arr[index - 1] = '';
          onChange?.(arr.join(''));
          focusIndex(index - 1);
        }
      }
    },
    [digits, onChange],
  );

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.box,
            digit && styles.boxFilled,
            hasError && styles.boxError,
            disabled && styles.boxDisabled,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH} // allow paste of full OTP in first box
          selectTextOnFocus
          editable={!disabled}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          importantForAutofill="yes"
          accessibilityLabel={`OTP digit ${index + 1} of ${OTP_LENGTH}`}
          caretHidden={Platform.OS === 'ios'}
          selectionColor={Colors.cyanBlue}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  box: {
    width: 46,
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.white,
  },
  boxFilled: {
    borderColor: Colors.cyanBlue,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
  },
  boxError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
  },
  boxDisabled: {
    opacity: 0.5,
  },
});

export default OtpInput;
