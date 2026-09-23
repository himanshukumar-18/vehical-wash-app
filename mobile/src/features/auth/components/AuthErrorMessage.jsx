import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import AppText from '@/components/ui/AppText';

/**
 * AuthErrorMessage
 *
 * Polished feedback banner for API errors, validation notices, or warning alerts.
 * Supports an optional retry action if the error is network-related.
 *
 * @param {string} message — error message to display
 * @param {'error'|'warning'|'success'} type
 * @param {Function} onRetry — optional callback if retryable
 * @param {object} style
 */
const AuthErrorMessage = ({
  message,
  type = 'error',
  onRetry,
  style,
}) => {
  if (!message) return null;

  const isWarning = type === 'warning';
  const isSuccess = type === 'success';

  const bgColor = isSuccess
    ? 'rgba(22, 163, 74, 0.12)'
    : isWarning
    ? 'rgba(217, 119, 6, 0.12)'
    : 'rgba(220, 38, 38, 0.12)';

  const borderColor = isSuccess
    ? 'rgba(22, 163, 74, 0.35)'
    : isWarning
    ? 'rgba(217, 119, 6, 0.35)'
    : 'rgba(220, 38, 38, 0.35)';

  const textColor = isSuccess
    ? Colors.success
    : isWarning
    ? Colors.warning
    : Colors.error;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }, style]}>
      <View style={styles.iconWrapper}>
        <AlertCircle size={18} color={textColor} strokeWidth={2} />
      </View>
      <View style={styles.content}>
        <AppText variant="bodySmall" color={textColor} style={styles.text}>
          {message}
        </AppText>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry request"
          >
            <RefreshCw size={12} color={Colors.cyanBlue} />
            <AppText variant="caption" color={Colors.cyanBlue} weight="semiBold">
              Retry
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  iconWrapper: {
    paddingTop: 1,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  text: {
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
});

export default AuthErrorMessage;
