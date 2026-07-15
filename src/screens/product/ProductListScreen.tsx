import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, FlatList, StyleSheet, Text, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { useGetProductsQuery } from '@api/productApi';
import ProductCard from '@components/product/ProductCard';
import { ProductListSkeleton } from '@components/common/SkeletonLoader';
import EmptyView from '@components/common/EmptyView';
import ErrorView from '@components/common/ErrorView';
import ProductFilterSheet, { FilterState } from '@components/product/ProductFilterSheet';
import SearchBar from '@components/common/SearchBar';
import { useWishlist } from '@hooks/useWishlist';
import { useAuth } from '@hooks/useAuth';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';
import type { Product } from '@models/index';

type Route = RouteProp<HomeStackParamList, 'ProductList'>;
type Nav = NativeStackNavigationProp<HomeStackParamList>;

const ProductListScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { categoryId, title = 'Products' } = route.params ?? {};
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [search, setSearch] = useState('');

  const queryParams = {
    page,
    limit: 10,
    category: categoryId,
    search: search || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    minRating: filters.minRating,
    sort: filters.sort,
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(queryParams);

  const products = data?.data?.products ?? [];
  const pagination = data?.data?.pagination;

  const handleLoadMore = useCallback(() => {
    if (!isFetching && pagination?.hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [isFetching, pagination]);

  const handleApplyFilters = (f: FilterState) => {
    setFilters(f);
    setPage(1);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      onWishlistToggle={isAuthenticated ? () => toggleWishlist(item._id) : undefined}
      isInWishlist={isInWishlist(item._id)}
    />
  );

  if (isError) return <ErrorView onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onSubmit={() => setPage(1)}
          onClear={() => { setSearch(''); setPage(1); }}
          placeholder={`Search in ${title}...`}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {Object.values(filters).some(Boolean) && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Count */}
      {pagination && (
        <Text style={styles.count}>{pagination.total} products found</Text>
      )}

      {isLoading ? (
        <ProductListSkeleton count={6} />
      ) : products.length === 0 ? (
        <EmptyView
          icon="cube-outline"
          title="No products found"
          message="Try adjusting your filters."
          actionLabel="Clear Filters"
          onAction={() => { setFilters({}); setSearch(''); setPage(1); }}
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching ? <ActivityIndicator color={Colors.primary} style={{ margin: 16 }} /> : null
          }
        />
      )}

      <ProductFilterSheet
        visible={filterVisible}
        initialFilters={filters}
        onApply={handleApplyFilters}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  filterBtn: { position: 'relative', padding: Spacing.xs },
  filterIcon: { fontSize: 24 },
  filterDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  list: { padding: Spacing.sm },
  row: { justifyContent: 'space-between' },
});

export default ProductListScreen;
