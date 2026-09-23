import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Spacing, Layout } from '@/theme';

/**
 * AppScreen — full-screen layout wrapper for Dark Theme.
 *
 * @param {boolean} scrollable — wrap content in ScrollView
 * @param {boolean} padded — apply horizontal screen padding
 * @param {string} backgroundColor
 * @param {'light'|'dark'|'auto'} statusBar
 * @param {React.ReactNode} header — sticky header above scroll area
 * @param {React.ReactNode} footer — sticky footer below scroll area
 * @param {boolean} avoidKeyboard — wrap in KeyboardAvoidingView
 */
const AppScreen = ({
  scrollable = false,
  padded = true,
  backgroundColor = Colors.background,
  statusBar = 'light',
  header,
  footer,
  avoidKeyboard = false,
  children,
  style,
  contentStyle,
  ...rest
}) => {
  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        padded && styles.padded,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        padded && styles.padded,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const inner = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {header}
      {content}
      {footer}
    </KeyboardAvoidingView>
  ) : (
    <>
      {header}
      {content}
      {footer}
    </>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor }, style]}
      edges={['top', 'left', 'right']}
      {...rest}
    >
      <StatusBar style={statusBar} />
      {inner}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['5xl'],
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Layout.screenPadding,
  },
});

export default AppScreen;
