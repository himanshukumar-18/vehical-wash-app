import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Carousel } from 'react-native-reanimated-carousel';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import { AppText, AppButton } from '@/components';

/**
 * Promotional slides data.
 * You can provide any local image (e.g. require('@/assets/images/banner1.jpg'))
 * or remote URL in the `image` field.
 */
export const CAROUSEL_SLIDES = [
  {
    id: 'doorstep-wash',
    badge: 'DOORSTEP CAR CARE',
    badgeIcon: Sparkles,
    title: 'Premium Wash At Your Doorstep',
    description: 'Eco-friendly high-pressure wash, snow foam & detailing in Hazaribagh.',
    cta: 'Book Doorstep Wash',
    // Replace with your custom image: require('@/assets/images/slide1.jpg') or URL
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop&q=80',
    fallbackBg: Colors.deepNavy,
  },
  {
    id: 'interior-detailing',
    badge: 'ADVANCED SHAMPOO & FOAM',
    badgeIcon: ShieldCheck,
    title: 'Deep Interior & Exterior Detailing',
    description: 'Thick snow foam soak, vacuuming, dashboard polish & odor neutralizer.',
    cta: 'Explore Packages',
    // Replace with your custom image: require('@/assets/images/slide2.jpg') or URL
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80',
    fallbackBg: '#0F1A26',
  },
  {
    id: 'instant-booking',
    badge: 'FAST DISPATCH & OTP',
    badgeIcon: Zap,
    title: 'Seamless WhatsApp Booking',
    description: '1-tap doorstep dispatch with verified technician arrival security code.',
    cta: 'Schedule Today',
    // Replace with your custom image: require('@/assets/images/slide3.jpg') or URL
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80',
    fallbackBg: '#131F2D',
  },
];

export default function HomeHeroCarousel({ slides = CAROUSEL_SLIDES, onBookPress }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  // Card width fits screen padding (16px on each side)
  const cardWidth = Math.min(width - 32, 520);
  const cardHeight = 170;

  return (
    <View style={styles.container}>
      <Carousel
        loop
        autoplay
        autoplayInterval={4500}
        data={slides}
        onSnapToItem={(index) => setActiveIndex(index)}
        style={{ width: cardWidth, height: cardHeight, borderRadius: Radius.lg }}
        renderItem={({ item }) => {
          const BadgeIcon = item.badgeIcon || Sparkles;
          const imageSource = typeof item.image === 'string' ? { uri: item.image } : item.image;

          return (
            <View style={[styles.slideCard, { backgroundColor: item.fallbackBg || Colors.deepNavy }]}>
              {/* Background Image */}
              {item.image && (
                <Image
                  source={imageSource}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  transition={250}
                />
              )}

              {/* Dark Gradient Overlay for Contrast & Readability */}
              <View style={styles.overlay} />

              {/* Foreground Content */}
              <View style={styles.contentContainer}>
                {/* Top Badge */}
                <View style={styles.badgeRow}>
                  <BadgeIcon size={11} color={Colors.cyanBlue} />
                  <AppText variant="overline" color={Colors.cyanBlue} style={styles.badgeText}>
                    {item.badge}
                  </AppText>
                </View>

                {/* Title & Description */}
                <View style={styles.textContent}>
                  <AppText
                    variant="h3"
                    weight="bold"
                    color={Colors.white}
                    style={styles.slideTitle}
                    numberOfLines={2}
                  >
                    {item.title}
                  </AppText>
                  <AppText
                    variant="caption"
                    color={Colors.textSecondary}
                    style={styles.slideDesc}
                    numberOfLines={2}
                  >
                    {item.description}
                  </AppText>
                </View>

                {/* CTA Button */}
                <AppButton
                  variant="primary"
                  size="sm"
                  onPress={onBookPress}
                  rightIcon={<ArrowRight size={13} color={Colors.primaryBlack} />}
                  style={styles.ctaButton}
                >
                  {item.cta || 'Book Now'}
                </AppButton>
              </View>
            </View>
          );
        }}
      />

      {/* Pagination Indicators */}
      <View style={styles.paginationRow}>
        {slides.map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  slideCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 11, 16, 0.78)',
  },
  contentContainer: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 1.1,
  },
  textContent: {
    gap: 2,
    marginVertical: 2,
  },
  slideTitle: {
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  slideDesc: {
    lineHeight: 16,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 2,
  },
  dot: {
    height: 4,
    borderRadius: Radius.full,
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.cyanBlue,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: Colors.border,
  },
});
