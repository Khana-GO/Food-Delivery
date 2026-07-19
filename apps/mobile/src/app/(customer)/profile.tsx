import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth, AuthRole } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout, switchRole } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const SETTINGS_MENU = [
    { id: '1', title: 'Edit Profile', icon: '👤', href: null },
    { id: '2', title: 'My Addresses', icon: '📍', href: null },
    { id: '3', title: 'Payment Methods', icon: '💳', href: null },
    { id: '4', title: 'Order History', icon: '🧾', href: null },
    { id: '5', title: 'Favorites', icon: '🤍', href: null },
    { id: '6', title: 'Notifications Settings', icon: '🔔', href: null },
    { id: '7', title: 'Become a Driver', icon: '🚚', href: '/(customer)/become-driver' },
    { id: '8', title: 'Help & Support', icon: '❓', href: '/(customer)/chat' },
    { id: '9', title: 'Refer & Earn', icon: '🎁', href: null },
    { id: '10', title: 'Privacy Policy', icon: '🛡️', href: null },
    { id: '11', title: 'Terms of Service', icon: '📄', href: null },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/auth/login' as any);
  };

  const handleDevRoleSwitch = (newRole: AuthRole) => {
    switchRole(newRole);
    if (newRole === 'CUSTOMER') router.replace('/(customer)' as any);
    if (newRole === 'DRIVER') router.replace('/(driver)' as any);
    if (newRole === 'RESTAURANT_OWNER') router.replace('/(restaurant)' as any);
    if (newRole === 'ADMIN') router.replace('/(admin)' as any);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
              {user?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.phone}>{user?.phone}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>128</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Favorite Restaurants</Text>
            <Text style={styles.statValue}>14</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Loyalty Points</Text>
            <Text style={styles.statValuePoint}>2,450</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuGroup}>
          {SETTINGS_MENU.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => item.href && router.push(item.href as any)}
            >
              <View style={styles.menuIconBg}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuItemSingle}>
          <View style={styles.menuIconBg}>
            <Text style={styles.menuIcon}>🌙</Text>
          </View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>Dark Mode</Text>
            <Text style={styles.menuSub}>Switch appearance</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={setIsDarkMode}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>KhanaGo v2.4.1</Text>

        {/* Dev Role Switcher */}
        <View style={styles.devSection}>
          <Text style={styles.devTitle}>🛠️ Dev: Switch Role Views</Text>
          <View style={styles.devRow}>
             <TouchableOpacity style={styles.devBtn} onPress={() => handleDevRoleSwitch('DRIVER')}>
                <Text style={styles.devBtnText}>Driver</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.devBtn} onPress={() => handleDevRoleSwitch('RESTAURANT_OWNER')}>
                <Text style={styles.devBtnText}>Restaurant</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.devBtn} onPress={() => handleDevRoleSwitch('ADMIN')}>
                <Text style={styles.devBtnText}>Admin</Text>
             </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  container: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarEmoji: { fontSize: 40 },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cameraIcon: { fontSize: 12 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  verifiedText: { color: '#16A34A', fontSize: 10, fontWeight: '600' },
  email: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  phone: { fontSize: 13, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 8, minHeight: 28 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  statValuePoint: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  menuGroup: { gap: 12, marginBottom: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  menuItemSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: { fontSize: 18 },
  menuTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark },
  menuArrow: { fontSize: 20, color: Colors.textLight },
  menuTextCol: { flex: 1 },
  menuSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: Radius.xl,
    backgroundColor: Colors.errorLight,
    gap: 8,
    marginBottom: 16,
  },
  logoutIcon: { fontSize: 16 },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', color: Colors.textLight, fontSize: 12, marginBottom: 32 },
  devSection: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: Radius.lg },
  devTitle: { fontSize: 13, fontWeight: '700', color: '#B45309', marginBottom: 12 },
  devRow: { flexDirection: 'row', gap: 8 },
  devBtn: { flex: 1, backgroundColor: '#F59E0B', paddingVertical: 8, borderRadius: Radius.sm, alignItems: 'center' },
  devBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
