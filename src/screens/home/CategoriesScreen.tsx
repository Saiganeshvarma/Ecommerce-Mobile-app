import React from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { useGetCategoriesQuery } from '@api/categoryApi';
import LoadingScreen from '@components/common/LoadingScreen';
import ErrorView from '@components/common/ErrorView';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import type { Category } from '@models/index';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const CategoriesScreen = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, refetch } = useGetCategoriesQuery();

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductList', { categoryId: item._id, title: item.name })}
      activeOpacity={0.85}
    >
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.emoji}>🏷️</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop by Category</Text>
      </View>
      <FlatList
        data={data?.data?.categories ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  list: { padding: Spacing.sm },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%',
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  image: { width: '100%', height: 140, backgroundColor: Colors.border },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48 },
  overlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  name: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});

export default CategoriesScreen;
