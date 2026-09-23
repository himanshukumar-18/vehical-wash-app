import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Link2,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import {
  AppText,
  AppButton,
  AppInput,
  AppCard,
  AppDivider,
} from '@/components';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetVehiclesQuery } from '@/features/vehicles/vehiclesApi';
import { useCreateBookingMutation } from '@/features/bookings/bookingsApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentUser } from '@/features/auth/authSlice';
import {
  formatBookingWhatsAppMessage,
  openWhatsApp,
} from '@/constants/contact';
import { FALLBACK_SERVICES } from '@/constants/services';
import AddVehicleModal from '@/features/vehicles/components/AddVehicleModal';

/**
 * Generate next 7 selectable dates
 */
function getNextSevenDays() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString('en-US', { weekday: 'short' });
    }

    const dateFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const isoString = d.toISOString().split('T')[0];

    days.push({
      label,
      dateFormatted,
      value: isoString,
    });
  }
  return days;
}

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUser = useAppSelector(selectCurrentUser);

  const { data: services } = useGetServicesQuery();
  const { data: vehicles, refetch: refetchVehicles } =
    useGetVehiclesQuery(undefined, { skip: !currentUser });
  const [createBooking, { isLoading: isSubmitting }] = useCreateBookingMutation();

  const [address, setAddress] = React.useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState(currentUser?.phone_number || '');
  const [customerNote, setCustomerNote] = React.useState('');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // Explicitly user-controlled selections (null = not yet chosen by user)
  const [selectedVehicleIdOverride, setSelectedVehicleId] = React.useState(null);
  const [selectedServiceIdOverride, setSelectedServiceId] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(null);

  const availableDates = getNextSevenDays();
  const availableServices = services && services.length > 0 ? services : FALLBACK_SERVICES;

  // Effective selections: explicit user choice → route param → auto-detected default → null
  const defaultVehicle = vehicles
    ? (params?.vehicleId ? vehicles.find((v) => v.id === Number(params.vehicleId)) : null) ||
      vehicles.find((v) => v.is_default) ||
      vehicles[0]
    : null;

  const defaultService = params?.serviceId
    ? (availableServices.find((s) => s.id === Number(params.serviceId)) || availableServices[0])
    : availableServices[0];

  const selectedVehicleId = selectedVehicleIdOverride ?? defaultVehicle?.id ?? null;
  const selectedServiceId = selectedServiceIdOverride ?? defaultService?.id ?? null;
  const effectiveDate = selectedDate ?? availableDates[0]?.value ?? null;

  const selectedService = availableServices.find((s) => s.id === selectedServiceId);
  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);

  const validate = () => {
    const errs = {};
    if (!selectedVehicleId && vehicles?.length) {
      errs.vehicle = 'Please select a vehicle from your garage.';
    } else if (!selectedVehicleId && !vehicles?.length) {
      errs.vehicle = 'Please add a vehicle to your garage to proceed.';
    }

    if (!selectedServiceId) errs.service = 'Please select a wash package.';
    if (!effectiveDate) errs.date = 'Please select a preferred booking date.';

    if (!address.trim()) {
      errs.address = 'Doorstep address in Hazaribagh is required.';
    } else if (address.trim().length < 5) {
      errs.address = 'Please enter a complete address (house/street/landmark).';
    }

    if (googleMapsUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.)/i;
      const genericUrlPattern = /^https?:\/\//i;
      if (!urlPattern.test(googleMapsUrl.trim()) && !genericUrlPattern.test(googleMapsUrl.trim())) {
        errs.googleMapsUrl = 'Please enter a valid URL (e.g. https://maps.app.goo.gl/...)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmAndWhatsApp = async () => {
    if (isSubmitting) return; // Prevent duplicate submissions

    if (!validate()) {
      Alert.alert('Incomplete Details', 'Please fill in all required fields to proceed.');
      return;
    }

    try {
      // Format complete address payload
      let completeAddress = address.trim();
      if (googleMapsUrl.trim()) {
        completeAddress += `\n📍 Maps: ${googleMapsUrl.trim()}`;
      }
      if (customerPhone.trim()) {
        completeAddress += ` (Phone: ${customerPhone.trim()})`;
      }

      const payload = {
        vehicle_id: selectedVehicleId,
        service_id: selectedServiceId,
        booking_date: effectiveDate,
        address: completeAddress,
        customer_note: customerNote.trim(),
      };

      // 1. Save booking in backend first
      const result = await createBooking(payload).unwrap();

      // 2. Format WhatsApp message with the actual backend booking number
      const whatsappMsg = formatBookingWhatsAppMessage({
        bookingNumber: result.booking_number,
        vehicle: selectedVehicle,
        service: selectedService,
        bookingDate: effectiveDate,
        address: address.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        customerName: currentUser?.fullname,
        customerPhone: customerPhone.trim(),
        customerNote: customerNote.trim(),
        totalPrice: result.total_price || selectedService?.price,
      });

      // 3. Open WhatsApp for dispatch handoff
      await openWhatsApp(whatsappMsg);

      // 4. Alert user with next steps and navigation to My Bookings
      Alert.alert(
        'Booking Request Recorded 📝',
        `Booking #${result.booking_number} is saved in pending status. Send the WhatsApp message to our team to confirm your doorstep slot.`,
        [
          {
            text: 'Resend WhatsApp',
            style: 'default',
            onPress: () => openWhatsApp(whatsappMsg),
          },
          {
            text: 'View My Bookings',
            style: 'default',
            onPress: () => router.replace('/(tabs)/bookings'),
          },
        ]
      );
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.data?.detail ||
        (typeof err?.data === 'string' ? err.data : null) ||
        'Unable to record your booking. Please check your details and try again.';

      Alert.alert('Booking Error', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={20} color={Colors.cyanBlue} />
        </TouchableOpacity>

        <View style={styles.navTitleCenter}>
          <AppText variant="h4" weight="bold" color={Colors.textPrimary}>
            Book Doorstep Wash
          </AppText>
          <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 11 }}>
            The Black Wash · Hazaribagh
          </AppText>
        </View>

        <View style={styles.navRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: VEHICLE SELECTION */}
          <View style={styles.stepSection}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepNumberBadge}>
                <AppText variant="caption" weight="bold" color={Colors.primaryBlack} style={{ fontSize: 11 }}>
                  1
                </AppText>
              </View>
              <AppText variant="h4" weight="bold">
                Select Vehicle
              </AppText>
            </View>

            {vehicles?.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vehiclePillsRow}
              >
                {vehicles.map((v) => {
                  const isSelected = v.id === selectedVehicleId;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => {
                        setSelectedVehicleId(v.id);
                        if (errors.vehicle) setErrors((prev) => ({ ...prev, vehicle: null }));
                      }}
                      activeOpacity={0.8}
                      style={[
                        styles.vehiclePill,
                        isSelected && styles.vehiclePillSelected,
                      ]}
                    >
                      <Car
                        size={15}
                        color={isSelected ? Colors.cyanBlue : Colors.textMuted}
                      />
                      <View>
                        <AppText
                          variant="bodySmall"
                          weight={isSelected ? 'bold' : 'medium'}
                          color={isSelected ? Colors.textPrimary : Colors.textSecondary}
                        >
                          {v.brand} {v.model}
                        </AppText>
                        <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                          {v.registration_number}
                        </AppText>
                      </View>
                      {isSelected && (
                        <View style={styles.checkCircle}>
                          <Check size={10} color={Colors.primaryBlack} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <AppCard variant="outlined" style={styles.noVehiclesBox}>
                <AppText variant="caption" color={Colors.textSecondary}>
                  No vehicle registered in your garage yet.
                </AppText>
              </AppCard>
            )}

            <TouchableOpacity
              onPress={() => setIsAddVehicleOpen(true)}
              style={styles.addCarBtn}
            >
              <Plus size={14} color={Colors.cyanBlue} />
              <AppText variant="caption" weight="bold" color={Colors.cyanBlue}>
                + Add Vehicle to Garage
              </AppText>
            </TouchableOpacity>

            {errors.vehicle ? (
              <AppText variant="caption" color={Colors.error}>
                {errors.vehicle}
              </AppText>
            ) : null}
          </View>

          <AppDivider style={styles.stepDivider} />

          {/* STEP 2: SERVICE SELECTION */}
          <View style={styles.stepSection}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepNumberBadge}>
                <AppText variant="caption" weight="bold" color={Colors.primaryBlack} style={{ fontSize: 11 }}>
                  2
                </AppText>
              </View>
              <AppText variant="h4" weight="bold">
                Select Wash Package
              </AppText>
            </View>

            <View style={styles.servicesGrid}>
              {availableServices.map((svc) => {
                const isSelected = svc.id === selectedServiceId;
                return (
                  <TouchableOpacity
                    key={svc.id || svc.slug}
                    onPress={() => {
                      setSelectedServiceId(svc.id);
                      if (errors.service) {
                        setErrors((prev) => ({ ...prev, service: null }));
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <AppCard
                      variant="default"
                      style={[
                        styles.serviceChoiceCard,
                        isSelected && styles.serviceChoiceCardSelected,
                      ]}
                    >
                      <View style={styles.serviceChoiceHeader}>
                        <View style={styles.serviceChoiceTitleCol}>
                          <AppText variant="body" weight="bold" color={Colors.textPrimary}>
                            {svc.name}
                          </AppText>
                          <View style={styles.durationTag}>
                            <Clock size={11} color={Colors.textMuted} />
                            <AppText variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                              {svc.duration_minutes} mins
                            </AppText>
                          </View>
                        </View>

                        <View style={styles.servicePriceBlock}>
                          <AppText variant="body" weight="bold" color={Colors.cyanBlue}>
                            ₹{Math.round(svc.price)}
                          </AppText>
                          <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                            {isSelected && <View style={styles.radioDot} />}
                          </View>
                        </View>
                      </View>

                      <AppText
                        variant="caption"
                        color={Colors.textSecondary}
                        style={styles.serviceChoiceDesc}
                      >
                        {svc.short_description || svc.description}
                      </AppText>
                    </AppCard>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errors.service ? (
              <AppText variant="caption" color={Colors.error}>
                {errors.service}
              </AppText>
            ) : null}
          </View>

          <AppDivider style={styles.stepDivider} />

          {/* STEP 3: DATE SELECTION */}
          <View style={styles.stepSection}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepNumberBadge}>
                <AppText variant="caption" weight="bold" color={Colors.primaryBlack} style={{ fontSize: 11 }}>
                  3
                </AppText>
              </View>
              <AppText variant="h4" weight="bold">
                Preferred Wash Date
              </AppText>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datePillsRow}
            >
              {availableDates.map((item) => {
                const isSelected = item.value === effectiveDate;
                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => {
                      setSelectedDate(item.value);
                      if (errors.date) {
                        setErrors((prev) => ({ ...prev, date: null }));
                      }
                    }}
                    style={[
                      styles.datePill,
                      isSelected && styles.datePillSelected,
                    ]}
                  >
                    <Calendar
                      size={13}
                      color={isSelected ? Colors.cyanBlue : Colors.textMuted}
                    />
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? Colors.cyanBlue : Colors.textPrimary}
                    >
                      {item.label}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={isSelected ? Colors.textSecondary : Colors.textMuted}
                      style={{ fontSize: 10 }}
                    >
                      {item.dateFormatted}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {errors.date ? (
              <AppText variant="caption" color={Colors.error}>
                {errors.date}
              </AppText>
            ) : null}
          </View>

          <AppDivider style={styles.stepDivider} />

          {/* STEP 4: DOORSTEP ADDRESS & GOOGLE LOCATION LINK */}
          <View style={styles.stepSection}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepNumberBadge}>
                <AppText variant="caption" weight="bold" color={Colors.primaryBlack} style={{ fontSize: 11 }}>
                  4
                </AppText>
              </View>
              <AppText variant="h4" weight="bold">
                Service Address & Map Link
              </AppText>
            </View>

            <AppInput
              label="Doorstep Address in Hazaribagh *"
              placeholder="House/Flat No, Landmark, Area (e.g. Matwari, Hazaribagh)"
              value={address}
              onChangeText={(val) => {
                setAddress(val);
                if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
              }}
              error={errors.address}
              leftIcon={<MapPin size={16} color={Colors.cyanBlue} />}
              multiline
              numberOfLines={2}
              inputStyle={{ minHeight: 48, textAlignVertical: 'top' }}
            />

            {/* Google Maps Location Link Input */}
            <AppInput
              label="Google Maps Location Link (Optional)"
              placeholder="Paste your Google Maps location link"
              value={googleMapsUrl}
              onChangeText={(val) => {
                setGoogleMapsUrl(val);
                if (errors.googleMapsUrl) setErrors((prev) => ({ ...prev, googleMapsUrl: null }));
              }}
              error={errors.googleMapsUrl}
              helper="Helps our detailing van locate your exact doorstep"
              keyboardType="url"
              autoCapitalize="none"
              leftIcon={<Link2 size={16} color={Colors.cyanBlue} />}
            />
          </View>

          <AppDivider style={styles.stepDivider} />

          {/* STEP 5: CONTACT & NOTES */}
          <View style={styles.stepSection}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepNumberBadge}>
                <AppText variant="caption" weight="bold" color={Colors.primaryBlack} style={{ fontSize: 11 }}>
                  5
                </AppText>
              </View>
              <AppText variant="h4" weight="bold">
                Contact & Notes
              </AppText>
            </View>

            <AppInput
              label="Phone Number for Dispatch (Optional)"
              placeholder="e.g. +91 9876543210"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />

            <AppInput
              label="Special Instructions (Optional)"
              placeholder="e.g. Extra mud on tires, park in underground bay"
              value={customerNote}
              onChangeText={setCustomerNote}
              multiline
              numberOfLines={2}
              inputStyle={{ minHeight: 44, textAlignVertical: 'top' }}
            />
          </View>

          {/* PRICE SUMMARY CARD */}
          <AppCard variant="default" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                Order Breakdown
              </AppText>
              <View style={styles.doorstepPill}>
                <ShieldCheck size={11} color={Colors.success} />
                <AppText variant="caption" weight="bold" color={Colors.success} style={{ fontSize: 10 }}>
                  Doorstep Service
                </AppText>
              </View>
            </View>

            <AppDivider style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                {selectedService?.name || 'Wash Package'}
              </AppText>
              <AppText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
                ₹{Math.round(selectedService?.price || 0)}
              </AppText>
            </View>

            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Doorstep Travel Charge (Hazaribagh)
              </AppText>
              <AppText variant="bodySmall" weight="bold" color={Colors.success}>
                FREE
              </AppText>
            </View>

            <AppDivider style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <AppText variant="body" weight="bold" color={Colors.textPrimary}>
                Total Payable (On Delivery)
              </AppText>
              <AppText variant="h3" weight="bold" color={Colors.cyanBlue}>
                ₹{Math.round(selectedService?.price || 0)}
              </AppText>
            </View>
          </AppCard>

          {/* CTA: Book & Confirm on WhatsApp */}
          <View style={styles.ctaContainer}>
            <AppButton
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              onPress={handleConfirmAndWhatsApp}
              rightIcon={<ArrowRight size={16} color={Colors.primaryBlack} />}
            >
              Book & Confirm on WhatsApp
            </AppButton>

            <AppText variant="caption" color={Colors.textMuted} center style={styles.ctaDisclaimer}>
              Cash or UPI payment upon completion of wash at your doorstep.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        visible={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSuccess={(newCar) => {
          refetchVehicles();
          setSelectedVehicleId(newCar.id);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  flex: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  navTitleCenter: {
    alignItems: 'center',
  },
  navRightPlaceholder: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing['5xl'],
  },
  stepSection: {
    gap: Spacing.sm,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDivider: {
    marginVertical: 4,
    backgroundColor: Colors.borderDark,
  },
  vehiclePillsRow: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  vehiclePillSelected: {
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderColor: Colors.cyanBlue,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVehiclesBox: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceDark,
  },
  addCarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  servicesGrid: {
    gap: Spacing.sm,
  },
  serviceChoiceCard: {
    padding: Spacing.md,
    gap: 4,
    backgroundColor: Colors.surfaceDark,
  },
  serviceChoiceCardSelected: {
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderColor: Colors.cyanBlue,
    borderWidth: 1.5,
  },
  serviceChoiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  serviceChoiceTitleCol: {
    flex: 1,
    gap: 2,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  servicePriceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.cyanBlue,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.cyanBlue,
  },
  serviceChoiceDesc: {
    lineHeight: 16,
  },
  datePillsRow: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  datePill: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    gap: 2,
    minWidth: 72,
  },
  datePillSelected: {
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderColor: Colors.cyanBlue,
  },
  summaryCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doorstepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    gap: 3,
  },
  summaryDivider: {
    marginVertical: 4,
    backgroundColor: Colors.borderDark,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  ctaContainer: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  ctaDisclaimer: {
    fontSize: 11,
    lineHeight: 15,
  },
});
