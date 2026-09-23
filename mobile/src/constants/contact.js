import { Linking, Alert } from 'react-native';

/**
 * The Black Wash — Business Contact, Phone & WhatsApp Configuration
 */

export const BUSINESS_CONTACT = {
  name: 'The Black Wash',
  tagline: 'Doorstep Car Wash & Detailing',
  location: 'Hazaribagh, Jharkhand, India',
  phoneNumber: process.env.EXPO_PUBLIC_CALL_NUMBER || process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '+917004050123',
  whatsappNumber: process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '+917004050123',
  supportEmail: 'contact@theblackwash.com',
  workingHours: '8:00 AM - 7:00 PM (All Days)',
};

/**
 * Format a structured WhatsApp message for booking requests
 */
export function formatBookingWhatsAppMessage({
  bookingNumber,
  vehicle,
  service,
  bookingDate,
  address,
  googleMapsUrl,
  customerName,
  customerPhone,
  customerNote,
  totalPrice,
}) {
  const vehicleText = vehicle
    ? `${vehicle.brand} ${vehicle.model} (${vehicle.registration_number}) [${vehicle.vehicle_type?.toUpperCase()}]`
    : 'Not Specified';

  const lines = [
    '✨ *THE BLACK WASH — BOOKING REQUEST* ✨',
    '────────────────────────',
    `🆔 *Booking Ref:* #${bookingNumber || 'NEW'}`,
    `🚗 *Vehicle:* ${vehicleText}`,
    `🧼 *Service:* ${service?.name || 'Standard Wash'} (₹${totalPrice || service?.price || '0'})`,
    `📅 *Preferred Date:* ${bookingDate || 'Earliest Available'}`,
    `📍 *Doorstep Address:* ${address || 'Hazaribagh'}`,
  ];

  if (googleMapsUrl && googleMapsUrl.trim()) {
    lines.push(`🗺️ *Google Maps:* ${googleMapsUrl.trim()}`);
  }

  if (customerName) {
    lines.push(`👤 *Customer:* ${customerName}${customerPhone ? ` (${customerPhone})` : ''}`);
  }

  if (customerNote && customerNote.trim()) {
    lines.push(`📝 *Note:* ${customerNote.trim()}`);
  }

  lines.push('────────────────────────');
  lines.push('Please confirm our doorstep car wash slot. Thank you!');

  return lines.join('\n');
}

/**
 * Safely open WhatsApp with a pre-filled message
 * @param {string} message - Message body to send
 * @param {string} [phone] - Optional phone number override
 */
export async function openWhatsApp(message = '', phone = BUSINESS_CONTACT.whatsappNumber) {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
  const webFallbackUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedText}`;

  try {
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (supported) {
      await Linking.openURL(whatsappUrl);
    } else {
      await Linking.openURL(webFallbackUrl);
    }
  } catch (err) {
    console.warn('Could not open WhatsApp URL:', err);
    try {
      await Linking.openURL(webFallbackUrl);
    } catch {
      Alert.alert(
        'WhatsApp Not Available',
        `Please contact us directly at ${BUSINESS_CONTACT.whatsappNumber}`
      );
    }
  }
}

/**
 * Safely place a one-tap phone call to The Black Wash support
 * @param {string} [phone] - Optional phone number override
 */
export async function directCall(phone = BUSINESS_CONTACT.phoneNumber) {
  if (!phone) {
    Alert.alert('Phone Not Available', 'No business phone number is currently configured.');
    return;
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const url = `tel:${cleanPhone}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Calling Unavailable',
        `Your device cannot place phone calls automatically. Please dial ${phone} directly.`
      );
    }
  } catch (err) {
    console.warn('Could not open dialer URL:', err);
    Alert.alert(
      'Unable to Call',
      `Please dial our support number directly at ${phone}`
    );
  }
}
