import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { User, Mail } from 'lucide-react-native';

import { Colors, Spacing } from '@/theme';
import { AppInput, AppButton, AppModal } from '@/components';
import { useUpdateProfileMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setCredentials } from '@/features/auth/authSlice';

function EditProfileForm({ onClose, currentUser }) {
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [fullname, setFullname] = useState(currentUser?.fullname || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!fullname.trim()) {
      errs.fullname = 'Full name is required.';
    } else if (fullname.trim().length < 2) {
      errs.fullname = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
      };

      const updatedUser = await updateProfile(payload).unwrap();

      dispatch(setCredentials({ user: updatedUser }));
      Alert.alert('Profile Updated', 'Your profile details have been updated.');
      onClose();
    } catch (err) {
      const msg =
        err?.data?.fullname?.[0] ||
        err?.data?.email?.[0] ||
        err?.data?.detail ||
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
        label="Email Address"
        placeholder="e.g. rahul@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={16} color={Colors.textMuted} />}
        error={errors.email}
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
 * EditProfileModal — allows customer to update their name and email
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
