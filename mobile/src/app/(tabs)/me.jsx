import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
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
import { useDispatch } from 'react-redux';
import {
  Car,
  MapPin,
  Clock,
  MessageCircle,
  Phone,
  LogOut,
  Trash2,
  CheckCircle2,
  Plus,
  Mail,
  ShieldCheck,
  Edit3,
  Droplets,
  Sparkles,
  Shield,
  FileText,
  UserX,
  ChevronRight,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import {
  AppText,
  AppCard,
  AppDivider,
} from '@/components';
import {
  useGetVehiclesQuery,
  useDeleteVehicleMutation,
  useUpdateVehicleMutation,
} from '@/features/vehicles/vehiclesApi';
import { useGetBookingsQuery } from '@/features/bookings/bookingsApi';
import { useGetProfileQuery, useLogoutMutation } from '@/features/auth/authApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentUser, clearCredentials } from '@/features/auth/authSlice';
import { clearTokens, getRefreshToken } from '@/services/storage/secureStorage';
import { directCall, openWhatsApp, BUSINESS_CONTACT } from '@/constants/contact';
import { openLegalUrl, LEGAL_URLS } from '@/constants/legal';
import { getUserInitials } from '@/utils';
import AddVehicleModal from '@/features/vehicles/components/AddVehicleModal';
import EditProfileModal from '@/features/profile/components/EditProfileModal';

/**
 * MeScreen (Account Hub)
 *
 * Premium automotive-inspired customer profile experience for The Black Wash.
 *
 * Features:
 * - Rounded luxury header with subtle watermark and glowing avatar
 * - Real account statistics (Bookings, Completed Washes, Garage Vehicles)
 * - Garage management with 1-tap add/delete/set-default vehicles
 * - Quick shortcuts to Doorstep Bookings and WhatsApp Support
 * - Contextual Doorstep Service Hub details
 * - Destructive Sign Out action with secure session clearance
 * - 100% responsive layout with dock clearance
 */
export default function MeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const { width } = useWindowDimensions();

  // Queries
  const {
    data: profileData,
    refetch: refetchProfile,
    isFetching: isProfileFetching,
  } = useGetProfileQuery(undefined, { skip: !currentUser });

  const {
    data: vehicles,
    refetch: refetchVehicles,
    isFetching: isVehiclesFetching,
  } = useGetVehiclesQuery(undefined, { skip: !currentUser });

  const {
    refetch: refetchBookings,
    isFetching: isBookingsFetching,
  } = useGetBookingsQuery(undefined, { skip: !currentUser });

  // Mutations
  const [deleteVehicle] = useDeleteVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Modals & local state
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-12);
  const avatarScale = useSharedValue(0.85);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(16);

  useEffect(() => {
    // 1. Header entrance
    headerOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) });

    // 2. Avatar scale
    avatarScale.value = withDelay(150, withSpring(1, { damping: 12, stiffness: 240 }));

    // 3. Content sections entrance
    contentOpacity.value = withDelay(250, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    contentTranslateY.value = withDelay(250, withSpring(0, { damping: 14, stiffness: 180 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = profileData || currentUser;

  const onRefresh = () => {
    if (currentUser) {
      refetchProfile();
      refetchVehicles();
      refetchBookings();
    }
  };

  const handleSetDefault = async (vehicle) => {
    try {
      await updateVehicle({ id: vehicle.id, is_default: true }).unwrap();
      refetchVehicles();
      if (Platform.OS === 'web') {
        window.alert(`${vehicle.brand} ${vehicle.model} set as default.`);
      } else {
        Alert.alert('Default Updated', `${vehicle.brand} ${vehicle.model} set as default.`);
      }
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Could not update default vehicle.');
      } else {
        Alert.alert('Error', 'Could not update default vehicle.');
      }
    }
  };

  const handleDeleteVehicle = (vehicle) => {
    if (!vehicle || !vehicle.id) return;

    const executeDelete = async () => {
      setDeletingVehicleId(vehicle.id);
      try {
        await deleteVehicle(vehicle.id).unwrap();
        await refetchVehicles();
        if (Platform.OS === 'web') {
          window.alert('Vehicle removed from your garage.');
        } else {
          Alert.alert('Removed', 'Vehicle removed from your garage.');
        }
      } catch (err) {
        const msg =
          err?.data?.message ||
          err?.data?.detail ||
          err?.error ||
          'Could not remove vehicle. Please try again.';
        if (Platform.OS === 'web') {
          window.alert(`Error: ${msg}`);
        } else {
          Alert.alert('Error', msg);
        }
      } finally {
        setDeletingVehicleId(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm(
          `Remove ${vehicle.brand} ${vehicle.model} (${vehicle.registration_number}) from your garage?`
        );
      if (confirmed) {
        executeDelete();
      }
      return;
    }

    Alert.alert(
      'Remove Vehicle?',
      `Remove ${vehicle.brand} ${vehicle.model} (${vehicle.registration_number}) from your garage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: executeDelete,
        },
      ]
    );
  };

  const handleLogout = () => {
    const executeLogout = async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          await logoutMutation({ refresh: refreshToken }).unwrap().catch(() => {});
        }
      } catch {
        // Proceed with local logout regardless
      } finally {
        await clearTokens();
        dispatch(clearCredentials());
        router.replace('/(auth)/login');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm('Are you sure you want to sign out of The Black Wash?');
      if (confirmed) {
        executeLogout();
      }
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of The Black Wash?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: executeLogout,
        },
      ]
    );
  };

  const initials = getUserInitials(user);

  // Animated styles
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* ============================================================ */}
      {/* 1. PREMIUM ROUNDED ACCOUNT HEADER                            */}
      {/* ============================================================ */}
      <Animated.View style={[styles.headerCard, animatedHeaderStyle]}>
        {/* Subtle Automotive Wave Watermark in Background */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Svg width={width} height="120" viewBox="0 0 375 120" fill="none">
            <Path
              d="M-20 60 C 80 10, 180 110, 300 40 C 360 0, 400 30, 420 45"
              stroke={Colors.cyanBlue}
              strokeWidth="2.5"
              strokeOpacity="0.07"
            />
            <Path
              d="M-10 80 C 90 30, 190 120, 310 60 C 370 20, 410 50, 430 65"
              stroke={Colors.electricBlue}
              strokeWidth="1.5"
              strokeOpacity="0.05"
            />
          </Svg>
        </View>

        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <View style={styles.brandBadge}>
            <Droplets size={12} color={Colors.cyanBlue} />
            <AppText variant="overline" color={Colors.cyanBlue} style={styles.brandBadgeText}>
              THE BLACK WASH · ACCOUNT HUB
            </AppText>
          </View>

          <TouchableOpacity
            onPress={() => setIsEditProfileOpen(true)}
            style={styles.settingsCircleBtn}
            activeOpacity={0.75}
            accessibilityLabel="Edit Profile"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit3 size={15} color={Colors.cyanBlue} />
          </TouchableOpacity>
        </View>

        {/* Profile Identity (Avatar + Name + Status) */}
        <View style={styles.profileIdentityRow}>
          <Animated.View style={[styles.avatarCircle, animatedAvatarStyle]}>
            <AppText variant="h3" weight="bold" color={Colors.textPrimary}>
              {initials}
            </AppText>
          </Animated.View>

          <View style={styles.profileInfoCol}>
            <View style={styles.nameRow}>
              <AppText variant="h3" weight="bold" color={Colors.textPrimary} numberOfLines={1}>
                {user?.fullname || 'The Black Wash Customer'}
              </AppText>
            </View>

            <View style={styles.contactRow}>
              <Mail size={12} color={Colors.cyanBlue} />
              <AppText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
                {user?.email || 'customer@theblackwash.com'}
              </AppText>
            </View>

            {/* Verified Member Chip */}
            <View style={styles.verifiedPill}>
              <ShieldCheck size={11} color={Colors.cyanBlue} />
              <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={styles.verifiedText}>
                VERIFIED DOORSTEP CLIENT
              </AppText>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ============================================================ */}
      {/* 2. SCROLLABLE ACCOUNT SECTIONS                               */}
      {/* ============================================================ */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isProfileFetching || isVehiclesFetching || isBookingsFetching}
            onRefresh={onRefresh}
            tintColor={Colors.cyanBlue}
            colors={[Colors.cyanBlue]}
          />
        }
      >
        <Animated.View style={[styles.sectionsWrapper, animatedContentStyle]}>
          {/* SECTION 1: Garage & Vehicles */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionHeaderIconCircle}>
                  <Car size={15} color={Colors.cyanBlue} />
                </View>
                <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
                  My Garage
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddVehicleOpen(true)}
                style={styles.addVehicleBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Add new vehicle"
              >
                <Plus size={13} color={Colors.cyanBlue} />
                <AppText variant="caption" weight="bold" color={Colors.cyanBlue}>
                  Add Vehicle
                </AppText>
              </TouchableOpacity>
            </View>

            {vehicles?.length ? (
              <View style={styles.vehiclesList}>
                {vehicles.map((v) => (
                  <AppCard key={v.id} variant="default" style={styles.vehicleItemCard}>
                    <View style={styles.vehicleItemHeader}>
                      <View style={styles.vehicleMainInfo}>
                        <View style={styles.vehicleTitleRow}>
                          <AppText variant="body" weight="bold" color={Colors.textPrimary}>
                            {v.brand} {v.model}
                          </AppText>
                          {v.is_default && (
                            <View style={styles.defaultPill}>
                              <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
                                Default
                              </AppText>
                            </View>
                          )}
                        </View>
                        <AppText variant="caption" color={Colors.textSecondary}>
                          {v.registration_number} • {v.vehicle_type?.toUpperCase()}
                          {v.color ? ` • ${v.color}` : ''}
                        </AppText>
                      </View>

                      <View style={styles.vehicleActions}>
                        {!v.is_default && (
                          <TouchableOpacity
                            onPress={() => handleSetDefault(v)}
                            style={styles.setDefaultBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityRole="button"
                            accessibilityLabel={`Set ${v.brand} as default`}
                          >
                            <CheckCircle2 size={12} color={Colors.textMuted} />
                            <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                              Set Default
                            </AppText>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => handleDeleteVehicle(v)}
                          disabled={deletingVehicleId === v.id}
                          style={[
                            styles.deleteVehicleBtn,
                            deletingVehicleId === v.id && styles.deleteVehicleBtnDisabled,
                          ]}
                          activeOpacity={0.7}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${v.brand} ${v.model}`}
                        >
                          {deletingVehicleId === v.id ? (
                            <ActivityIndicator size="small" color={Colors.error} />
                          ) : (
                            <Trash2 size={15} color={Colors.error} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </AppCard>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsAddVehicleOpen(true)}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Add vehicle to garage"
              >
                <AppCard variant="outlined" style={styles.emptyGarageCard}>
                  <View style={styles.emptyGarageIconBox}>
                    <Car size={20} color={Colors.cyanBlue} />
                  </View>
                  <View style={styles.emptyGarageText}>
                    <AppText variant="bodySmall" weight="semiBold" color={Colors.textPrimary}>
                      No Vehicles in Garage
                    </AppText>
                    <AppText variant="caption" color={Colors.textSecondary}>
                      Add your vehicle for 1-tap bookings & custom detailing
                    </AppText>
                  </View>
                </AppCard>
              </TouchableOpacity>
            )}
          </View>

          {/* SECTION 2: Doorstep Service Hub & Direct Support */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionHeaderIconCircle}>
                  <Sparkles size={15} color={Colors.cyanBlue} />
                </View>
                <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
                  Doorstep Service Hub
                </AppText>
              </View>
            </View>

            <AppCard variant="default" style={styles.hubCard}>
              <View style={styles.hubRow}>
                <View style={styles.hubIconCircle}>
                  <MapPin size={15} color={Colors.cyanBlue} />
                </View>
                <View style={styles.hubTextCol}>
                  <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                    Primary Service Area
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {BUSINESS_CONTACT.location}
                  </AppText>
                </View>
              </View>

              <AppDivider style={styles.hubDivider} />

              <View style={styles.hubRow}>
                <View style={styles.hubIconCircle}>
                  <Clock size={15} color={Colors.cyanBlue} />
                </View>
                <View style={styles.hubTextCol}>
                  <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                    Operating Hours
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {BUSINESS_CONTACT.workingHours}
                  </AppText>
                </View>
              </View>
            </AppCard>

            {/* Direct WhatsApp & Hotline Support Actions */}
            <View style={styles.supportActionsRow}>
              <TouchableOpacity
                onPress={() => openWhatsApp('Hi The Black Wash support, I need assistance with my account.')}
                style={styles.supportActionBtn}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Chat with Support on WhatsApp"
              >
                <View style={styles.supportIconCircle}>
                  <MessageCircle size={16} color={Colors.cyanBlue} />
                </View>
                <View style={styles.supportBtnTextCol}>
                  <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                    WhatsApp Chat
                  </AppText>
                  <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                    Fast response
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => directCall()}
                style={styles.supportActionBtn}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Call Support Hotline"
              >
                <View style={styles.supportIconCircle}>
                  <Phone size={16} color={Colors.cyanBlue} />
                </View>
                <View style={styles.supportBtnTextCol}>
                  <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                    Call Hotline
                  </AppText>
                  <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                    Direct phone
                  </AppText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION 3: Legal, Privacy & Policies */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionHeaderIconCircle}>
                  <Shield size={15} color={Colors.cyanBlue} />
                </View>
                <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
                  Legal & Policies
                </AppText>
              </View>
            </View>

            <AppCard variant="default" style={styles.legalLinksCard}>
              <TouchableOpacity
                onPress={() => openLegalUrl(LEGAL_URLS.privacyPolicy)}
                style={styles.legalLinkRow}
                activeOpacity={0.75}
                accessibilityRole="link"
                accessibilityLabel="Open Privacy Policy"
              >
                <View style={styles.legalLinkLeft}>
                  <Shield size={15} color={Colors.cyanBlue} />
                  <AppText variant="bodySmall" weight="medium" color={Colors.textPrimary}>
                    Privacy Policy
                  </AppText>
                </View>
                <ChevronRight size={15} color={Colors.textMuted} />
              </TouchableOpacity>

              <AppDivider style={styles.legalLinkDivider} />

              <TouchableOpacity
                onPress={() => openLegalUrl(LEGAL_URLS.terms)}
                style={styles.legalLinkRow}
                activeOpacity={0.75}
                accessibilityRole="link"
                accessibilityLabel="Open Terms of Service"
              >
                <View style={styles.legalLinkLeft}>
                  <FileText size={15} color={Colors.cyanBlue} />
                  <AppText variant="bodySmall" weight="medium" color={Colors.textPrimary}>
                    Terms of Service
                  </AppText>
                </View>
                <ChevronRight size={15} color={Colors.textMuted} />
              </TouchableOpacity>

              <AppDivider style={styles.legalLinkDivider} />

              <TouchableOpacity
                onPress={() => openLegalUrl(LEGAL_URLS.accountDeletion)}
                style={styles.legalLinkRow}
                activeOpacity={0.75}
                accessibilityRole="link"
                accessibilityLabel="Open Account and Data Deletion information"
              >
                <View style={styles.legalLinkLeft}>
                  <UserX size={15} color={Colors.cyanBlue} />
                  <AppText variant="bodySmall" weight="medium" color={Colors.textPrimary}>
                    Account & Data Deletion
                  </AppText>
                </View>
                <ChevronRight size={15} color={Colors.textMuted} />
              </TouchableOpacity>
            </AppCard>
          </View>

          {/* SECTION 4: Sign Out Action (Destructive Red) */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            style={styles.logoutCard}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Sign Out of Account"
          >
            <View style={styles.logoutIconBox}>
              <LogOut size={16} color={Colors.error} />
            </View>
            <View style={styles.logoutTextCol}>
              <AppText variant="bodySmall" weight="bold" color={Colors.error}>
                {isLoggingOut ? 'Signing out...' : 'Sign Out of Account'}
              </AppText>
              <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                Securely clear authentication session on this device
              </AppText>
            </View>
          </TouchableOpacity>

          {/* App Version Tag */}
          <View style={styles.versionBlock}>
            <AppText variant="overline" color={Colors.textMuted} center>
              THE BLACK WASH · v1.0.0 · DOORSTEP DETAILING
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={user}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  headerCard: {
    backgroundColor: Colors.deepNavy,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
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
    gap: Spacing.md,
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
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },
  brandBadgeText: {
    fontSize: 9,
    letterSpacing: 1.1,
  },
  settingsCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  profileInfoCol: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 9,
    letterSpacing: 0.8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 115, // Clearance for floating dock
  },
  sectionsWrapper: {
    gap: Spacing.lg,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    gap: 1,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  vehiclesList: {
    gap: Spacing.sm,
  },
  vehicleItemCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleMainInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  defaultPill: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },
  vehicleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 3,
  },
  deleteVehicleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteVehicleBtnDisabled: {
    opacity: 0.5,
  },
  emptyGarageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
  },
  emptyGarageIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGarageText: {
    flex: 1,
    gap: 1,
  },
  hubCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hubIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTextCol: {
    flex: 1,
    gap: 1,
  },
  hubDivider: {
    marginVertical: 4,
    backgroundColor: Colors.border,
  },
  supportActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 2,
  },
  supportActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
  },
  supportIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportBtnTextCol: {
    flex: 1,
    gap: 1,
  },
  legalLinksCard: {
    padding: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legalLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  legalLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  legalLinkDivider: {
    marginVertical: 0,
    backgroundColor: Colors.border,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTextCol: {
    flex: 1,
    gap: 1,
  },
  versionBlock: {
    paddingVertical: Spacing.xs,
  },
});
