import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AdminStackParamList } from '@models/index';
import { useGetAdminUserByIdQuery, useUpdateAdminUserMutation } from '@api/adminApi';
import LoadingScreen from '@components/common/LoadingScreen';
import ErrorView from '@components/common/ErrorView';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage, formatDate } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

type Route = RouteProp<AdminStackParamList, 'AdminUserDetail'>;

const AdminUserDetailScreen = () => {
  const route = useRoute<Route>();
  const { userId } = route.params;
  const { showSuccess, showError } = useToast();
  const { data, isLoading, isError, refetch } = useGetAdminUserByIdQuery(userId);
  const [updateUser, { isLoading: updating }] = useUpdateAdminUserMutation();

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const user = data?.data?.user;
  if (!user) return <ErrorView />;

  const toggleRole = async () => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUser({ id: userId, role: newRole }).unwrap();
      showSuccess(`User role changed to ${newRole}`);
      refetch();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const rows = [
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phone ?? '—' },
    { label: 'Role', value: user.role },
    { label: 'Verified', value: user.isVerified ? 'Yes' : 'No' },
    { label: 'Joined', value: user.createdAt ? formatDate(user.createdAt) : '—' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={[styles.roleBadge, user.role === 'admin' && styles.adminBadge]}>
          <Text style={[styles.roleText, user.role === 'admin' && styles.adminText]}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {rows.map(({ label, value }) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.roleBtn, user.role === 'admin' ? styles.demoteBtn : styles.promoteBtn]}
          onPress={toggleRole}
          disabled={updating}
        >
          <Text style={styles.roleBtnText}>
            {updating ? 'Updating...' : user.role === 'admin' ? 'Remove Admin Role' : 'Make Admin'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  avatarSection: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.surface },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, color: '#fff' },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  roleBadge: { marginTop: Spacing.xs, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  adminBadge: { backgroundColor: `${Colors.accent}20`, borderColor: Colors.accent },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase' },
  adminText: { color: Colors.accent },
  card: { backgroundColor: Colors.surface, margin: Spacing.sm, borderRadius: BorderRadius.lg, padding: Spacing.base, ...Shadow.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  actions: { padding: Spacing.base },
  roleBtn: { borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center' },
  promoteBtn: { backgroundColor: Colors.primary },
  demoteBtn: { backgroundColor: Colors.error },
  roleBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
});

export default AdminUserDetailScreen;
