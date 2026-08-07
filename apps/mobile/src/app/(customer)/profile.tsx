import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PROFILE_ITEMS = [
  { icon: 'location-outline' as const, label: 'Saved Addresses' },
  { icon: 'card-outline' as const, label: 'Payment Methods' },
  { icon: 'wallet-outline' as const, label: 'Wallet' },
  { icon: 'pricetag-outline' as const, label: 'Coupons' },
  { icon: 'receipt-outline' as const, label: 'Order History' },
  { icon: 'heart-outline' as const, label: 'Favorites' },
  { icon: 'help-circle-outline' as const, label: 'Help Center' },
  { icon: 'globe-outline' as const, label: 'Language' },
  { icon: 'moon-outline' as const, label: 'Dark Mode' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={styles.name}>Luisa Johnson</Text>
          <Text style={styles.email}>luisa@example.com</Text>
        </View>

        {/* Menu items */}
        <View style={styles.menu}>
          {PROFILE_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuRow}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color="#64748B" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/auth/login')}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  profileHeader: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  email: { fontSize: 14, color: '#94A3B8' },
  menu: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F8FAFC' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});
