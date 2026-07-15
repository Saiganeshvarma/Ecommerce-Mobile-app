import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '@models/index';
import { useGetAdminUsersQuery, useDeleteAdminUserMutation } from '@api/adminApi';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import ErrorView from '@components/common/ErrorView';
import SearchBar from '@components/common/SearchBar';
import ConfirmModal from '@components/common/ConfirmModal';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage, formatDate } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '@models/index';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const AdminUsersScreen = () => {
  const navigation = useNavigation<Nav>();
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminUsersQuery(search ? { search } : undefined);
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId).unwrap();
      showSuccess('User deleted');
      setDeleteId(null);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const users = data?.data?.users ?? [];

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AdminUserDetail', { userId: item._id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.phone}>{item.phone ?? '—'}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.roleBadge, item.role === 'admin' && styles.adminBadge]}>
          <Text style={[styles.roleText, item.role === 'admin' && styles.adminText]}>{item.role}</Text>
        </View>
        <TouchableOpacity onPress={() => setDeleteId(item._id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search users..."
          />
        </View>
        {users.length === 0 ? (
          <EmptyView icon="people-outline" title="No users found" />
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
          />
        )}
      </View>
      <ConfirmModal
        visible={!!deleteId}
        title="Delete User"
        message="This will permanently delete the user."
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
  searchBar: { padding: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  list: { padding: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  email: { fontSize: FontSize.xs, color: Colors.textSecondary },
  phone: { fontSize: FontSize.xs, color: Colors.textMuted },
  right: { alignItems: 'flex-end', gap: Spacing.xs },
  roleBadge: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  adminBadge: { backgroundColor: `${Colors.accent}20`, borderColor: Colors.accent },
  roleText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase' },
  adminText: { color: Colors.accent },
  deleteBtn: { padding: 4 },
});

export default AdminUsersScreen;
