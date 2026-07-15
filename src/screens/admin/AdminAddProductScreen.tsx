import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCreateProductMutation } from '@api/productApi';
import { useGetCategoriesQuery } from '@api/categoryApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { productSchema, type ProductFormData } from '@validations/product.validation';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';

const AdminAddProductScreen = () => {
  const navigation = useNavigation();
  const { showSuccess, showError } = useToast();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: catData } = useGetCategoriesQuery();
  const [images, setImages] = useState<string[]>([]);

  const categories = catData?.data?.categories ?? [];

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: '', description: '', brand: '', category: '',
      price: 0, stock: 0, featured: false,
    },
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets.slice(0, 10).map((a) => a.uri));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) { showError('Please add at least one product image'); return; }
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });
    images.forEach((uri, i) => {
      const filename = uri.split('/').pop() ?? `image${i}.jpg`;
      formData.append('images', { uri, name: filename, type: 'image/jpeg' } as any);
    });
    try {
      await createProduct(formData).unwrap();
      showSuccess('Product created');
      navigation.goBack();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Image picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.previewImage} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 40 }}>📷</Text>
              <Text style={styles.imageHint}>Tap to add images (max 10)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Category selector */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.catChip, watch('category') === cat._id && styles.catChipActive]}
              onPress={() => setValue('category', cat._id)}
            >
              <Text style={[styles.catText, watch('category') === cat._id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

        {[
          { name: 'title', label: 'Product Title', placeholder: 'iPhone 15 Pro' },
          { name: 'brand', label: 'Brand', placeholder: 'Apple' },
          { name: 'description', label: 'Description', placeholder: 'Detailed product description...', multiline: true },
          { name: 'price', label: 'Price (₹)', placeholder: '49999', keyboardType: 'number-pad' },
          { name: 'discountPrice', label: 'Discount Price (₹, optional)', placeholder: '44999', keyboardType: 'number-pad' },
          { name: 'stock', label: 'Stock Quantity', placeholder: '50', keyboardType: 'number-pad' },
        ].map(({ name, label, placeholder, multiline, keyboardType }) => (
          <Controller
            key={name}
            control={control}
            name={name as keyof ProductFormData}
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={label}
                placeholder={placeholder}
                value={String(value ?? '')}
                onChangeText={(t) => onChange(name === 'price' || name === 'discountPrice' || name === 'stock' ? Number(t) || 0 : t)}
                error={(errors as any)[name]?.message}
                multiline={multiline}
                keyboardType={keyboardType as any}
                style={multiline ? { height: 80, textAlignVertical: 'top' } : undefined}
              />
            )}
          />
        ))}

        {/* Featured toggle */}
        <Controller
          control={control}
          name="featured"
          render={({ field: { onChange, value } }) => (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Featured Product</Text>
              <Switch value={value ?? false} onValueChange={onChange} trackColor={{ true: Colors.primary }} />
            </View>
          )}
        />

        <AppButton title="Create Product" onPress={handleSubmit(onSubmit)} loading={isLoading} size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.base },
  imagePicker: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: BorderRadius.xl, marginBottom: Spacing.base,
    minHeight: 120, overflow: 'hidden',
  },
  previewImage: { width: 100, height: 100, marginRight: 8 },
  imagePlaceholder: { padding: Spacing.xl, alignItems: 'center' },
  imageHint: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing.xs },
  catScroll: { marginBottom: Spacing.sm },
  catChip: {
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 6, marginRight: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.sm, color: Colors.text },
  catTextActive: { color: '#fff', fontWeight: FontWeight.semibold },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginBottom: Spacing.sm },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  toggleLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
});

export default AdminAddProductScreen;
