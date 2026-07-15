import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@models/index';
import { registerSchema, type RegisterFormData } from '@validations/auth.validation';
import { useRegisterMutation } from '@api/authApi';
import { setCredentials } from '@redux/slices/authSlice';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { showError } = useToast();
  const [register, { isLoading }] = useRegisterMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await register(data).unwrap();
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>🛍️ ShopEase</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start shopping</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Full Name"
                placeholder="John Doe"
                leftIcon="person-outline"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Email"
                placeholder="john@example.com"
                keyboardType="email-address"
                leftIcon="mail-outline"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Phone Number"
                placeholder="9876543210"
                keyboardType="phone-pad"
                leftIcon="call-outline"
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Password"
                placeholder="Min 8 chars, uppercase, number, special"
                leftIcon="lock-closed-outline"
                isPassword
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <AppButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoText: { fontSize: 48, marginBottom: Spacing.md },
  title: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { marginBottom: Spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.base },
  footerText: { fontSize: FontSize.md, color: Colors.textSecondary },
  linkText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
});

export default RegisterScreen;
