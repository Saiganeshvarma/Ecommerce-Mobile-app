import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { useGetProductByIdQuery } from '@api/productApi';
import { useGetRelatedProductsQuery } from '@api/productApi';
import { useGetReviewsQuery } from '@api/reviewApi';
import ImageCarousel from '@components/product/ImageCarousel';
import RatingStars from '@components/common/RatingStars';
import StatusBadge from '@components/common/StatusBadge';
import ProductCard from '@components/product/ProductCard';
import LoadingScreen from '@components/common/LoadingScreen';
import ErrorView from '@components/common/ErrorView';
import AppButton from '@components/common/AppButton';
import { useWishlist } from '@hooks/useWishlist';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@hooks/useAuth';
import { formatCurrency, getDiscountPercent, getEffectivePrice, formatDate } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import AddReviewModal from './AddReviewModal';

type Route = RouteProp<HomeStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<HomeStackParamList>;

const ProductDetailScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { productId } = route.params;
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, isAdding, buyNow, isBuyingNow } = useCart();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  const { data, isLoading, isError, refetch } = useGetProductByIdQuery(productId);
  const { data: relatedData } = useGetRelatedProductsQuery(productId);
  const { data: reviewsData } = useGetReviewsQuery(productId);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data?.data?.product) return <ErrorView onRetry={refetch} />;

  const product = data.data.product;
  const effectivePrice = getEffectivePrice(product);
  const discount = product.discountPrice ? getDiscountPercent(product.price, product.discountPrice) : 0;
  const reviews = reviewsData?.data?.reviews ?? [];
  const related = relatedData?.data?.products ?? [];
  const inWishlist = isInWishlist(product._id);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <ImageCarousel images={product.images} />

        {/* Product info card */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleFlex}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.title}>{product.title}</Text>
            </View>
            {isAuthenticated && (
              <TouchableOpacity onPress={() => toggleWishlist(product._id)} style={styles.wishBtn}>
                <Ionicons
                  name={inWishlist ? 'heart' : 'heart-outline'}
                  size={26}
                  color={inWishlist ? Colors.error : Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <RatingStars rating={product.rating ?? 0} size={16} />
            <Text style={styles.ratingText}>
              {(product.rating ?? 0).toFixed(1)} ({product.numReviews ?? 0} reviews)
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(effectivePrice)}</Text>
            {discount > 0 && (
              <>
                <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Stock */}
          <View style={styles.stockRow}>
            <Text style={[styles.stock, { color: product.stock > 0 ? Colors.success : Colors.error }]}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </Text>
          </View>

          {/* CTA Buttons */}
          {product.stock > 0 && (
            <View style={styles.ctaRow}>
              <AppButton
                title="Add to Cart"
                onPress={() => addToCart(product._id)}
                loading={isAdding}
                variant="outline"
                size="lg"
                style={styles.ctaBtn}
                fullWidth={false}
              />
              <AppButton
                title="Buy Now"
                onPress={async () => {
                  const success = await buyNow(product._id);
                  if (success) {
                    // Walk up the navigator tree until we find MainTabs (which has CartTab)
                    let nav: any = navigation;
                    while (nav) {
                      const state = nav.getState?.();
                      const hasCartTab = state?.routeNames?.includes?.('CartTab');
                      if (hasCartTab) {
                        nav.navigate('CartTab', { screen: 'Checkout' });
                        break;
                      }
                      nav = nav.getParent?.();
                    }
                  }
                }}
                loading={isBuyingNow}
                size="lg"
                style={styles.ctaBtn}
                fullWidth={false}
              />
            </View>
          )}
        </View>

        {/* Tab selector */}
        <View style={styles.tabs}>
          {(['details', 'specs', 'reviews'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'details' && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {activeTab === 'specs' && (
            product.specifications && product.specifications.length > 0 ? (
              product.specifications.map((spec, i) => (
                <View key={i} style={[styles.specRow, i % 2 === 0 && styles.specRowAlt]}>
                  <Text style={styles.specKey}>{spec.key}</Text>
                  <Text style={styles.specVal}>{spec.value}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noContent}>No specifications available.</Text>
            )
          )}

          {activeTab === 'reviews' && (
            <View>
              {isAuthenticated && (
                <AppButton
                  title="Write a Review"
                  onPress={() => setShowReviewModal(true)}
                  variant="outline"
                  size="sm"
                  style={styles.reviewBtn}
                />
              )}
              {reviews.length === 0 ? (
                <Text style={styles.noContent}>No reviews yet. Be the first!</Text>
              ) : (
                reviews.map((review) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>{review.user?.name ?? 'User'}</Text>
                      <RatingStars rating={review.rating} size={12} />
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Related products */}
        {related.length > 0 && (
          <View style={styles.related}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {related.map((item) => (
                <View key={item._id} style={styles.relatedCard}>
                  <ProductCard
                    product={item}
                    onPress={() => navigation.push('ProductDetail', { productId: item._id })}
                    isInWishlist={isInWishlist(item._id)}
                    onWishlistToggle={isAuthenticated ? () => toggleWishlist(item._id) : undefined}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddReviewModal
        visible={showReviewModal}
        productId={productId}
        onClose={() => setShowReviewModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  infoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleFlex: { flex: 1, marginRight: Spacing.sm },
  brand: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 2, lineHeight: 28 },
  wishBtn: { padding: Spacing.xs },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.sm },
  ratingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  price: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  originalPrice: { fontSize: FontSize.md, color: Colors.textMuted, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: `${Colors.success}20`, borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.bold },
  stockRow: { marginBottom: Spacing.base },
  stock: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  ctaRow: { flexDirection: 'row', gap: Spacing.sm },
  ctaBtn: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  tabContent: { backgroundColor: Colors.surface, padding: Spacing.base, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  specRowAlt: { backgroundColor: Colors.background },
  specKey: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  specVal: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, flex: 1, textAlign: 'right' },
  noContent: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xl },
  reviewBtn: { marginBottom: Spacing.base },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingVertical: Spacing.md,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewerName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  reviewComment: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 20 },
  reviewDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  related: { padding: Spacing.base },
  relatedTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  relatedCard: { width: 180, marginRight: Spacing.sm },
});

export default ProductDetailScreen;
