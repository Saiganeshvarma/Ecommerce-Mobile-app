import React, { useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, ActivityIndicator, Switch, Text,
  TouchableOpacity, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AdminStackParamList } from '@models/index';
import * as ImagePicker from 'expo-image-picker';
import { useGetProductByIdQuery, useUpdateProductMutation } from '@api/productApi';
import { useGetCategoriesQuery } from '@api/categoryApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import AppButton from '@components/common/AppButton';
import AppInput from '@components/common/AppInput';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';

type Route = RouteProp<AdminStackParamList, 'AdminEditProduct'>;

interface EditProductFormValues {
  title: string;
  brand: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  featured: boolean;
  category: string;
}

const AdminEditProductScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { productId } = route.params;
  const { showSuccess, showError } = useToast();
  const [newImages, setNewImages] = useState<string[]>([]);

  const { data, isLoading } = useGetProductByIdQuery(productId);
  const { data: catData } = useGetCategoriesQuery();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const product = data?.data?.product;
  const categories = catData?.data?.categories ?? [];

  const { control, handleSubmit, reset, setValue, watch } = useForm<EditProductFormValues>({
    defaultValues: {
      title: '',
      brand: '',
      description: '',
      price: '',
      discountPrice: '',
      stock: '',
      featured: false,
      category: '',
    },
  });

  // Populate form once product data is available
  useEffect(() => {
    if (product) {
      reset({
        title: product.title ?? '',
        brand: product.brand ?? '',
        description: product.description ?? '',
        price: String(product.price ?? ''),
        discountPrice: String(product.discountPrice ?? ''),
        stock: String(product.stock ?? ''),
        featured: product.featured ?? false,
        category: typeof product.category === 'string' ? product.category : (product.category as any)?._id ?? '',
      });
    }
  }, [product, reset]);

  const selectedCategory = watch('category');

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewImages(result.assets.slice(0, 10).map((a) => a.uri));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const onSubmit = async (formValues: EditProductFormValues) => {
    const formData = new FormData();
    formData.append('title', formValues.title);
    formData.append('brand', formValues.brand);
    formData.append('description', formValues.description);
    formData.append('price', formValues.price);
    formData.append('stock', formValues.stock);
    formData.append('category', formValues.category);
    formData.append('featured', String(formValues.featured));
    if (formValues.discountPrice) formData.append('discountPrice', formValues.discountPrice);
    newImages.forEach((uri, i) => {
      const filename = uri.split('/').pop() ?? `image${i}.jpg`;
      formData.append('images', { uri, name: filename, type: 'image/jpeg' } as any);
    });
    try {
      await updateProduct({ id: productId, formData }).unwrap();
      showSuccess('Product updated');
      navigation.goBack();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Existing images preview */}
        {product?.images && product.images.length > 0 && newImages.length === 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
            {product.images.map((img, i) => (
              <Image key={i} source={{ uri: img.url }} style={styles.existingImage} />
            ))}
          </ScrollView>
        )}

        {/* New image picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
          {newImages.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {newImages.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.previewImage} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 32 }}>📷</Text>
              <Text style={styles.imageHint}>Tap to replace images</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Category selector */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.catChip, selectedCategory === cat._id && styles.catChipActive]}
              onPress={() => setValue('category', cat._id)}
            >
              <Text style={[styles.catText, selectedCategory === cat._id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Form fields */}
        {([
          { name: 'title', label: 'Title', keyboard: 'default' },
          { name: 'brand', label: 'Brand', keyboard: 'default' },
          { name: 'description', label: 'Description', keyboard: 'default', multiline: true },
          { name: 'price', label: 'Price (₹)', keyboard: 'number-pad' },
          { name: 'discountPrice', label: 'Discount Price (₹, optional)', keyboard: 'number-pad' },
          { name: 'stock', label: 'Stock Quantity', keyboard: 'number-pad' },
        ] as const).map(({ name, label, keyboard, multiline }) => (
          <Controller
            key={name}
            control={control}
            name={name as keyof EditProductFormValues}
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={label}
                value={String(value)}
                onChangeText={onChange}
                keyboardType={keyboard as any}
                multiline={multiline}
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
              <Switch value={value} onValueChange={onChange} trackColor={{ true: Colors.primary }} />
            </View>
          )}
        />

        <AppButton title="Update Product" onPress={handleSubmit(onSubmit)} loading={updating} size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: Spacing.base },
  imageRow: { marginBottom: Spacing.sm },
  existingImage: { width: 80, height: 80, borderRadius: BorderRadius.md, marginRight: 8 },
  imagePicker: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: BorderRadius.xl, marginBottom: Spacing.base,
    minHeight: 80, overflow: 'hidden',
  },
  previewImage: { width: 80, height: 80, marginRight: 8 },
  imagePlaceholder: { padding: Spacing.base, alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  imageHint: { fontSize: FontSize.sm, color: Colors.textMuted },
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
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  toggleLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
});

export default AdminEditProductScreen;
