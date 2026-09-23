import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
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
  Calendar,
  ChevronRight,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import {
  AppText,
  AppButton,
  AppCard,
  AppDivider,
} from '@/components';
import {
  useGetVehiclesQuery,
  useDeleteVehicleMutation,
  useUpdateVehicleMutation,
} from '@/features/vehicles/vehiclesApi';
import { useGetProfileQuery, useLogoutMutation } from '@/features/auth/authApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentUser, clearCredentials } from '@/features/auth/authSlice';
import { clearTokens, getRefreshToken } from '@/services/storage/secureStorage';
import { directCall, openWhatsApp, BUSINESS_CONTACT } from '@/constants/contact';
import AddVehicleModal from '@/features/vehicles/components/AddVehicleModal';
import EditProfileModal from '@/features/profile/components/EditProfileModal';

export default function MeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

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

  const [deleteVehicle] = useDeleteVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const user = profileData || currentUser;

  const onRefresh = () => {
    if (currentUser) {
      refetchProfile();
      refetchVehicles();
    }
  };

  const handleSetDefault = async (vehicle) => {
    try {
      await updateVehicle({ id: vehicle.id, is_default: true }).unwrap();
      Alert.alert('Default Updated', `${vehicle.brand} ${vehicle.model} set as default.`);
    } catch {
      Alert.alert('Error', 'Could not update default vehicle.');
    }
  };

  const handleDeleteVehicle = (vehicle) => {
    Alert.alert(
      'Remove Vehicle?',
      `Remove ${vehicle.brand} ${vehicle.model} (${vehicle.registration_number}) from your garage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(vehicle.id).unwrap();
              Alert.alert('Removed', 'Vehicle removed from your garage.');
            } catch {
              Alert.alert('Error', 'Could not remove vehicle.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of The Black Wash?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const initials = user?.fullname
    ? user.fullname
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'BW';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Futuristic Account Header */}
      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <ShieldCheck size={18} color={Colors.cyanBlue} />
          </View>
          <View style={styles.headerTitles}>
            <AppText variant="h3" weight="bold" color={Colors.textPrimary}>
              My Account
            </AppText>
            <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 11 }}>
              Garage & Doorstep Settings
            </AppText>
          </View>
        </View>

        <View style={styles.vipBadge}>
          <View style={styles.radarDot} />
          <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
            Active Member
          </AppText>
        </View>
      </View>
      <View style={styles.neonHorizonLine} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isProfileFetching || isVehiclesFetching}
            onRefresh={onRefresh}
            tintColor={Colors.cyanBlue}
            colors={[Colors.cyanBlue]}
          />
        }
      >
        {/* User Card */}
        <AppCard variant="default" style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              <AppText variant="h3" weight="bold" color={Colors.primaryBlack}>
                {initials}
              </AppText>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
                  {user?.fullname || 'Customer'}
                </AppText>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={11} color={Colors.cyanBlue} />
                  <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
                    Verified
                  </AppText>
                </View>
              </View>

              <View style={styles.emailRow}>
                <Mail size={12} color={Colors.textMuted} />
                <AppText variant="caption" color={Colors.textSecondary}>
                  {user?.email || 'customer@theblackwash.com'}
                </AppText>
              </View>
            </View>

            {user && (
              <TouchableOpacity
                onPress={() => setIsEditProfileOpen(true)}
                style={styles.editProfileBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Edit3 size={15} color={Colors.cyanBlue} />
              </TouchableOpacity>
            )}
          </View>
        </AppCard>

        {/* Quick Shortcut: My Bookings */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/bookings')}
          activeOpacity={0.8}
        >
          <AppCard variant="outlined" style={styles.shortcutCard}>
            <View style={styles.shortcutLeft}>
              <View style={styles.shortcutIconBox}>
                <Calendar size={16} color={Colors.cyanBlue} />
              </View>
              <View>
                <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                  My Doorstep Bookings
                </AppText>
                <AppText variant="caption" color={Colors.textMuted}>
                  Track active washes & history
                </AppText>
              </View>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </AppCard>
        </TouchableOpacity>

        {/* Garage Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Car size={16} color={Colors.cyanBlue} />
              <AppText variant="h4" weight="bold">
                My Garage
              </AppText>
            </View>
            <TouchableOpacity
              onPress={() => setIsAddVehicleOpen(true)}
              style={styles.addBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                      <AppText variant="body" weight="bold" color={Colors.textPrimary}>
                        {v.brand} {v.model}
                      </AppText>
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
                        >
                          <CheckCircle2 size={13} color={Colors.textMuted} />
                          <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                            Set Default
                          </AppText>
                        </TouchableOpacity>
                      )}

                      {v.is_default && (
                        <View style={styles.defaultPill}>
                          <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
                            Default
                          </AppText>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={() => handleDeleteVehicle(v)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={15} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </AppCard>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsAddVehicleOpen(true)}
              activeOpacity={0.8}
            >
              <AppCard variant="outlined" style={styles.emptyGarageCard}>
                <Car size={22} color={Colors.cyanBlue} />
                <View style={styles.emptyGarageText}>
                  <AppText variant="bodySmall" weight="semiBold" color={Colors.textPrimary}>
                    No Vehicles in Garage
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    Add your car for 1-tap bookings & custom wash assignments
                  </AppText>
                </View>
              </AppCard>
            </TouchableOpacity>
          )}
        </View>

        {/* Doorstep Service Hub Info */}
        <View style={styles.section}>
          <AppText variant="h4" weight="bold" style={styles.sectionTitle}>
            Doorstep Service Hub
          </AppText>

          <AppCard variant="default" style={styles.hubCard}>
            <View style={styles.hubRow}>
              <MapPin size={16} color={Colors.cyanBlue} />
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
              <Clock size={16} color={Colors.cyanBlue} />
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
        </View>

        {/* Support & Logout */}
        <View style={styles.actionSection}>
          <AppButton
            variant="primary"
            size="md"
            fullWidth
            onPress={() => directCall()}
            leftIcon={<Phone size={16} color={Colors.primaryBlack} />}
            style={styles.callSupportBtn}
          >
            Direct Call Support ({BUSINESS_CONTACT.phoneNumber})
          </AppButton>

          <AppButton
            variant="dark"
            size="md"
            fullWidth
            onPress={() => openWhatsApp('Hi The Black Wash support, I need assistance with my account.')}
            leftIcon={<MessageCircle size={16} color={Colors.cyanBlue} />}
            style={styles.supportBtn}
          >
            Chat Support on WhatsApp
          </AppButton>

          <AppButton
            variant="ghost"
            size="md"
            fullWidth
            loading={isLoggingOut}
            onPress={handleLogout}
            leftIcon={<LogOut size={16} color={Colors.error} />}
            style={styles.logoutBtn}
          >
            Sign Out
          </AppButton>
        </View>

        {/* App Version Info */}
        <View style={styles.versionBlock}>
          <AppText variant="overline" color={Colors.textMuted} center>
            The Black Wash · v1.0.0 · Doorstep Car Care
          </AppText>
        </View>
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
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
    gap: 1,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.30)',
    gap: 4,
  },
  radarDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: '#22C55E',
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
    gap: Spacing.lg,
    paddingBottom: 110, // Dock clearance
  },
  userCard: {
    padding: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.full,
    gap: 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editProfileBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceDark,
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceDark,
  },
  shortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  shortcutIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: 2,
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
  addBtn: {
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
  },
  vehicleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleMainInfo: {
    flex: 1,
    gap: 1,
  },
  vehicleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 2,
  },
  defaultPill: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyGarageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderStyle: 'dashed',
    backgroundColor: Colors.surfaceDark,
  },
  emptyGarageText: {
    flex: 1,
    gap: 1,
  },
  hubCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  hubRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  hubTextCol: {
    flex: 1,
    gap: 1,
  },
  hubDivider: {
    marginVertical: 4,
    backgroundColor: Colors.borderDark,
  },
  actionSection: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  supportBtn: {
    marginTop: 2,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  versionBlock: {
    paddingVertical: Spacing.xs,
  },
});
