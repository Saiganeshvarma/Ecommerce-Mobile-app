import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onRate,
}) => (
  <View style={styles.container}>
    {Array.from({ length: maxRating }, (_, i) => {
      const filled = i < Math.floor(rating);
      const half = !filled && i < rating;
      const iconName = filled ? 'star' : half ? 'star-half' : 'star-outline';

      return interactive ? (
        <TouchableOpacity key={i} onPress={() => onRate?.(i + 1)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
          <Ionicons name={iconName} size={size} color={filled || half ? Colors.star : Colors.starEmpty} />
        </TouchableOpacity>
      ) : (
        <Ionicons key={i} name={iconName} size={size} color={filled || half ? Colors.star : Colors.starEmpty} />
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});

export default RatingStars;
