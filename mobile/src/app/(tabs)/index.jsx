import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
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
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import {
  AppText,
  AppButton,
  AppCard,
  AppLoader,
} from '@/components';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetVehiclesQuery } from '@/features/vehicles/vehiclesApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { openWhatsApp, directCall, BUSINESS_CONTACT } from '@/constants/contact';
import { IS_DEV_HOME_PREVIEW } from '@/constants/devPreview';
import { FALLBACK_SERVICES } from '@/constants/services';
import AddVehicleModal from '@/features/vehicles/components/AddVehicleModal';
import HomeHeroCarousel from '@/features/home/components/HomeHeroCarousel';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

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

  const displayServices =
    services && services.length > 0 ? services : FALLBACK_SERVICES;

  const defaultVehicle =
    vehicles?.find((v) => v.is_default) || (vehicles?.length ? vehicles[0] : null);

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

      {/* Futuristic Command Center Header */}
      <View style={styles.topBar}>
        {/* User Identity & Avatar Capsule */}
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => router.push(user ? '/(tabs)/me' : '/(auth)/login')}
          activeOpacity={0.75}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <AppText variant="bodySmall" weight="bold" color={Colors.primaryBlack}>
                {user?.fullname
                  ? user.fullname
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'BW'}
              </AppText>
            </View>
            <View style={styles.livePulseDot} />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.greetingRow}>
              <AppText variant="caption" color={Colors.textMuted} style={styles.greetingText}>
                {(() => {
                  const hr = new Date().getHours();
                  if (hr < 12) return 'Good morning';
                  if (hr < 17) return 'Good afternoon';
                  return 'Good evening';
                })()}
              </AppText>
              <View style={styles.verifiedMiniBadge}>
                <ShieldCheck size={10} color={Colors.cyanBlue} />
              </View>
            </View>
            <AppText variant="h3" weight="bold" numberOfLines={1} color={Colors.textPrimary} style={styles.userName}>
              {user?.fullname ? user.fullname.split(' ')[0] : 'The Black Wash'}
            </AppText>
          </View>
        </TouchableOpacity>

        {/* Right Header Actions: Live Radar Location & Quick Call */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.locationCapsule}
            onPress={handleOpenWhatsAppChat}
            activeOpacity={0.8}
          >
            <View style={styles.radarDot} />
            <MapPin size={11} color={Colors.cyanBlue} />
            <AppText variant="caption" weight="bold" color={Colors.textPrimary} style={styles.locationText}>
              Hazaribagh
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callIconBtn}
            onPress={() => directCall()}
            activeOpacity={0.75}
            accessibilityLabel="Call Support Hotline"
          >
            <Phone size={13} color={Colors.cyanBlue} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.neonHorizonLine} />

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
              <Car size={16} color={Colors.cyanBlue} />
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
              <Droplets size={16} color={Colors.cyanBlue} />
              <AppText variant="h4" weight="bold">
                Wash Packages
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
                {displayServices.length} packages
              </AppText>
            </View>
          </View>

          {isServicesLoading && !services?.length ? (
            <View style={styles.servicesLoaderBox}>
              <AppLoader size="small" text="Loading wash packages..." />
            </View>
          ) : (
            <View style={styles.servicesList}>
              {displayServices.map((svc) => (
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.deepNavy,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.45)',
  },
  livePulseDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: Colors.deepNavy,
  },
  userInfo: {
    flex: 1,
    gap: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  verifiedMiniBadge: {
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    padding: 1.5,
    borderRadius: Radius.full,
  },
  userName: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 28, 39, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    gap: 4,
  },
  radarDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: '#22C55E',
  },
  locationText: {
    fontSize: 11,
  },
  callIconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonHorizonLine: {
    height: 1,
    backgroundColor: 'rgba(0, 207, 255, 0.20)',
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 110, // Generous clearance for floating dock
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
