import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@models/index';
import { resetPasswordSchema, type ResetPasswordFormData } from '@validations/auth.validation';
import { useResetPasswordMutation } from '@api/authApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';

type Route = RouteProp<AuthStackParamList, 'ResetPassword'>;
type Nav = NativeStackNavigationProp<AuthStackParamList>;

const ResetPasswordScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { showSuccess, showError } = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { token } = route.params;

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({ token, password: data.password }).unwrap();
      showSuccess('Password reset successful. Please log in.');
      navigation.replace('Login');
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong password with uppercase, lowercase, number and special character.
        </Text>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="New Password"
              placeholder="Enter new password"
              leftIcon="lock-closed-outline"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Confirm Password"
              placeholder="Re-enter new password"
              leftIcon="lock-closed-outline"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <AppButton
          title="Reset Password"
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
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },
});

export default ResetPasswordScreen;
