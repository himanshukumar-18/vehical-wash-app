import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  KeyRound,
  FileText,
  ExternalLink,
  MessageCircle,
  RotateCcw,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import { AppText, AppCard, AppBadge, AppButton, AppModal, AppDivider } from '@/components';
import { openWhatsApp } from '@/constants/contact';

export default function BookingDetailsModal({ visible, onClose, booking, onCancel, onBookAgain }) {
  if (!booking) return null;

  const handleOpenMap = (addressText) => {
    if (!addressText) return;
    // Check if there is an explicit URL in the address text
    const urlMatch = addressText.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      Linking.openURL(urlMatch[0]);
    } else {
      const query = encodeURIComponent(`${addressText}, Hazaribagh, Jharkhand`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handleWhatsAppChat = () => {
    const text = `Hi The Black Wash, I am inquiring about my booking #${booking.booking_number} (${booking.service} for ${booking.vehicle}).`;
    openWhatsApp(text);
  };

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const isPastOrFinished = ['completed', 'cancelled'].includes(booking.status);

  return (
    <AppModal visible={visible} onClose={onClose} title={`Booking #${booking.booking_number}`}>
      <View style={styles.container}>
        {/* Status & Price Banner */}
        <View style={styles.topRow}>
          <AppBadge variant={booking.status} size="md" />
          <AppText variant="h3" weight="bold" color={Colors.cyanBlue}>
            ₹{Math.round(booking.total_price || booking.base_price || 0)}
          </AppText>
        </View>

        {/* OTP Highlight if Active */}
        {booking.arrival_otp && ['confirmed', 'in_progress'].includes(booking.status) && (
          <AppCard variant="glass" style={styles.otpCard}>
            <View style={styles.otpLeft}>
              <KeyRound size={18} color={Colors.cyanBlue} />
              <View>
                <AppText variant="caption" color={Colors.textSecondary}>
                  Arrival Security Code
                </AppText>
                <AppText variant="bodySmall" weight="semiBold" color={Colors.textPrimary}>
                  Share with washer upon arrival
                </AppText>
              </View>
            </View>
            <View style={styles.otpPill}>
              <AppText variant="h3" weight="bold" color={Colors.cyanBlue}>
                {booking.arrival_otp}
              </AppText>
            </View>
          </AppCard>
        )}

        {/* Service & Vehicle Info */}
        <AppCard variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Car size={16} color={Colors.cyanBlue} />
            <View style={styles.infoCol}>
              <AppText variant="caption" color={Colors.textMuted}>
                Vehicle
              </AppText>
              <AppText variant="body" weight="bold">
                {booking.vehicle || 'Standard Vehicle'}
              </AppText>
            </View>
          </View>

          <AppDivider style={styles.divider} />

          <View style={styles.infoRow}>
            <FileText size={16} color={Colors.cyanBlue} />
            <View style={styles.infoCol}>
              <AppText variant="caption" color={Colors.textMuted}>
                Wash Package
              </AppText>
              <AppText variant="body" weight="bold">
                {booking.service || 'Wash Package'}
              </AppText>
            </View>
          </View>

          <AppDivider style={styles.divider} />

          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.cyanBlue} />
            <View style={styles.infoCol}>
              <AppText variant="caption" color={Colors.textMuted}>
                Date & Slot
              </AppText>
              <AppText variant="body" weight="semiBold">
                {booking.booking_date || 'Standard Schedule'}
              </AppText>
            </View>
          </View>

          <AppDivider style={styles.divider} />

          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.cyanBlue} />
            <View style={styles.infoCol}>
              <AppText variant="caption" color={Colors.textMuted}>
                Doorstep Address
              </AppText>
              <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.addressText}>
                {booking.address}
              </AppText>
              <TouchableOpacity
                onPress={() => handleOpenMap(booking.address)}
                style={styles.mapLinkBtn}
              >
                <ExternalLink size={12} color={Colors.cyanBlue} />
                <AppText variant="caption" weight="bold" color={Colors.cyanBlue}>
                  Open in Google Maps
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {booking.customer_note ? (
            <>
              <AppDivider style={styles.divider} />
              <View style={styles.infoRow}>
                <Clock size={16} color={Colors.textMuted} />
                <View style={styles.infoCol}>
                  <AppText variant="caption" color={Colors.textMuted}>
                    Special Instructions
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {booking.customer_note}
                  </AppText>
                </View>
              </View>
            </>
          ) : null}
        </AppCard>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <AppButton
            variant="dark"
            size="md"
            onPress={handleWhatsAppChat}
            leftIcon={<MessageCircle size={16} color={Colors.cyanBlue} />}
            style={styles.chatBtn}
          >
            WhatsApp
          </AppButton>

          {isPastOrFinished && onBookAgain ? (
            <AppButton
              variant="primary"
              size="md"
              onPress={() => {
                onClose();
                onBookAgain(booking);
              }}
              leftIcon={<RotateCcw size={15} color={Colors.primaryBlack} />}
              style={styles.bookAgainBtn}
            >
              Book Again
            </AppButton>
          ) : null}

          {canCancel && onCancel ? (
            <AppButton
              variant="danger"
              size="md"
              onPress={() => {
                onClose();
                onCancel(booking);
              }}
              style={styles.cancelBtn}
            >
              Cancel
            </AppButton>
          ) : null}
        </View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: `${Colors.cyanBlue}10`,
    borderColor: `${Colors.cyanBlue}30`,
  },
  otpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  otpPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.cyanBlue}20`,
  },
  infoCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceDark,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  divider: {
    marginVertical: 4,
    backgroundColor: Colors.borderDark,
  },
  addressText: {
    lineHeight: 18,
  },
  mapLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  chatBtn: {
    flex: 1,
  },
  cancelBtn: {
    flex: 1,
  },
});
