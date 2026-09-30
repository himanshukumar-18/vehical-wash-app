import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Car, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import { AppText, AppInput, AppButton, AppModal } from '@/components';
import { VEHICLE_TYPES, POPULAR_BRANDS } from '@/constants/vehicles';
import { useAddVehicleMutation } from '../vehiclesApi';

/**
 * AddVehicleModal — quick dark modal form to add a vehicle into user's garage.
 */
export default function AddVehicleModal({ visible, onClose, onSuccess }) {
  const router = useRouter();
  const [addVehicle, { isLoading }] = useAddVehicleMutation();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('hatchback');
  const [color, setColor] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!brand.trim()) errs.brand = 'Brand is required (e.g. Hyundai)';
    if (!model.trim()) errs.model = 'Model is required (e.g. Creta)';
    if (!registrationNumber.trim()) {
      errs.registrationNumber = 'Registration is required (e.g. JH02AB1234)';
    } else if (registrationNumber.trim().length < 4) {
      errs.registrationNumber = 'Enter a valid vehicle number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        brand: brand.trim(),
        model: model.trim(),
        registration_number: registrationNumber.trim().toUpperCase(),
        vehicle_type: vehicleType,
        color: color.trim(),
        is_default: true,
      };

      const result = await addVehicle(payload).unwrap();
      Alert.alert('Vehicle Added', `${result.brand} ${result.model} added to your garage!`);
      // Reset
      setBrand('');
      setModel('');
      setRegistrationNumber('');
      setColor('');
      setVehicleType('hatchback');
      setErrors({});
      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      if (err?.status === 401 || err?.data?.code === 'AUTHENTICATION_REQUIRED') {
        onClose();
        Alert.alert(
          'Sign In Required',
          'Please sign in to add a vehicle to your garage.',
          [
            { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }
      const serverMessage =
        err?.data?.message ||
        err?.data?.registration_number?.[0] ||
        'Failed to add vehicle. Please check the details.';
      Alert.alert('Error', serverMessage);
    }
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Add Vehicle to Garage">
      <View style={styles.container}>
        {/* Quick Brand Selector */}
        <View style={styles.fieldSection}>
          <AppText variant="caption" color={Colors.textSecondary}>
            Popular Brands
          </AppText>
          <View style={styles.pillRow}>
            {POPULAR_BRANDS.slice(0, 6).map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => setBrand(b)}
                style={[
                  styles.brandPill,
                  brand === b && styles.brandPillActive,
                ]}
              >
                <AppText
                  variant="caption"
                  weight={brand === b ? 'bold' : 'medium'}
                  color={brand === b ? Colors.cyanBlue : Colors.textPrimary}
                >
                  {b}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Brand input if custom or selected */}
        <AppInput
          label="Brand Name"
          placeholder="e.g. Tata, Hyundai, Mahindra"
          value={brand}
          onChangeText={(val) => {
            setBrand(val);
            if (errors.brand) setErrors((prev) => ({ ...prev, brand: null }));
          }}
          error={errors.brand}
          leftIcon={<Car size={16} color={Colors.textMuted} />}
        />

        {/* Model Input */}
        <AppInput
          label="Model Name"
          placeholder="e.g. Nexon, Creta, Thar"
          value={model}
          onChangeText={(val) => {
            setModel(val);
            if (errors.model) setErrors((prev) => ({ ...prev, model: null }));
          }}
          error={errors.model}
        />

        {/* Registration Number */}
        <AppInput
          label="Registration Number"
          placeholder="e.g. JH02AZ1234"
          value={registrationNumber}
          onChangeText={(val) => {
            setRegistrationNumber(val.toUpperCase());
            if (errors.registrationNumber) {
              setErrors((prev) => ({ ...prev, registrationNumber: null }));
            }
          }}
          autoCapitalize="characters"
          error={errors.registrationNumber}
          helper="Vehicle number plate format"
        />

        {/* Vehicle Type Selector */}
        <View style={styles.fieldSection}>
          <AppText variant="caption" color={Colors.textSecondary}>
            Vehicle Body Type
          </AppText>
          <View style={styles.typeGrid}>
            {VEHICLE_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setVehicleType(t.value)}
                style={[
                  styles.typeCard,
                  vehicleType === t.value && styles.typeCardActive,
                ]}
              >
                <AppText style={styles.typeIcon}>{t.icon}</AppText>
                <AppText
                  variant="caption"
                  weight={vehicleType === t.value ? 'bold' : 'regular'}
                  color={vehicleType === t.value ? Colors.cyanBlue : Colors.textPrimary}
                >
                  {t.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color (Optional) */}
        <AppInput
          label="Color (Optional)"
          placeholder="e.g. Phantom Black, White, Grey"
          value={color}
          onChangeText={setColor}
        />

        {/* Submit */}
        <AppButton
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          onPress={handleSave}
          leftIcon={<Sparkles size={16} color={Colors.primaryBlack} />}
          style={styles.submitBtn}
        >
          Save to Garage
        </AppButton>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  fieldSection: {
    gap: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 2,
  },
  brandPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
  },
  brandPillActive: {
    borderColor: Colors.cyanBlue,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 2,
  },
  typeCard: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
    gap: 2,
  },
  typeCardActive: {
    borderColor: Colors.cyanBlue,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
  },
  typeIcon: {
    fontSize: 20,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});
