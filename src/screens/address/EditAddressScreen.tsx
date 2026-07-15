import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Switch, Text, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '@models/index';
import { useGetAddressesQuery, useUpdateAddressMutation } from '@api/addressApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { addressSchema, type AddressFormData } from '@validations/address.validation';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';

type Route = RouteProp<ProfileStackParamList, 'EditAddress'>;

const EditAddressScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { addressId } = route.params;
  const { showSuccess, showError } = useToast();
  const [updateAddress, { isLoading }] = useUpdateAddressMutation();

  const { data } = useGetAddressesQuery();
  const address = data?.data?.addresses?.find((a) => a._id === addressId);

  const { control, handleSubmit, formState: { errors } } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: address
      ? {
          fullName: address.fullName,
          mobile: address.mobile,
          houseNo: address.houseNo,
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode,
          isDefault: address.isDefault,
        }
      : {},
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      await updateAddress({ id: addressId, data }).unwrap();
      showSuccess('Address updated successfully');
      navigation.goBack();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  if (!address) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {(['fullName', 'mobile', 'houseNo', 'street', 'city', 'state', 'country', 'pincode'] as const).map((field) => (
          <Controller
            key={field}
            control={control}
            name={field}
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={field === 'fullName' ? 'Full Name' : field === 'houseNo' ? 'House/Flat No' : field.charAt(0).toUpperCase() + field.slice(1)}
                placeholder={`Enter ${field}`}
                keyboardType={field === 'mobile' || field === 'pincode' ? 'number-pad' : 'default'}
                value={value as string}
                onChangeText={onChange}
                error={errors[field]?.message}
              />
            )}
          />
        ))}

        <Controller
          control={control}
          name="isDefault"
          render={({ field: { onChange, value } }) => (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Set as default address</Text>
              <Switch value={value} onValueChange={onChange} trackColor={{ true: Colors.primary }} />
            </View>
          )}
        />

        <AppButton
          title="Update Address"
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: Spacing.xl },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  toggleLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
});

export default EditAddressScreen;
