import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DRIVER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
}

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'u1',
    name: 'Aayush Shrestha',
    email: 'aayush@gmail.com',
    phone: '+977 9841234567',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    joinedDate: 'Jan 2026',
  },
  {
    id: 'u2',
    name: "McDonald's Owner (Ramesh Bhandari)",
    email: 'mcdonalds.ktm@gmail.com',
    phone: '+977 9851098765',
    role: 'RESTAURANT_OWNER',
    status: 'ACTIVE',
    joinedDate: 'Feb 2026',
  },
  {
    id: 'u3',
    name: 'Marcus Vance (Driver)',
    email: 'marcus.driver@gmail.com',
    phone: '+977 9801122334',
    role: 'DRIVER',
    status: 'ACTIVE',
    joinedDate: 'Mar 2026',
  },
  {
    id: 'u4',
    name: 'Subash Tamang',
    email: 'subash.suspend@gmail.com',
    phone: '+977 9812345678',
    role: 'CUSTOMER',
    status: 'SUSPENDED',
    joinedDate: 'Apr 2026',
  },
];

export default function UserManagementScreen() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const toggleUserStatus = (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    Alert.alert(
      `${newStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'} User`,
      `Are you sure you want to set ${name} to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () =>
            setUsers((prev) =>
              prev.map((u) => (u.id === id ? { ...u, status: newStatus as any } : u))
            ),
        },
      ]
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        !query ||
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.phone.includes(query);

      if (!matchesQuery) return false;

      if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;

      return true;
    });
  }, [query, selectedRole, users]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>User Directory ({users.length})</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone number..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Role Filter Chips */}
      <View style={{ height: 44, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleChipsScroll}>
          {['ALL', 'CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER', 'ADMIN'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, selectedRole === r && styles.roleChipSelected]}
              onPress={() => setSelectedRole(r)}
            >
              <Text style={[styles.roleChipText, selectedRole === r && styles.roleChipTextSelected]}>
                {r.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.userList}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No matching users found</Text>
            </View>
          ) : (
            filteredUsers.map((u) => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userPhone}>{u.phone}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusTag,
                      u.status === 'ACTIVE' ? styles.statusActive : styles.statusSuspended,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        { color: u.status === 'ACTIVE' ? '#166534' : '#991B1B' },
                      ]}
                    >
                      {u.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.roleRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>ROLE: {u.role}</Text>
                  </View>
                  <Text style={styles.joinedText}>Joined {u.joinedDate}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.suspendBtn,
                      u.status === 'ACTIVE' ? styles.btnDanger : styles.btnSuccess,
                    ]}
                    onPress={() => toggleUserStatus(u.id, u.status, u.name)}
                  >
                    <Text
                      style={[
                        styles.suspendBtnText,
                        { color: u.status === 'ACTIVE' ? '#EF4444' : '#22C55E' },
                      ]}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend User' : 'Reactivate User'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B', flex: 1, marginLeft: 12 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },

  roleChipsScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  roleChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  roleChipSelected: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  roleChipText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  roleChipTextSelected: { color: '#FFFFFF' },

  userList: { paddingHorizontal: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },

  userCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  userHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  userPhone: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusSuspended: { backgroundColor: '#FEE2E2' },
  statusTagText: { fontSize: 11, fontWeight: '800' },

  roleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  roleBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '800', color: '#475569' },
  joinedText: { fontSize: 11, color: '#94A3B8' },

  actionRow: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suspendBtn: { paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  btnDanger: { backgroundColor: '#FEF2F2' },
  btnSuccess: { backgroundColor: '#F0FDF4' },
  suspendBtnText: { fontSize: 13, fontWeight: '700' },
});
