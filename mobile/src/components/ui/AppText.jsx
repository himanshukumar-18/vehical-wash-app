import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Colors, TextVariants, FontFamily } from '@/theme';

/**
 * AppText — base typography component strictly using Poppins.
 *
 * @param {'display'|'h1'|'h2'|'h3'|'h4'|'body'|'bodyMedium'|'bodySmall'|'caption'|'label'|'overline'|'code'} variant
 * @param {string} color — any Colors.* value
 * @param {'regular'|'medium'|'semiBold'|'bold'|'extraBold'} weight — override font weight family
 * @param {boolean} center — center align text
 * @param {object} style — additional styles
 */
const AppText = ({
  variant = 'body',
  color,
  weight,
  center = false,
  children,
  style,
  ...rest
}) => {
  const variantStyle = TextVariants[variant] || TextVariants.body;
  const colorValue = color || Colors.textPrimary;
  const fontFamilyValue = weight && FontFamily[weight] ? { fontFamily: FontFamily[weight] } : {};

  return (
    <Text
      style={[
        variantStyle,
        { color: colorValue },
        fontFamilyValue,
        center && styles.center,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});

export default AppText;
