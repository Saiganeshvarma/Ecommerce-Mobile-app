import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import { useUpdateProfileMutation } from '@api/authApi';
import { updateUser } from '@redux/slices/authSlice';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { editProfileSchema, type EditProfileFormData } from '@validations/profile.validation';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<EditProfileFormData>({
    resolver: yupResolver(editProfileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { showError('Gallery permission required'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.phone) formData.append('phone', data.phone);
    if (imageUri) {
      const filename = imageUri.split('/').pop() ?? 'profile.jpg';
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      formData.append('profileImage', { uri: imageUri, name: filename, type: mimeType } as any);
    }
    try {
      const res = await updateProfile(formData).unwrap();
      dispatch(updateUser(res.data.user));
      showSuccess('Profile updated successfully');
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const avatarSource = imageUri
    ? { uri: imageUri }
    : user?.profileImage?.url
    ? { uri: user.profileImage.url }
    : null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Avatar picker */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Full Name"
              placeholder="Enter your name"
              leftIcon="person-outline"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
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

        {/* Email (readonly) */}
        <AppInput
          label="Email (cannot be changed)"
          value={user?.email ?? ''}
          editable={false}
          leftIcon="mail-outline"
          containerStyle={{ opacity: 0.6 }}
        />

        <AppButton
          title="Save Changes"
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
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, color: '#fff' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  changePhotoText: { fontSize: FontSize.sm, color: Colors.primary, marginTop: Spacing.sm, fontWeight: FontWeight.medium },
});

export default EditProfileScreen;
