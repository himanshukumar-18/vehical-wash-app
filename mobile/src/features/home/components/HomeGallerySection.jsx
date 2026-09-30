import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Sparkles, Camera, X, MapPin } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import { AppText } from '@/components';
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../data/galleryData';

/**
 * HomeGallerySection
 *
 * Premium photo gallery showcasing real car wash, detailing,
 * and doorstep wash moments.
 *
 * Placed immediately below Wash Packages on the Home Screen.
 *
 * Supports:
 * - Category filter tabs (All, Foam Wash, Exterior, Detailing, Shine)
 * - 2-Column responsive photo card grid (natively scrolls with Home ScrollView)
 * - Interactive full-screen image preview modal
 * - Easy future expansion via galleryData.js
 */
export default function HomeGallerySection({ items = GALLERY_ITEMS }) {
  const { width } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = React.useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((it) => it.category === activeCategory);
  }, [items, activeCategory]);

  const cardWidth = (width - Spacing.lg * 2 - Spacing.sm) / 2;

  return (
    <View style={styles.sectionContainer}>
      {/* 1. Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.headerIconCircle}>
            <Camera size={15} color={Colors.cyanBlue} />
          </View>
          <View>
            <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
              Real Wash Moments
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} style={styles.subtitle}>
              Every detail. Every shine.
            </AppText>
          </View>
        </View>

        <View style={styles.countBadge}>
          <Sparkles size={11} color={Colors.cyanBlue} />
          <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
            {filteredItems.length} {filteredItems.length === 1 ? 'Photo' : 'Photos'}
          </AppText>
        </View>
      </View>

      {/* 2. Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {GALLERY_CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
              style={[
                styles.categoryPill,
                isActive && styles.categoryPillActive,
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <AppText
                variant="caption"
                weight={isActive ? 'bold' : 'medium'}
                color={isActive ? Colors.cyanBlue : Colors.textSecondary}
                style={styles.categoryPillText}
              >
                {cat}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. 2-Column Responsive Photo Grid */}
      <View style={styles.gridContainer}>
        {filteredItems.map((item) => {
          const imageSource = typeof item.image === 'string' ? { uri: item.image } : item.image;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.photoCard, { width: cardWidth }]}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.88}
              accessibilityLabel={`View ${item.title}`}
              accessibilityRole="button"
            >
              {/* Image with Tag Overlay */}
              <View style={styles.imageWrapper}>
                <Image
                  source={imageSource}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.categoryTag}>
                  <AppText variant="overline" color={Colors.cyanBlue} style={styles.categoryTagText}>
                    {item.tag || item.category}
                  </AppText>
                </View>
              </View>

              {/* Card Meta */}
              <View style={styles.cardMeta}>
                <AppText
                  variant="bodySmall"
                  weight="bold"
                  color={Colors.textPrimary}
                  numberOfLines={1}
                  style={styles.cardTitle}
                >
                  {item.title}
                </AppText>

                {item.location ? (
                  <View style={styles.locationRow}>
                    <MapPin size={10} color={Colors.textMuted} />
                    <AppText
                      variant="caption"
                      color={Colors.textMuted}
                      numberOfLines={1}
                      style={styles.cardLocation}
                    >
                      {item.location}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Fullscreen Interactive Image Preview Modal */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderBadge}>
                <Sparkles size={12} color={Colors.cyanBlue} />
                <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 11 }}>
                  {selectedItem?.category?.toUpperCase()}
                </AppText>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedItem(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close photo preview"
                accessibilityRole="button"
              >
                <X size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Modal Image */}
            {selectedItem && (
              <View style={styles.modalImageContainer}>
                <Image
                  source={
                    typeof selectedItem.image === 'string'
                      ? { uri: selectedItem.image }
                      : selectedItem.image
                  }
                  style={styles.modalImage}
                  contentFit="contain"
                  transition={250}
                />
              </View>
            )}

            {/* Modal Details Footer */}
            {selectedItem && (
              <View style={styles.modalFooter}>
                <AppText variant="h3" weight="bold" color={Colors.textPrimary}>
                  {selectedItem.title}
                </AppText>

                {selectedItem.description && (
                  <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.modalDesc}>
                    {selectedItem.description}
                  </AppText>
                )}

                {selectedItem.location && (
                  <View style={styles.modalLocationRow}>
                    <MapPin size={12} color={Colors.cyanBlue} />
                    <AppText variant="caption" color={Colors.textMuted}>
                      {selectedItem.location} • The Black Wash Quality
                    </AppText>
                  </View>
                )}
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
  headerIconCircle: {
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
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryScroll: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    borderColor: Colors.cyanBlue,
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
  },
  categoryPillText: {
    fontSize: 11,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  photoCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imageWrapper: {
    height: 125,
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(8, 11, 16, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryTagText: {
    fontSize: 8.5,
    letterSpacing: 0.8,
  },
  cardMeta: {
    padding: Spacing.sm,
    gap: 2,
  },
  cardTitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  cardLocation: {
    fontSize: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 11, 16, 0.95)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  modalHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.30)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    flex: 1,
    marginVertical: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalFooter: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  modalDesc: {
    lineHeight: 18,
    marginTop: 2,
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
});
