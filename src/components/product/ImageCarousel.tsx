import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '@theme/colors';
import { BorderRadius } from '@theme/spacing';
import type { ImageData } from '@models/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 320;

interface ImageCarouselProps {
  images: ImageData[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleThumbnailPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.mainImage, styles.placeholder]} />
    );
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        )}
      />
      {/* Dot indicators */}
      <View style={styles.dots}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
      {/* Thumbnails */}
      {images.length > 1 && (
        <View style={styles.thumbnails}>
          {images.map((img, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleThumbnailPress(i)}
              style={[styles.thumbnailWrapper, i === activeIndex && styles.thumbnailActive]}
            >
              <Image source={{ uri: img.url }} style={styles.thumbnail} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainImage: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: Colors.background,
  },
  placeholder: { backgroundColor: Colors.border },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.primary, width: 20 },
  thumbnails: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 8,
  },
  thumbnailWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: { borderColor: Colors.primary },
  thumbnail: { width: 56, height: 56 },
});

export default ImageCarousel;
