import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@theme/colors';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
import { FontSize, FontWeight } from '@theme/typography';
import AppButton from './AppButton';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading,
  destructive = false,
}) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
      <View style={styles.modal}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <AppButton
            title={cancelLabel}
            onPress={onCancel}
            variant="outline"
            size="sm"
            style={styles.btn}
            fullWidth={false}
          />
          <AppButton
            title={confirmLabel}
            onPress={onConfirm}
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            loading={loading}
            style={styles.btn}
            fullWidth={false}
          />
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    ...Shadow.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  btn: { paddingHorizontal: Spacing.base },
});

export default ConfirmModal;
