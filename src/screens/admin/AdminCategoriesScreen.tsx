import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '@models/index';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '@api/categoryApi';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import ErrorView from '@components/common/ErrorView';
import ConfirmModal from '@components/common/ConfirmModal';
import AppButton from '@components/common/AppButton';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import type { Category } from '@models/index';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const AdminCategoriesScreen = () => {
  const navigation = useNavigation<Nav>();
  const { showSuccess, showError } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId).unwrap();
      showSuccess('Category deleted');
      setDeleteId(null);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const categories = data?.data?.categories ?? [];

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.card}>
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 24 }}>🏷️</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.slug}>{item.slug}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminEditCategory', { categoryId: item._id })}>
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
        {categories.length === 0 ? (
          <EmptyView icon="grid-outline" title="No categories" />
        ) : (
          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
          />
        )}
        <View style={styles.fab}>
          <AppButton title="+ Add Category" onPress={() => navigation.navigate('AdminAddCategory')} size="md" />
        </View>
      </View>
      <ConfirmModal
        visible={!!deleteId}
        title="Delete Category"
        message="This will permanently delete this category."
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
  image: { width: 64, height: 64, backgroundColor: Colors.border },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, padding: Spacing.md },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  slug: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.md },
  fab: { position: 'absolute', bottom: Spacing.base, left: Spacing.base, right: Spacing.base },
});

export default AdminCategoriesScreen;
