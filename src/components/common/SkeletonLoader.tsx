import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '@theme/colors';
import { BorderRadius } from '@theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: Colors.border },
        { opacity },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <View style={skeletonStyles.card}>
    <Skeleton height={160} borderRadius={8} style={skeletonStyles.image} />
    <Skeleton height={14} width="80%" style={skeletonStyles.line} />
    <Skeleton height={12} width="50%" style={skeletonStyles.line} />
    <Skeleton height={16} width="40%" style={skeletonStyles.line} />
  </View>
);

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <View style={skeletonStyles.grid}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </View>
);

const skeletonStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '48%',
    margin: '1%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 8,
    overflow: 'hidden',
  },
  image: { marginBottom: 8 },
  line: { marginBottom: 6 },
});
