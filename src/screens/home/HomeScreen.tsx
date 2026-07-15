import React, { useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, FlatList, RefreshControl, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { useGetFeaturedProductsQuery } from '@api/productApi';
import { useGetCategoriesQuery } from '@api/categoryApi';
import { useGetWishlistQuery } from '@api/wishlistApi';
import { useGetCartQuery } from '@api/cartApi';
import { setCartItemCount } from '@redux/slices/cartSlice';
import { setWishlistIds } from '@redux/slices/wishlistSlice';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { useAuth } from '@hooks/useAuth';
import { useWishlist } from '@hooks/useWishlist';
import { useCart } from '@hooks/useCart';
import ProductCard from '@components/product/ProductCard';
import SearchBar from '@components/common/SearchBar';
import { ProductListSkeleton } from '@components/common/SkeletonLoader';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
import type { Product, Category } from '@models/index';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const { data: featuredData, isLoading: loadingFeatured, refetch: refetchFeatured } =
    useGetFeaturedProductsQuery(8);
  const { data: catData, isLoading: loadingCats } = useGetCategoriesQuery();
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  // Sync wishlist & cart counts into Redux
  useEffect(() => {
    if (wishlistData?.data?.wishlist?.products) {
      dispatch(setWishlistIds(wishlistData.data.wishlist.products.map((p) => p._id)));
    }
  }, [wishlistData, dispatch]);

  useEffect(() => {
    if (cartData?.data?.cart) {
      const c = cartData.data.cart as any;
      const count = (c.items ?? c.products ?? []).length;
      dispatch(setCartItemCount(count));
    }
  }, [cartData, dispatch]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchFeatured();
    setRefreshing(false);
  }, [refetchFeatured]);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('ProductList', { categoryId: item._id, title: item.name })}
    >
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.categoryImage} />
      ) : (
        <View style={[styles.categoryImage, styles.categoryPlaceholder]}>
          <Text style={styles.categoryEmoji}>🏷️</Text>
        </View>
      )}
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

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
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'Guest'} 👋</Text>
          <Text style={styles.tagline}>What are you looking for?</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value=""
          onChangeText={() => {}}
          onPress={() => navigation.navigate('Search')}
          editable={false}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Summer Sale 🔥</Text>
          <Text style={styles.bannerSub}>Up to 50% off on top brands</Text>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => navigation.navigate('ProductList', { title: 'All Products' })}
          >
            <Text style={styles.bannerBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'All Products' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loadingCats ? (
            <View style={styles.categoryRow}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.categoryCard, { backgroundColor: Colors.border }]} />
              ))}
            </View>
          ) : (
            <FlatList
              data={catData?.data?.categories ?? []}
              renderItem={renderCategory}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          )}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'Featured', })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loadingFeatured ? (
            <ProductListSkeleton count={4} />
          ) : (
            <FlatList
              data={featuredData?.data?.products ?? []}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
            />
          )}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingTop: 50,
    paddingBottom: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  tagline: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  searchContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  banner: {
    margin: Spacing.base,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadow.md,
  },
  bannerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  bannerSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  bannerBtn: {
    marginTop: Spacing.base,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  bannerBtnText: { color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  section: { marginBottom: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  categoryRow: { flexDirection: 'row', paddingHorizontal: Spacing.base },
  categoriesList: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  categoryCard: {
    width: 80,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
  },
  categoryPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  categoryEmoji: { fontSize: 28 },
  categoryName: {
    fontSize: FontSize.xs,
    color: Colors.text,
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
  productRow: { paddingHorizontal: Spacing.sm },
});

export default HomeScreen;
