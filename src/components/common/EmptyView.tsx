import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';
import AppButton from './AppButton';

interface EmptyViewProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyView: React.FC<EmptyViewProps> = ({
  icon = 'cube-outline',
  title = 'Nothing here',
  message,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={72} color={Colors.border} />
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {actionLabel && onAction && (
      <AppButton
        title={actionLabel}
        onPress={onAction}
        size="sm"
        style={styles.btn}
        fullWidth={false}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.base,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  btn: { marginTop: Spacing.base, paddingHorizontal: Spacing.xl },
});

export default EmptyView;
