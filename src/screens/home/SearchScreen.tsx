import React, { useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, Text, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { useGetProductsQuery } from '@api/productApi';
import SearchBar from '@components/common/SearchBar';
import ProductCard from '@components/product/ProductCard';
import { ProductListSkeleton } from '@components/common/SkeletonLoader';
import EmptyView from '@components/common/EmptyView';
import { useWishlist } from '@hooks/useWishlist';
import { useAuth } from '@hooks/useAuth';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';
import { FontSize, FontWeight } from '@theme/typography';
import type { Product } from '@models/index';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const RECENT_TAGS = ['iPhone', 'Samsung', 'Laptop', 'Earphones', 'Shoes'];

const SearchScreen = () => {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useGetProductsQuery(
    { search: submitted, limit: 20 },
    { skip: !submitted }
  );

  const handleSubmit = useCallback(() => setSubmitted(query), [query]);
  const handleClear = useCallback(() => { setQuery(''); setSubmitted(''); }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      onWishlistToggle={isAuthenticated ? () => toggleWishlist(item._id) : undefined}
      isInWishlist={isInWishlist(item._id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.searchFlex}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSubmit}
            onClear={handleClear}
            placeholder="Search products..."
          />
        </View>
      </View>

      {!submitted && (
        <View style={styles.tags}>
          <Text style={styles.tagsTitle}>Popular Searches</Text>
          <View style={styles.tagRow}>
            {RECENT_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => { setQuery(tag); setSubmitted(tag); }}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isLoading && submitted ? (
        <ProductListSkeleton count={6} />
      ) : data?.data?.products?.length === 0 ? (
        <EmptyView
          icon="search-outline"
          title="No results found"
          message={`No products match "${submitted}"`}
        />
      ) : (
        <FlatList
          data={data?.data?.products ?? []}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.sm },
  backText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  searchFlex: { flex: 1 },
  tags: { padding: Spacing.base },
  tagsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { fontSize: FontSize.sm, color: Colors.text },
  list: { padding: Spacing.sm },
  row: { justifyContent: 'space-between' },
});

export default SearchScreen;
