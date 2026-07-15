import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useChangePasswordMutation } from '@api/authApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { changePasswordSchema, type ChangePasswordFormData } from '@validations/auth.validation';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { showSuccess, showError } = useToast();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }).unwrap();
      showSuccess('Password changed successfully');
      reset();
      navigation.goBack();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Current Password"
              placeholder="Enter current password"
              leftIcon="lock-closed-outline"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.currentPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="New Password"
              placeholder="Enter new password"
              leftIcon="lock-open-outline"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.newPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              leftIcon="lock-open-outline"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        <AppButton
          title="Change Password"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          size="lg"
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl },
});

export default ChangePasswordScreen;
