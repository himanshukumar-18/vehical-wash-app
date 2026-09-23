import React from 'react';
import { View } from 'react-native';

import { Colors, Spacing } from '@/theme';

/**
 * AppDivider — horizontal or vertical separator line.
 *
 * @param {'horizontal'|'vertical'} orientation
 * @param {string} color
 * @param {number} thickness
 * @param {number} margin — margin on the main axis
 */
const AppDivider = ({
  orientation = 'horizontal',
  color = Colors.divider,
  thickness = 1,
  margin = Spacing.lg,
  style,
}) => {
  if (orientation === 'vertical') {
    return (
      <View
        style={[
          {
            width: thickness,
            backgroundColor: color,
            marginHorizontal: margin,
            alignSelf: 'stretch',
          },
          style,
        ]}
      />
    );
  }
  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: color,
          marginVertical: margin,
          alignSelf: 'stretch',
        },
        style,
      ]}
    />
  );
};

export default AppDivider;
