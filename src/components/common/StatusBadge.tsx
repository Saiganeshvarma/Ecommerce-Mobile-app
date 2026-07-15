import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { capitalize, getOrderStatusColor, getPaymentStatusColor } from '@utils/index';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  const color = type === 'order' ? getOrderStatusColor(status) : getPaymentStatusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{capitalize(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});

export default StatusBadge;
