import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { FontSize, FontWeight } from '@theme/typography';
import { formatCurrency, getDiscountPercent, getEffectivePrice, truncate } from '@utils/index';
import RatingStars from '@components/common/RatingStars';
import type { Product } from '@models/index';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onWishlistToggle?: () => void;
  isInWishlist?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  onPress,
  onWishlistToggle,
  isInWishlist = false,
}) => {
  const effectivePrice = getEffectivePrice(product);
  const discount = product.discountPrice
    ? getDiscountPercent(product.price, product.discountPrice)
    : 0;
  const imageUrl = product.images?.[0]?.url;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={Colors.border} />
          </View>
        )}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% off</Text>
          </View>
        )}
        {onWishlistToggle && (
          <TouchableOpacity style={styles.wishlistBtn} onPress={onWishlistToggle}>
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist ? Colors.error : Colors.textMuted}
            />
          </TouchableOpacity>
        )}
        {product.stock === 0 && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {truncate(product.title, 40)}
        </Text>
        <View style={styles.ratingRow}>
          <RatingStars rating={product.rating ?? 0} size={12} />
          {product.numReviews !== undefined && (
            <Text style={styles.reviews}>({product.numReviews})</Text>
          )}
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(effectivePrice)}</Text>
          {discount > 0 && (
            <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    width: '48%',
    margin: '1%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 160 },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffffcc',
    borderRadius: BorderRadius.full,
    padding: 6,
  },
  outOfStock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  outOfStockText: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  info: { padding: Spacing.sm },
  brand: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase' },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginVertical: 2,
    lineHeight: 18,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  reviews: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  originalPrice: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
});

export default ProductCard;
