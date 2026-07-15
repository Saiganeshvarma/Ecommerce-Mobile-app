import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
import { FontSize, FontWeight } from '@theme/typography';
import { SORT_OPTIONS } from '@constants/index';
import AppButton from '@components/common/AppButton';

export interface FilterState {
  minPrice?: string;
  maxPrice?: string;
  minRating?: number;
  sort?: string;
}

interface ProductFilterSheetProps {
  visible: boolean;
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

const RATINGS = [1, 2, 3, 4, 5];

const ProductFilterSheet: React.FC<ProductFilterSheetProps> = ({
  visible,
  initialFilters,
  onApply,
  onClose,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const reset = () =>
    setFilters({ minPrice: '', maxPrice: '', minRating: undefined, sort: undefined });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter & Sort</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sort */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.option}
                onPress={() => setFilters({ ...filters, sort: opt.value })}
              >
                <Text style={[styles.optionText, filters.sort === opt.value && styles.optionActive]}>
                  {opt.label}
                </Text>
                {filters.sort === opt.value && (
                  <Ionicons name="checkmark" size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            {/* Price Range */}
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min ₹"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                value={filters.minPrice}
                onChangeText={(t) => setFilters({ ...filters, minPrice: t })}
              />
              <Text style={styles.priceSep}>—</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max ₹"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                value={filters.maxPrice}
                onChangeText={(t) => setFilters({ ...filters, maxPrice: t })}
              />
            </View>

            {/* Rating */}
            <Text style={styles.sectionTitle}>Min Rating</Text>
            <View style={styles.ratingRow}>
              {RATINGS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.ratingChip,
                    filters.minRating === r && styles.ratingChipActive,
                  ]}
                  onPress={() =>
                    setFilters({ ...filters, minRating: filters.minRating === r ? undefined : r })
                  }
                >
                  <Ionicons name="star" size={12} color={filters.minRating === r ? '#fff' : Colors.star} />
                  <Text style={[styles.ratingText, filters.minRating === r && { color: '#fff' }]}>
                    {r}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <AppButton title="Reset" onPress={reset} variant="outline" size="sm" style={styles.actionBtn} fullWidth={false} />
            <AppButton title="Apply Filters" onPress={() => { onApply(filters); onClose(); }} size="sm" style={styles.actionBtn} fullWidth={false} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.base,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  optionText: { fontSize: FontSize.md, color: Colors.text },
  optionActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  priceSep: { fontSize: FontSize.lg, color: Colors.textMuted },
  ratingRow: { flexDirection: 'row', gap: Spacing.sm },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.star,
  },
  ratingChipActive: { backgroundColor: Colors.star, borderColor: Colors.star },
  ratingText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: { flex: 1 },
});

export default ProductFilterSheet;
