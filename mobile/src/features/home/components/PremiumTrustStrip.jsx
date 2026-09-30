import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapPin, CalendarCheck, ShieldCheck } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import { AppText } from '@/components';

/**
 * PremiumTrustStrip
 *
 * Compact horizontal trust & value strip displaying 3 core guarantees:
 * - Doorstep Service
 * - Easy Booking
 * - Professional Care
 */
export default function PremiumTrustStrip() {
  const trustPoints = [
    {
      icon: MapPin,
      title: 'Doorstep Service',
      subtitle: 'At your location',
    },
    {
      icon: CalendarCheck,
      title: 'Easy Booking',
      subtitle: 'Fast 1-tap slots',
    },
    {
      icon: ShieldCheck,
      title: 'Professional Care',
      subtitle: 'Trained specialists',
    },
  ];

  return (
    <View style={styles.container}>
      {trustPoints.map((item, index) => {
        const IconComponent = item.icon;
        const isLast = index === trustPoints.length - 1;

        return (
          <React.Fragment key={item.title}>
            <View style={styles.trustItem}>
              <View style={styles.iconCircle}>
                <IconComponent size={14} color={Colors.cyanBlue} strokeWidth={2} />
              </View>

              <View style={styles.textCol}>
                <AppText
                  variant="caption"
                  weight="bold"
                  color={Colors.textPrimary}
                  numberOfLines={1}
                  style={styles.itemTitle}
                >
                  {item.title}
                </AppText>
                <AppText
                  variant="caption"
                  color={Colors.textMuted}
                  numberOfLines={1}
                  style={styles.itemSub}
                >
                  {item.subtitle}
                </AppText>
              </View>
            </View>

            {!isLast && <View style={styles.divider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  trustItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flexShrink: 1,
    gap: 1,
  },
  itemTitle: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  itemSub: {
    fontSize: 9,
    lineHeight: 12,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
});
