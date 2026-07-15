import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@models/index';
import { useLogoutApiMutation } from '@api/authApi';
import { logout } from '@redux/slices/authSlice';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import AppButton from '@components/common/AppButton';
import ConfirmModal from '@components/common/ConfirmModal';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, badge, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={20} color={danger ? Colors.error : Colors.primary} />
    </View>
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();
  const { showSuccess } = useToast();
  const [logoutApi] = useLogoutApiMutation();
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = async () => {
    try { await logoutApi().unwrap(); } catch {}
    dispatch(logout());
    showSuccess('Logged out successfully');
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            {user?.profileImage?.url ? (
              <Image source={{ uri: user.profileImage.url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem icon="person-outline" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem icon="lock-closed-outline" label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
          <MenuItem icon="location-outline" label="My Addresses" onPress={() => navigation.navigate('AddressList')} />
        </View>

        {/* Orders section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <MenuItem icon="cube-outline" label="My Orders" onPress={() => navigation.navigate('OrderHistory')} />
        </View>

        {/* Admin section */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>
            <MenuItem
              icon="shield-outline"
              label="Admin Panel"
              onPress={() => navigation.getParent()?.getParent()?.navigate('Admin' as never)}
            />
          </View>
        )}

        {/* Logout */}
        <View style={styles.section}>
          <MenuItem
            icon="log-out-outline"
            label="Log Out"
            onPress={() => setLogoutModal(true)}
            danger
          />
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <ConfirmModal
        visible={logoutModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModal(false)}
        destructive
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 56,
    paddingBottom: Spacing['2xl'],
    alignItems: 'center',
  },
  avatarWrapper: { marginBottom: Spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarInitial: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, color: '#fff' },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  email: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  adminBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  adminBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff' },
  section: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIconDanger: { backgroundColor: `${Colors.error}15` },
  menuLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
  menuLabelDanger: { color: Colors.error },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
  },
  badgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
});

export default ProfileScreen;
