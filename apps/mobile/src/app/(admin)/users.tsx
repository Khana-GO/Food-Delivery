import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

const USERS = [
  {
    id: '1',
    name: 'Anish Shrestha',
    email: 'anish@example.com',
    role: 'Customer',
    status: 'Active',
    joinDate: 'Jan 12, 2024',
    orders: 42,
    avatar: '👨',
    bg: '#E0F2FE',
  },
  {
    id: '2',
    name: 'Bikash Gurung',
    email: 'bikash.g@example.com',
    role: 'Driver',
    status: 'Active',
    joinDate: 'Feb 04, 2024',
    orders: 128,
    avatar: '👨‍✈️',
    bg: '#FEF3C7',
  },
  {
    id: '3',
    name: 'Sita Sharma',
    email: 'sita.s@example.com',
    role: 'Restaurant',
    status: 'Pending',
    joinDate: 'Mar 15, 2024',
    orders: 0,
    avatar: '👩‍🍳',
    bg: '#FCE7F3',
  },
  {
    id: '4',
    name: 'Ram Karki',
    email: 'ram.karki@example.com',
    role: 'Customer',
    status: 'Banned',
    joinDate: 'Dec 01, 2023',
    orders: 14,
    avatar: '👨',
    bg: '#FEE2E2',
  },
];

import { useAllUsers } from '@/api/users';

const TABS = ['All', 'CUSTOMER', 'DRIVER', 'RESTAURANT_OWNER'];

export default function ManageUsersScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  
  const { data: users, isLoading } = useAllUsers();

  const filtered = (users || []).filter((u: any) => {
    if (activeTab !== 'All' && u.role !== activeTab) {
      return false;
    }
    const fullName = `${u.firstName} ${u.lastName}`;
    if (searchText && !fullName.toLowerCase().includes(searchText.toLowerCase()) && !u.email?.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Manage Users</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input 
           placeholder="Search users by name or email" 
           value={searchText}
           onChangeText={setSearchText}
           leftIcon={<Text style={{ fontSize: 16 }}>🔍</Text>}
           containerStyle={{ marginBottom: 0 }}
        />
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
         {filtered.map((u: any) => (
            <View key={u.id} style={styles.card}>
               <View style={styles.cardRow}>
                  <View style={[styles.avatarBg, { backgroundColor: '#E0F2FE' }]}>
                     <Text style={styles.avatarEmoji}>{u.role === 'DRIVER' ? '👨‍✈️' : u.role === 'RESTAURANT_OWNER' ? '👩‍🍳' : '👨'}</Text>
                  </View>
                  <View style={styles.userInfo}>
                     <View style={styles.nameRow}>
                        <Text style={styles.userName}>{u.firstName} {u.lastName}</Text>
                        <Badge 
                          label={u.isVerified ? 'Verified' : 'Pending'} 
                          variant={u.isVerified ? 'success' : 'warning'} 
                        />
                     </View>
                     <Text style={styles.userEmail}>{u.email || u.phone}</Text>
                     
                     <View style={styles.metaRow}>
                        <View style={styles.metaPill}>
                           <Text style={styles.metaPillText}>{u.role}</Text>
                        </View>
                        <Text style={styles.metaText}>Joined {new Date(u.createdAt).toLocaleDateString()}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>0 orders</Text>
                     </View>
                  </View>
               </View>

               <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn}>
                     <Text style={styles.actionIcon}>👁️</Text>
                     <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                     <Text style={styles.actionIcon}>✏️</Text>
                     <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                     <Text style={styles.actionIconDanger}>🚫</Text>
                     <Text style={styles.actionTextDanger}>Ban</Text>
                  </TouchableOpacity>
               </View>
            </View>
         ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18 },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, textAlign: 'center' },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: { color: '#fff', fontSize: 20 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white },
  tabsWrapper: { backgroundColor: Colors.white, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tabsContainer: { paddingHorizontal: 16, gap: 10 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 100, backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  avatarBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarEmoji: { fontSize: 28 },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  userName: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  userEmail: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaPill: { backgroundColor: Colors.backgroundAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  metaPillText: { fontSize: 10, fontWeight: '700', color: Colors.textMedium },
  metaText: { fontSize: 11, color: Colors.textSecondary },
  metaDot: { fontSize: 11, color: Colors.textLight },
  actionsRow: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.backgroundAlt },
  actionIcon: { fontSize: 14 },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.textDark },
  actionIconDanger: { fontSize: 14 },
  actionTextDanger: { fontSize: 12, fontWeight: '600', color: Colors.error },
});
