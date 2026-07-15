import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AdminStackParamList } from '@models/index';
import * as ImagePicker from 'expo-image-picker';
import { useGetCategoryByIdQuery, useUpdateCategoryMutation } from '@api/categoryApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';

type Route = RouteProp<AdminStackParamList, 'AdminEditCategory'>;

const AdminEditCategoryScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { categoryId } = route.params;
  const { showSuccess, showError } = useToast();

  const { data, isLoading } = useGetCategoryByIdQuery(categoryId);
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();

  const category = data?.data?.category;
  const [name, setName] = useState(category?.name ?? '');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Sync name when data arrives
  React.useEffect(() => {
    if (category?.name) setName(category.name);
  }, [category]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('name', name.trim());
    if (imageUri) {
      const filename = imageUri.split('/').pop() ?? 'cat.jpg';
      formData.append('image', { uri: imageUri, name: filename, type: 'image/jpeg' } as any);
    }
    try {
      await updateCategory({ id: categoryId, formData }).unwrap();
      showSuccess('Category updated');
      navigation.goBack();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  const displayImage = imageUri ?? category?.image?.url;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 40 }}>📷</Text>
              <Text style={styles.hint}>Tap to change</Text>
            </View>
          )}
        </TouchableOpacity>

        <AppInput
          label="Category Name"
          value={name}
          onChangeText={setName}
        />

        <AppButton title="Update Category" onPress={handleUpdate} loading={updating} size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: Spacing.xl },
  imagePicker: { alignSelf: 'center', marginBottom: Spacing.xl, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed' },
  previewImage: { width: 160, height: 160 },
  imagePlaceholder: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface },
  hint: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },
});

export default AdminEditCategoryScreen;
