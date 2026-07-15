import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@models/index';
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from '@api/addressApi';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import ErrorView from '@components/common/ErrorView';
import ConfirmModal from '@components/common/ConfirmModal';
import AppButton from '@components/common/AppButton';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import type { Address } from '@models/index';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const AddressListScreen = () => {
  const navigation = useNavigation<Nav>();
  const { showSuccess, showError } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetAddressesQuery();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();
  const [setDefault] = useSetDefaultAddressMutation();

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const addresses = data?.data?.addresses ?? [];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAddress(deleteId).unwrap();
      showSuccess('Address deleted');
      setDeleteId(null);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id).unwrap();
      showSuccess('Default address updated');
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const renderItem = ({ item }: { item: Address }) => (
    <View style={[styles.card, item.isDefault && styles.defaultCard]}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>✓ Default</Text>
        </View>
      )}
      <Text style={styles.name}>{item.fullName}</Text>
      <Text style={styles.line}>{item.houseNo}, {item.street}</Text>
      <Text style={styles.line}>{item.city}, {item.state} – {item.pincode}</Text>
      <Text style={styles.line}>{item.country}</Text>
      <Text style={styles.phone}>📞 {item.mobile}</Text>

      <View style={styles.actions}>
        {!item.isDefault && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(item._id)}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.success }]}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EditAddress', { addressId: item._id })}>
          <Ionicons name="create-outline" size={16} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setDeleteId(item._id)}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        {addresses.length === 0 ? (
          <EmptyView
            icon="location-outline"
            title="No addresses saved"
            message="Add a delivery address to get started"
            actionLabel="Add Address"
            onAction={() => navigation.navigate('AddAddress')}
          />
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
          />
        )}
        <View style={styles.footer}>
          <AppButton
            title="+ Add New Address"
            onPress={() => navigation.navigate('AddAddress')}
            size="lg"
          />
        </View>
      </View>

      <ConfirmModal
        visible={!!deleteId}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        destructive
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.sm, paddingBottom: 80 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  defaultCard: { borderColor: Colors.primary, borderWidth: 1.5 },
  defaultBadge: {
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  defaultText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  line: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  phone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: Spacing.base,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default AddressListScreen;
