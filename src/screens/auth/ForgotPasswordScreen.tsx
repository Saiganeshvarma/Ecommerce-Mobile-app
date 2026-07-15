import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@validations/auth.validation';
import { useForgotPasswordMutation } from '@api/authApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing, BorderRadius } from '@theme/spacing';

const ForgotPasswordScreen = () => {
  const { showError } = useToast();
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data).unwrap();
      setSent(true);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="mail-open-outline" size={80} color={Colors.primary} />
        <Text style={styles.successTitle}>Email Sent!</Text>
        <Text style={styles.successMsg}>
          We've sent a password reset link to your email. Please check your inbox (and spam folder).
          The link expires in 15 minutes.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="lock-open-outline" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address and we'll send you a reset link.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Email Address"
              placeholder="john@example.com"
              keyboardType="email-address"
              leftIcon="mail-outline"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <AppButton
          title="Send Reset Link"
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
  iconWrapper: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  successTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  successMsg: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ForgotPasswordScreen;
