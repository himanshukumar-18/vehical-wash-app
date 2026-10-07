import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { User, Mail, Phone } from 'lucide-react-native';

import { Colors, Spacing } from '@/theme';
import { AppInput, AppButton, AppModal } from '@/components';
import { useUpdateProfileMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setCredentials } from '@/features/auth/authSlice';

function EditProfileForm({ onClose, currentUser }) {
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [fullname, setFullname] = useState(currentUser?.fullname || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const email = currentUser?.email || '';
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!fullname.trim()) {
      errs.fullname = 'Full name is required.';
    } else if (fullname.trim().length < 2) {
      errs.fullname = 'Name must be at least 2 characters.';
    }

    if (phone.trim() && phone.trim().length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        fullname: fullname.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      };

      const res = await updateProfile(payload).unwrap();
      const updatedUser = res.data || res;

      dispatch(setCredentials({ user: updatedUser }));
      Alert.alert('Profile Updated', 'Your profile details have been updated.');
      onClose();
    } catch (err) {
      const msg =
        err?.data?.fullname?.[0] ||
        err?.data?.phone?.[0] ||
        err?.data?.email?.[0] ||
        err?.data?.message ||
        'Failed to update profile. Please try again.';
      Alert.alert('Update Failed', msg);
    }
  };

  return (
    <View style={styles.form}>
      <AppInput
        label="Full Name"
        placeholder="e.g. Rahul Sharma"
        value={fullname}
        onChangeText={(text) => {
          setFullname(text);
          if (errors.fullname) setErrors((prev) => ({ ...prev, fullname: null }));
        }}
        leftIcon={<User size={16} color={Colors.textMuted} />}
        error={errors.fullname}
      />

      <AppInput
        label="Phone Number"
        placeholder="e.g. 9876543210"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
        }}
        keyboardType="phone-pad"
        leftIcon={<Phone size={16} color={Colors.textMuted} />}
        error={errors.phone}
      />

      <AppInput
        label="Email Address"
        value={email}
        editable={false}
        disabled
        leftIcon={<Mail size={16} color={Colors.textMuted} />}
        helper="Email cannot be changed directly."
      />

      <View style={styles.actions}>
        <AppButton
          variant="ghost"
          size="md"
          onPress={onClose}
          disabled={isLoading}
          style={styles.cancelBtn}
        >
          Cancel
        </AppButton>

        <AppButton
          variant="primary"
          size="md"
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveBtn}
        >
          Save Changes
        </AppButton>
      </View>
    </View>
  );
}

/**
 * EditProfileModal — allows customer to update their name and phone number
 */
export default function EditProfileModal({ visible, onClose, currentUser }) {
  if (!visible) return null;

  return (
    <AppModal visible={visible} onClose={onClose} title="Edit Profile">
      <EditProfileForm
        key={`${currentUser?.id || 'guest'}-${currentUser?.fullname}`}
        onClose={onClose}
        currentUser={currentUser}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});
