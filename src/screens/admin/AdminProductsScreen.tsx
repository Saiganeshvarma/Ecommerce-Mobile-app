import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '@models/index';
import { useGetProductsQuery, useDeleteProductMutation } from '@api/productApi';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import ErrorView from '@components/common/ErrorView';
import ConfirmModal from '@components/common/ConfirmModal';
import AppButton from '@components/common/AppButton';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage, formatCurrency } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@models/index';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const AdminProductsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { showSuccess, showError } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page] = useState(1);

  const { data, isLoading, isError, refetch } = useGetProductsQuery({ page, limit: 20 });
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId).unwrap();
      showSuccess('Product deleted');
      setDeleteId(null);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const products = data?.data?.products ?? [];

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.images?.[0]?.url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.price}>{formatCurrency(item.discountPrice ?? item.price)}</Text>
        <Text style={styles.stock}>Stock: {item.stock}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminEditProduct', { productId: item._id })}>
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDeleteId(item._id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        {products.length === 0 ? (
          <EmptyView icon="cube-outline" title="No products" />
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
          />
        )}
        <View style={styles.fab}>
          <AppButton title="+ Add Product" onPress={() => navigation.navigate('AdminAddProduct')} size="md" />
        </View>
      </View>
      <ConfirmModal
        visible={!!deleteId}
        title="Delete Product"
        message="This will permanently delete the product and its images."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        destructive
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.sm, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  image: { width: 72, height: 72, backgroundColor: Colors.border },
  info: { flex: 1, padding: Spacing.sm },
  title: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  brand: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 2 },
  stock: { fontSize: FontSize.xs, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.md },
  fab: { position: 'absolute', bottom: Spacing.base, left: Spacing.base, right: Spacing.base },
});

export default AdminProductsScreen;
