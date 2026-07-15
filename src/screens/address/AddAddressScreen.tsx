import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Switch, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useCreateAddressMutation } from '@api/addressApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { addressSchema, type AddressFormData } from '@validations/address.validation';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const { showSuccess, showError } = useToast();
  const [createAddress, { isLoading }] = useCreateAddressMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      fullName: '', mobile: '', houseNo: '', street: '',
      city: '', state: '', country: 'India', pincode: '', isDefault: false,
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      await createAddress(data).unwrap();
      showSuccess('Address added successfully');
      navigation.goBack();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

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

        {/* Default toggle */}
        <Controller
          control={control}
          name="isDefault"
          render={({ field: { onChange, value } }) => (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Set as default address</Text>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ true: Colors.primary }}
              />
            </View>
          )}
        />

        <AppButton
          title="Save Address"
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  toggleLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
});

export default AddAddressScreen;
