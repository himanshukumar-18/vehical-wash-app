import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Sparkles, ArrowRight } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import { AppText } from '@/components';
import { BEFORE_AFTER_ITEMS } from '../data/beforeAfterData';

/**
 * BeforeAfterSection
 *
 * Premium automotive Before → After comparison showcase.
 * Displays side-by-side transformation proof of professional car wash results.
 */
export default function BeforeAfterSection({ items = BEFORE_AFTER_ITEMS }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const currentItem = items[activeIndex] || items[0];

  const beforeSource =
    typeof currentItem.beforeImage === 'string'
      ? { uri: currentItem.beforeImage }
      : currentItem.beforeImage;

  const afterSource =
    typeof currentItem.afterImage === 'string'
      ? { uri: currentItem.afterImage }
      : currentItem.afterImage;

  return (
    <View style={styles.sectionContainer}>
      {/* 1. Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionHeaderIconCircle}>
            <Sparkles size={15} color={Colors.cyanBlue} />
          </View>
          <View>
            <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
              REAL RESULTS
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} style={styles.subtitle}>
              See the difference professional care makes.
            </AppText>
          </View>
        </View>

        {items.length > 1 && (
          <View style={styles.pillPagination}>
            {items.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveIndex(idx)}
                  style={[
                    styles.paginationDot,
                    isActive && styles.paginationDotActive,
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  accessibilityLabel={`Transformation ${idx + 1}`}
                  accessibilityRole="button"
                />
              );
            })}
          </View>
        )}
      </View>

      {/* 2. Before → After Comparison Card */}
      <View style={styles.comparisonCard}>
        {/* Split Images Container */}
        <View style={styles.imagesSplitRow}>
          {/* Left: BEFORE */}
          <View style={styles.imageHalf}>
            <Image
              source={beforeSource}
              style={styles.splitImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.beforeOverlay} />
            <View style={styles.beforePill}>
              <AppText variant="overline" color="#F87171" style={styles.pillText}>
                BEFORE
              </AppText>
            </View>
          </View>

          {/* Center Transformation Indicator */}
          <View style={styles.centerDividerLine}>
            <View style={styles.arrowBadgeCircle}>
              <ArrowRight size={11} color={Colors.primaryBlack} strokeWidth={2.6} />
            </View>
          </View>

          {/* Right: AFTER */}
          <View style={styles.imageHalf}>
            <Image
              source={afterSource}
              style={styles.splitImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.afterOverlay} />
            <View style={styles.afterPill}>
              <AppText variant="overline" color={Colors.cyanBlue} style={styles.pillText}>
                AFTER
              </AppText>
            </View>
          </View>
        </View>

        {/* Card Details Bottom */}
        <View style={styles.cardDetails}>
          <View style={styles.tagRow}>
            <View style={styles.categoryBadge}>
              <AppText variant="overline" color={Colors.cyanBlue} style={styles.categoryBadgeText}>
                {currentItem.tag || currentItem.category}
              </AppText>
            </View>
          </View>

          <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary} style={styles.titleText}>
            {currentItem.title}
          </AppText>

          {currentItem.description ? (
            <AppText variant="caption" color={Colors.textSecondary} style={styles.descText}>
              {currentItem.description}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionHeaderIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 1,
    fontSize: 11,
  },
  pillPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  paginationDotActive: {
    width: 16,
    backgroundColor: Colors.cyanBlue,
  },
  comparisonCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imagesSplitRow: {
    flexDirection: 'row',
    height: 155,
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  imageHalf: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  splitImage: {
    width: '100%',
    height: '100%',
  },
  beforeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 11, 16, 0.25)',
  },
  afterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 207, 255, 0.04)',
  },
  beforePill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(8, 11, 16, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  afterPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(8, 11, 16, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.40)',
  },
  pillText: {
    fontSize: 8.5,
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  centerDividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: 'rgba(0, 207, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  arrowBadgeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  cardDetails: {
    padding: Spacing.md,
    gap: 3,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
  },
  categoryBadgeText: {
    fontSize: 8.5,
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  descText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 1,
  },
});
