import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Car,
  MapPin,
  KeyRound,
  MessageCircle,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  CalendarCheck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import {
  AppText,
  AppCard,
  AppBadge,
  AppLoader,
  AppEmptyState,
  AppDivider,
} from '@/components';
import {
  useGetBookingsQuery,
  useCancelBookingMutation,
} from '@/features/bookings/bookingsApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { openWhatsApp } from '@/constants/contact';
import BookingDetailsModal from '@/features/bookings/components/BookingDetailsModal';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetBookingsQuery(undefined, { skip: !user });

  const { data: services } = useGetServicesQuery();
  const [cancelBooking] = useCancelBookingMutation();

  // Auto-refresh bookings whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user, refetch])
  );

  // Calculate real metrics from authentic backend records
  const metrics = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) {
      return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
    }
    return {
      total: bookings.length,
      upcoming: bookings.filter((b) =>
        ['pending', 'confirmed', 'in_progress'].includes(b.status)
      ).length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [bookings]);

  // Filter bookings based on selected status tab
  const filteredBookings = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) return [];
    if (activeTab === 'all') return bookings;
    if (activeTab === 'upcoming') {
      return bookings.filter((b) =>
        ['pending', 'confirmed', 'in_progress'].includes(b.status)
      );
    }
    if (activeTab === 'completed') {
      return bookings.filter((b) => b.status === 'completed');
    }
    if (activeTab === 'cancelled') {
      return bookings.filter((b) => b.status === 'cancelled');
    }
    return bookings;
  }, [bookings, activeTab]);

  const handleCancel = (booking) => {
    Alert.alert(
      'Cancel Booking?',
      `Are you sure you want to cancel booking #${booking.booking_number}?`,
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking({ id: booking.id }).unwrap();
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
            } catch (err) {
              Alert.alert(
                'Cancel Failed',
                err?.data?.detail || err?.data?.message || 'Unable to cancel booking.'
              );
            }
          },
        },
      ]
    );
  };

  const handleChatAboutBooking = (booking) => {
    const text = `Hi The Black Wash, I am inquiring about my booking #${booking.booking_number} (${booking.service} for ${booking.vehicle}).`;
    openWhatsApp(text);
  };

  const handleBookAgain = (booking) => {
    // Find matching service ID if available to prefill booking form
    const matchedService = services?.find(
      (s) => s.name?.toLowerCase() === booking.service?.toLowerCase()
    );

    const params = {};
    if (matchedService) {
      params.serviceId = String(matchedService.id);
    }

    router.push({
      pathname: '/booking',
      params,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Futuristic Activity Header */}
      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <CalendarCheck size={18} color={Colors.cyanBlue} />
          </View>
          <View style={styles.headerTitles}>
            <View style={styles.titleRow}>
              <AppText variant="h3" weight="bold" color={Colors.textPrimary}>
                Bookings
              </AppText>
              {metrics.total > 0 && (
                <View style={styles.countPill}>
                  <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 10 }}>
                    {metrics.total}
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 11 }}>
              Doorstep Wash Schedule
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/booking')}
          style={styles.newBookingBtn}
          activeOpacity={0.8}
        >
          <Sparkles size={12} color={Colors.primaryBlack} />
          <AppText variant="caption" weight="bold" color={Colors.primaryBlack}>
            + Book Wash
          </AppText>
        </TouchableOpacity>
      </View>
      <View style={styles.neonHorizonLine} />

      {/* Real Summary Metrics Capsule Bar */}
      {user && bookings?.length > 0 && (
        <View style={styles.metricsBar}>
          <TouchableOpacity
            style={[styles.metricCard, activeTab === 'all' && styles.metricCardActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.75}
          >
            <AppText variant="caption" color={Colors.textMuted} style={styles.metricLabel}>
              Total
            </AppText>
            <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
              {metrics.total}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, activeTab === 'upcoming' && styles.metricCardActive]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.75}
          >
            <View style={styles.metricTitleRow}>
              <View style={[styles.statusDot, { backgroundColor: Colors.cyanBlue }]} />
              <AppText variant="caption" color={Colors.cyanBlue} style={styles.metricLabel}>
                Upcoming
              </AppText>
            </View>
            <AppText variant="h4" weight="bold" color={Colors.cyanBlue}>
              {metrics.upcoming}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, activeTab === 'completed' && styles.metricCardActive]}
            onPress={() => setActiveTab('completed')}
            activeOpacity={0.75}
          >
            <View style={styles.metricTitleRow}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <AppText variant="caption" color={Colors.success} style={styles.metricLabel}>
                Completed
              </AppText>
            </View>
            <AppText variant="h4" weight="bold" color={Colors.success}>
              {metrics.completed}
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {FILTER_TABS.map((tab) => {
          const isSelected = tab.id === activeTab;
          const count =
            tab.id === 'all'
              ? metrics.total
              : tab.id === 'upcoming'
              ? metrics.upcoming
              : tab.id === 'completed'
              ? metrics.completed
              : metrics.cancelled;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabItem, isSelected && styles.tabItemActive]}
              activeOpacity={0.7}
            >
              <AppText
                variant="caption"
                weight={isSelected ? 'bold' : 'medium'}
                color={isSelected ? Colors.cyanBlue : Colors.textMuted}
              >
                {tab.label} {count > 0 ? `(${count})` : ''}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.cyanBlue}
            colors={[Colors.cyanBlue]}
          />
        }
      >
        {!user ? (
          <AppEmptyState
            emoji="👤"
            title="Sign in to View Bookings"
            message="Sign in with your account to track active doorstep washes, view arrival OTPs, and manage bookings."
            actionLabel="Sign In"
            onAction={() => router.push('/(auth)/login')}
          />
        ) : isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <AppLoader size="small" text="Loading your bookings..." />
          </View>
        ) : isError ? (
          <AppEmptyState
            emoji="⚠️"
            title="Could Not Load Bookings"
            message="Unable to reach the server. Please check your connection."
            actionLabel="Try Again"
            onAction={refetch}
          />
        ) : filteredBookings.length === 0 ? (
          <AppEmptyState
            emoji="🚗"
            title="No Bookings Found"
            message={
              activeTab === 'all'
                ? 'You have not made any doorstep wash bookings yet.'
                : `You do not have any ${activeTab} wash bookings.`
            }
            actionLabel="Book a Doorstep Wash"
            onAction={() => router.push('/booking')}
          />
        ) : (
          filteredBookings.map((b) => {
            const canCancel = ['pending', 'confirmed'].includes(b.status);
            const isFinishedOrCancelled = ['completed', 'cancelled'].includes(b.status);

            return (
              <TouchableOpacity
                key={b.id}
                onPress={() => setSelectedBooking(b)}
                activeOpacity={0.85}
              >
                <AppCard variant="default" style={styles.bookingCard}>
                  {/* Header: Ref & Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.bookingRefCol}>
                      <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 11 }}>
                        Booking Ref
                      </AppText>
                      <AppText variant="body" weight="bold" color={Colors.textPrimary}>
                        #{b.booking_number}
                      </AppText>
                    </View>
                    <AppBadge variant={b.status} size="sm" />
                  </View>

                  <AppDivider style={styles.divider} />

                  {/* Booking Details */}
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <Car size={15} color={Colors.cyanBlue} />
                      <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary} numberOfLines={1} style={styles.detailText}>
                        {b.vehicle || 'Standard Vehicle'}
                      </AppText>
                    </View>

                    <View style={styles.detailRow}>
                      <Clock size={15} color={Colors.cyanBlue} />
                      <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.detailText}>
                        {b.service || 'Wash Package'}
                      </AppText>
                    </View>

                    <View style={styles.detailRow}>
                      <MapPin size={15} color={Colors.textMuted} />
                      <AppText variant="caption" color={Colors.textMuted} numberOfLines={1} style={styles.detailText}>
                        {b.address}
                      </AppText>
                    </View>
                  </View>

                  {/* Arrival OTP Display if confirmed or in progress */}
                  {b.arrival_otp && ['confirmed', 'in_progress'].includes(b.status) && (
                    <View style={styles.otpBanner}>
                      <View style={styles.otpLeft}>
                        <KeyRound size={14} color={Colors.cyanBlue} />
                        <AppText variant="caption" color={Colors.textSecondary}>
                          Arrival OTP:
                        </AppText>
                      </View>
                      <View style={styles.otpBadge}>
                        <AppText variant="bodySmall" weight="bold" color={Colors.cyanBlue}>
                          {b.arrival_otp}
                        </AppText>
                      </View>
                    </View>
                  )}

                  {/* Footer: Price + Quick Actions */}
                  <View style={styles.cardFooter}>
                    <View style={styles.priceCol}>
                      <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                        Total Amount
                      </AppText>
                      <AppText variant="body" weight="bold" color={Colors.cyanBlue}>
                        ₹{Math.round(b.total_price || b.base_price || 0)}
                      </AppText>
                    </View>

                    <View style={styles.actionRow}>
                      {/* WhatsApp Support shortcut */}
                      <TouchableOpacity
                        onPress={() => handleChatAboutBooking(b)}
                        style={styles.chatIconBtn}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <MessageCircle size={14} color={Colors.cyanBlue} />
                        <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={{ fontSize: 11 }}>
                          WhatsApp
                        </AppText>
                      </TouchableOpacity>

                      {/* Book Again for Completed or Cancelled */}
                      {isFinishedOrCancelled && (
                        <TouchableOpacity
                          onPress={() => handleBookAgain(b)}
                          style={styles.bookAgainPill}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <RotateCcw size={12} color={Colors.primaryBlack} />
                          <AppText variant="caption" weight="bold" color={Colors.primaryBlack} style={{ fontSize: 11 }}>
                            Book Again
                          </AppText>
                        </TouchableOpacity>
                      )}

                      {/* Cancel for Pending or Confirmed */}
                      {canCancel && (
                        <TouchableOpacity
                          onPress={() => handleCancel(b)}
                          style={styles.cancelLink}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <XCircle size={14} color={Colors.error} />
                          <AppText variant="caption" color={Colors.error} style={{ fontSize: 11 }}>
                            Cancel
                          </AppText>
                        </TouchableOpacity>
                      )}

                      <ChevronRight size={15} color={Colors.textMuted} />
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        visible={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onCancel={handleCancel}
        onBookAgain={handleBookAgain}
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
  iconCircle: {
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countPill: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.30)',
  },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cyanBlue,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 4,
  },
  neonHorizonLine: {
    height: 1,
    backgroundColor: 'rgba(0, 207, 255, 0.20)',
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
    gap: Spacing.xs,
  },
  tabItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  tabItemActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.30)',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 110, // Dock clearance
  },
  bookingCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingRefCol: {
    gap: 1,
  },
  divider: {
    marginVertical: 4,
    backgroundColor: Colors.borderDark,
  },
  detailsGrid: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    flex: 1,
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.20)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: 2,
  },
  otpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  otpBadge: {
    backgroundColor: 'rgba(0, 207, 255, 0.18)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDark,
  },
  priceCol: {
    gap: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chatIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 3,
  },
  cancelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
