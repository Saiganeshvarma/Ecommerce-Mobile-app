import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCreateCategoryMutation } from '@api/categoryApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';

const AdminAddCategoryScreen = () => {
  const navigation = useNavigation();
  const { showSuccess, showError } = useToast();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setNameError('Category name is required'); return; }
    const formData = new FormData();
    formData.append('name', name.trim());
    if (imageUri) {
      const filename = imageUri.split('/').pop() ?? 'category.jpg';
      formData.append('image', { uri: imageUri, name: filename, type: 'image/jpeg' } as any);
    }
    try {
      await createCategory(formData).unwrap();
      showSuccess('Category created');
      navigation.goBack();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Image picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 40 }}>📷</Text>
              <Text style={styles.imageHint}>Tap to add image</Text>
            </View>
          )}
        </TouchableOpacity>

        <AppInput
          label="Category Name"
          placeholder="e.g. Mobiles, Laptops"
          value={name}
          onChangeText={(t) => { setName(t); setNameError(''); }}
          error={nameError}
        />

        <AppButton title="Create Category" onPress={handleSubmit} loading={isLoading} size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  previewImage: { width: 160, height: 160 },
  imagePlaceholder: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface },
  imageHint: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },
});

export default AdminAddCategoryScreen;
