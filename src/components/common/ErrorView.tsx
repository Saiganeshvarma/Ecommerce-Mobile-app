import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';
import AppButton from './AppButton';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'Something went wrong.',
  onRetry,
}) => (
  <View style={styles.container}>
    <Ionicons name="alert-circle-outline" size={56} color={Colors.error} />
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <AppButton
        title="Retry"
        onPress={onRetry}
        variant="outline"
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
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
  },
  btn: { paddingHorizontal: Spacing.xl },
});

export default ErrorView;
