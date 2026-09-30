import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Clock,
  Car,
  Sparkles,
  ShieldCheck,
  Droplets,
  MessageCircle,
  ArrowRight,
  Plus,
  Phone,
  Search,
  X,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import { getUserInitials } from '@/utils';
import {
  AppText,
  AppButton,
  AppCard,
  AppLoader,
} from '@/components';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetVehiclesQuery } from '@/features/vehicles/vehiclesApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentUser, selectAuthLoading } from '@/features/auth/authSlice';
import { openWhatsApp, directCall, BUSINESS_CONTACT } from '@/constants/contact';
import { IS_DEV_HOME_PREVIEW } from '@/constants/devPreview';
import { FALLBACK_SERVICES } from '@/constants/services';
import AddVehicleModal from '@/features/vehicles/components/AddVehicleModal';
import HomeHeroCarousel from '@/features/home/components/HomeHeroCarousel';
import HomeGallerySection from '@/features/home/components/HomeGallerySection';
import BeforeAfterSection from '@/features/home/components/BeforeAfterSection';
import PremiumTrustStrip from '@/features/home/components/PremiumTrustStrip';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const { width } = useWindowDimensions();

  const {
    data: services,
    isLoading: isServicesLoading,
    isError: isServicesError,
    refetch: refetchServices,
    isFetching: isServicesFetching,
  } = useGetServicesQuery();

  const {
    data: vehicles,
    refetch: refetchVehicles,
    isFetching: isVehiclesFetching,
  } = useGetVehiclesQuery(undefined, { skip: !user });

  const [isAddVehicleOpen, setIsAddVehicleOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const displayServices =
    services && services.length > 0 ? services : FALLBACK_SERVICES;

  // Filter actual services based on user search query
  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return displayServices;
    const q = searchQuery.toLowerCase().trim();
    return displayServices.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.short_description?.toLowerCase().includes(q)
    );
  }, [displayServices, searchQuery]);

  const defaultVehicle =
    vehicles?.find((v) => v.is_default) || (vehicles?.length ? vehicles[0] : null);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Dynamic initials (e.g. "HK" for Himanshu Kumar, "RS" for Rahul Sharma, "U" for unauthenticated)
  const initials = getUserInitials(user?.fullname || user?.name || user?.username);

  // Coordinated entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-12);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(16);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) });
    contentOpacity.value = withDelay(150, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    contentTranslateY.value = withDelay(150, withSpring(0, { damping: 14, stiffness: 200 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const onRefresh = React.useCallback(() => {
    refetchServices();
    if (user) {
      refetchVehicles();
    }
  }, [refetchServices, refetchVehicles, user]);

  const handleOpenAddVehicle = () => {
    if (!user && IS_DEV_HOME_PREVIEW) {
      router.push('/(auth)/login');
      return;
    }
    setIsAddVehicleOpen(true);
  };

  const handleBookService = (serviceId) => {
    router.push({
      pathname: '/booking',
      params: serviceId ? { serviceId: String(serviceId) } : {},
    });
  };

  const handleOpenWhatsAppChat = () => {
    const msg = `Hi ${BUSINESS_CONTACT.name}, I would like to inquire about your doorstep car wash services in Hazaribagh.`;
    openWhatsApp(msg);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Dev Preview Mode Banner */}
      {IS_DEV_HOME_PREVIEW && !user && (
        <View style={styles.devPreviewBanner}>
          <View style={styles.devPreviewBannerLeft}>
            <AppText variant="caption" weight="bold" color={Colors.warning}>
              🛠️ DEV PREVIEW MODE
            </AppText>
            <AppText variant="caption" color={Colors.textMuted} style={styles.devBannerSub}>
              Home UI Preview (Unauthenticated)
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.devSignInBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption" weight="bold" color={Colors.cyanBlue}>
              Sign In →
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Redesigned Premium Dark Automotive Header */}
      <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
        {/* Subtle Automotive Wave Watermark in Background matching Me header */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Svg width={width} height="150" viewBox="0 0 375 150" fill="none">
            <Path
              d="M-20 75 C 80 18, 180 140, 300 50 C 360 8, 400 38, 420 55"
              stroke={Colors.cyanBlue}
              strokeWidth="2.5"
              strokeOpacity="0.07"
            />
            <Path
              d="M-10 100 C 90 40, 190 150, 310 75 C 370 28, 410 60, 430 78"
              stroke={Colors.electricBlue}
              strokeWidth="1.5"
              strokeOpacity="0.05"
            />
          </Svg>
        </View>

        {/* A. Top Greeting & Action Icons Row */}
        <View style={styles.topGreetingRow}>
          {/* User Initials Avatar Circle — dynamic e.g. "HK" for Himanshu Kumar */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/me')}
            style={styles.headerAvatarCircle}
            activeOpacity={0.8}
            accessibilityLabel="View Profile"
            accessibilityRole="button"
          >
            {isAuthLoading ? (
              <View style={styles.headerAvatarSkeleton} />
            ) : (
              <AppText variant="bodySmall" weight="bold" color="#F5F7FA" style={styles.headerAvatarText}>
                {initials}
              </AppText>
            )}
          </TouchableOpacity>

          <View style={styles.greetingLeftCol}>
            <AppText variant="caption" color={Colors.textMuted} style={styles.greetingLabel}>
              {getGreeting()},{' '}
              <AppText variant="caption" weight="bold" color={Colors.textPrimary}>
                {user?.fullname ? user.fullname.split(' ')[0] : 'The Black Wash'}
              </AppText>
            </AppText>

            {/* Compact Location Chip */}
            <TouchableOpacity
              style={styles.locationChip}
              onPress={handleOpenWhatsAppChat}
              activeOpacity={0.8}
            >
              <MapPin size={10} color={Colors.cyanBlue} />
              <AppText variant="caption" weight="semiBold" color={Colors.textSecondary} style={styles.locationChipText}>
                Hazaribagh
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Right Action Icons: Notification Bell & Support Call */}
          <View style={styles.headerActionRow}>
            <TouchableOpacity
              style={styles.actionCircleBtn}
              onPress={() => directCall()}
              activeOpacity={0.75}
              accessibilityLabel="Call Support Hotline"
            >
              <Phone size={15} color={Colors.cyanBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* B. Bold, Prominent Main Headline */}
        <View style={styles.headlineWrapper}>
          <AppText variant="h2" weight="bold" color={Colors.textPrimary} style={styles.headlineTitle}>
            Your Car.{'\n'}
            <AppText variant="h2" weight="bold" color={Colors.cyanBlue} style={styles.headlineAccent}>
              Our Care.
            </AppText>
          </AppText>
        </View>

        {/* C. Premium Pill Search Bar */}
        <View style={[styles.searchPillContainer, isSearchFocused && styles.searchPillFocused]}>
          <View style={styles.searchIconCircle}>
            <Search size={14} color={isSearchFocused ? Colors.cyanBlue : Colors.textMuted} />
          </View>
          <TextInput
            style={styles.searchInputField}
            placeholder="Search car wash services..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={Colors.cyanBlue}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.searchClearButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={13} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isServicesFetching || isVehiclesFetching}
            onRefresh={onRefresh}
            tintColor={Colors.cyanBlue}
            colors={[Colors.cyanBlue]}
          />
        }
      >
        <Animated.View style={[styles.sectionsWrapper, animatedContentStyle]}>
          {/* Premium Animated Promotional Carousel */}
          <HomeHeroCarousel onBookPress={() => handleBookService()} />

        {/* Quick Action CTAs: Book a Wash + Call Now */}
        <View style={styles.quickActionRow}>
          <AppButton
            variant="primary"
            size="md"
            onPress={() => handleBookService()}
            leftIcon={<Sparkles size={15} color={Colors.primaryBlack} />}
            style={styles.bookCtaBtn}
          >
            Book Doorstep Wash
          </AppButton>

          <AppButton
            variant="dark"
            size="md"
            onPress={() => directCall()}
            leftIcon={<Phone size={14} color={Colors.cyanBlue} />}
            style={styles.callCtaBtn}
          >
            Call Now
          </AppButton>
        </View>

        {/* Garage Status Bar */}
        <View style={styles.garageSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionHeaderIconCircle}>
                <Car size={15} color={Colors.cyanBlue} />
              </View>
              <AppText variant="h4" weight="bold">
                Your Garage
              </AppText>
            </View>
            <TouchableOpacity
              onPress={handleOpenAddVehicle}
              style={styles.addVehicleBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={13} color={Colors.cyanBlue} />
              <AppText variant="caption" weight="bold" color={Colors.cyanBlue}>
                Add Vehicle
              </AppText>
            </TouchableOpacity>
          </View>

          {defaultVehicle ? (
            <AppCard variant="default" style={styles.vehicleCard}>
              <View style={styles.vehicleCardContent}>
                <View style={styles.vehicleIconBox}>
                  <AppText style={styles.vehicleEmoji}>🚗</AppText>
                </View>
                <View style={styles.vehicleDetails}>
                  <View style={styles.vehicleTitleRow}>
                    <AppText variant="body" weight="bold" color={Colors.textPrimary}>
                      {defaultVehicle.brand} {defaultVehicle.model}
                    </AppText>
                    {defaultVehicle.is_default && (
                      <View style={styles.defaultPill}>
                        <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
                          Default
                        </AppText>
                      </View>
                    )}
                  </View>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {defaultVehicle.registration_number} • {defaultVehicle.vehicle_type?.toUpperCase()}
                  </AppText>
                </View>
              </View>
            </AppCard>
          ) : (
            <TouchableOpacity
              onPress={handleOpenAddVehicle}
              activeOpacity={0.8}
            >
              <AppCard variant="outlined" style={styles.emptyVehicleCard}>
                <Plus size={18} color={Colors.cyanBlue} />
                <View style={styles.emptyVehicleText}>
                  <AppText variant="bodySmall" weight="semiBold" color={Colors.textPrimary}>
                    No vehicle registered yet
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    Tap to add your car for faster 1-tap bookings
                  </AppText>
                </View>
              </AppCard>
            </TouchableOpacity>
          )}
        </View>

        {/* Available Services Section */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionHeaderIconCircle}>
                <Droplets size={15} color={Colors.cyanBlue} />
              </View>
              <AppText variant="h4" weight="bold">
                {searchQuery.trim() ? 'Search Results' : 'Wash Packages'}
              </AppText>
            </View>
            <View style={styles.sectionHeaderRight}>
              {isServicesError && (
                <TouchableOpacity
                  onPress={refetchServices}
                  style={styles.retryChip}
                >
                  <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
                    ↻ Reconnect
                  </AppText>
                </TouchableOpacity>
              )}
              <AppText variant="caption" color={Colors.textSecondary}>
                {filteredServices.length} {filteredServices.length === 1 ? 'package' : 'packages'}
              </AppText>
            </View>
          </View>

          {isServicesLoading && !services?.length ? (
            <View style={styles.servicesLoaderBox}>
              <AppLoader size="small" text="Loading wash packages..." />
            </View>
          ) : filteredServices.length === 0 ? (
            <View style={styles.noSearchBox}>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                {`No wash packages found matching "${searchQuery}"`}
              </AppText>
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              >
                <AppText variant="caption" weight="bold" color={Colors.cyanBlue}>
                  Clear Search
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.servicesList}>
              {filteredServices.map((svc) => (
                <AppCard key={svc.id || svc.slug} variant="default" style={styles.serviceCard}>
                  {svc.image_url ? (
                    <Image
                      source={{ uri: svc.image_url }}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  ) : null}

                  <View style={styles.serviceCardBody}>
                    <View style={styles.serviceMetaRow}>
                      <View style={styles.durationPill}>
                        <Clock size={11} color={Colors.textMuted} />
                        <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 11 }}>
                          {svc.duration_minutes} mins
                        </AppText>
                      </View>
                      <AppText variant="h3" weight="bold" color={Colors.cyanBlue}>
                        ₹{Math.round(svc.price)}
                      </AppText>
                    </View>

                    <AppText variant="h4" weight="bold" color={Colors.textPrimary} style={styles.serviceName}>
                      {svc.name}
                    </AppText>

                    <AppText
                      variant="bodySmall"
                      color={Colors.textSecondary}
                      style={styles.serviceDesc}
                    >
                      {svc.short_description || svc.description}
                    </AppText>

                    <AppButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onPress={() => handleBookService(svc.id)}
                      rightIcon={<ArrowRight size={14} color={Colors.primaryBlack} />}
                      style={styles.serviceBookBtn}
                    >
                      Book This Service
                    </AppButton>
                  </View>
                </AppCard>
              ))}
            </View>
          )}
        </View>

        {/* Real Results: Before → After Transformation */}
        <BeforeAfterSection />

        {/* Premium Value & Trust Strip */}
        <PremiumTrustStrip />

        {/* The Black Wash Photo Gallery */}
        <HomeGallerySection />

        {/* Why Choose The Black Wash */}
        <View style={styles.featuresSection}>
          <AppText variant="h4" weight="bold" color={Colors.textPrimary} style={styles.featuresTitle}>
            Why The Black Wash?
          </AppText>

          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Droplets size={16} color={Colors.cyanBlue} />
              </View>
              <View style={styles.featureText}>
                <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                  High-Pressure Doorstep Wash
                </AppText>
                <AppText variant="caption" color={Colors.textSecondary}>
                  Professional equipment brought directly to your home or office.
                </AppText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <ShieldCheck size={16} color={Colors.cyanBlue} />
              </View>
              <View style={styles.featureText}>
                <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                  Verified Technicians
                </AppText>
                <AppText variant="caption" color={Colors.textSecondary}>
                  Secure arrival OTP verification and trained detailing specialists.
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* WhatsApp & Call Direct Support */}
        <TouchableOpacity
          onPress={handleOpenWhatsAppChat}
          activeOpacity={0.85}
          style={styles.whatsappCard}
        >
          <View style={styles.whatsappLeft}>
            <View style={styles.whatsappIconCircle}>
              <MessageCircle size={20} color={Colors.white} />
            </View>
            <View style={styles.whatsappInfo}>
              <AppText variant="bodySmall" weight="bold" color={Colors.white}>
                Questions? Chat on WhatsApp
              </AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.7)">
                Live support · 8 AM - 7 PM in Hazaribagh
              </AppText>
            </View>
          </View>
          <ArrowRight size={16} color={Colors.cyanBlue} />
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <AppText variant="overline" color={Colors.textMuted} center>
            The Black Wash · Hazaribagh, Jharkhand
          </AppText>
        </View>
        </Animated.View>
      </ScrollView>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        visible={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSuccess={() => refetchVehicles()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  devPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.30)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  devPreviewBannerLeft: {
    gap: 1,
  },
  devBannerSub: {
    fontSize: 10,
    lineHeight: 13,
  },
  devSignInBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.30)',
  },
  headerContainer: {
    backgroundColor: Colors.deepNavy,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.45)',
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    flexShrink: 0,
  },
  headerAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F7FA',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerAvatarSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  greetingLeftCol: {
    flex: 1,
    gap: 4,
  },
  greetingLabel: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
    gap: 4,
  },
  locationChipText: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineWrapper: {
    marginVertical: 2,
  },
  headlineTitle: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  headlineAccent: {
    fontSize: 22,
    lineHeight: 28,
    color: Colors.cyanBlue,
  },
  searchPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    paddingHorizontal: Spacing.sm,
    height: 44,
    gap: Spacing.xs,
  },
  searchPillFocused: {
    borderColor: Colors.cyanBlue,
    backgroundColor: Colors.surfaceElevated,
  },
  searchIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputField: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    paddingVertical: 0,
    height: '100%',
  },
  searchClearButton: {
    padding: 4,
  },
  noSearchBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  clearSearchBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.30)',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110, // Generous clearance for floating dock
  },
  sectionsWrapper: {
    gap: Spacing.md,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bookCtaBtn: {
    flex: 2,
  },
  callCtaBtn: {
    flex: 1,
  },
  garageSection: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  retryChip: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderRadius: Radius.full,
  },
  servicesLoaderBox: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  vehicleCard: {
    padding: Spacing.md,
  },
  vehicleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  vehicleIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleEmoji: {
    fontSize: 18,
  },
  vehicleDetails: {
    flex: 1,
    gap: 1,
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultPill: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  emptyVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderStyle: 'dashed',
    backgroundColor: Colors.surfaceDark,
  },
  emptyVehicleText: {
    flex: 1,
    gap: 1,
  },
  servicesSection: {
    gap: Spacing.sm,
  },
  servicesList: {
    gap: Spacing.md,
  },
  serviceCard: {
    padding: 0,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 120,
  },
  serviceCardBody: {
    padding: Spacing.md,
    gap: 6,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    gap: 3,
  },
  serviceName: {
    marginTop: 1,
  },
  serviceDesc: {
    lineHeight: 18,
  },
  serviceBookBtn: {
    marginTop: 4,
  },
  featuresSection: {
    gap: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featuresTitle: {
    marginBottom: 2,
  },
  featuresGrid: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureText: {
    flex: 1,
    gap: 1,
  },
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  whatsappLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  whatsappIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappInfo: {
    flex: 1,
    gap: 1,
  },
  footerNote: {
    paddingVertical: Spacing.xs,
  },
});
