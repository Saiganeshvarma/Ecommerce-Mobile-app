import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { useGetWishlistQuery } from '@api/wishlistApi';
import { setWishlistIds } from '@redux/slices/wishlistSlice';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { useWishlist } from '@hooks/useWishlist';
import { useAuth } from '@hooks/useAuth';
import ProductCard from '@components/product/ProductCard';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';
import type { Product } from '@models/index';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const WishlistScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { data, isLoading, refetch } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (data?.data?.wishlist?.products) {
      dispatch(setWishlistIds(data.data.wishlist.products.map((p) => p._id)));
    }
  }, [data, dispatch]);

  if (!isAuthenticated) {
    return (
      <EmptyView
        icon="heart-outline"
        title="Sign in to view wishlist"
        message="Save your favourite products for later"
      />
    );
  }

  if (isLoading) return <LoadingScreen />;

  const products = data?.data?.wishlist?.products ?? [];

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      onWishlistToggle={() => toggleWishlist(item._id)}
      isInWishlist={isInWishlist(item._id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        {products.length > 0 && (
          <Text style={styles.count}>{products.length} items</Text>
        )}
      </View>

      {products.length === 0 ? (
        <EmptyView
          icon="heart-outline"
          title="Your wishlist is empty"
          message="Tap the heart on any product to save it here"
          actionLabel="Browse Products"
          onAction={() => navigation.getParent()?.navigate('HomeTab' as never)}
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
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  count: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  list: { padding: Spacing.sm },
  row: { justifyContent: 'space-between' },
});

export default WishlistScreen;
