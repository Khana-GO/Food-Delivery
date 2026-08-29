import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUser } from '@/hooks/admin/useUser';
import { useDeleteUser } from '@/hooks/admin/useDeleteUser';
import { useRestoreUser } from '@/hooks/admin/useRestoreUser';
import { usePermanentDeleteUser } from '@/hooks/admin/usePermanentDeleteUser';
import { useChangeUserRole } from '@/hooks/admin/useChangeUserRole';
import { UserDetails as UserDetailsComponent } from '@/components/admin/users/UserDetails';
import type { UserRole } from '@food_delivery/types';

const ROLE_OPTIONS: { role: UserRole; label: string; sub: string; icon: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }[] = [
  { role: 'ADMIN', label: 'Admin', sub: 'Full platform access', icon: 'shield', color: '#7C3AED', bg: '#F5F3FF' },
  { role: 'CUSTOMER', label: 'Customer', sub: 'Order & browse', icon: 'shopping-bag', color: '#0E9F6E', bg: '#ECFDF5' },
  { role: 'RESTAURANT_OWNER', label: 'Restaurant Owner', sub: 'Manage restaurants & menus', icon: 'home', color: '#EA580C', bg: '#FFF7ED' },
  { role: 'DRIVER', label: 'Driver', sub: 'Deliver orders', icon: 'truck', color: '#2563EB', bg: '#EFF6FF' },
];

export default function UserDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: restoreUser } = useRestoreUser();
  const { mutate: permanentDeleteUser } = usePermanentDeleteUser();
  const { mutate: changeRole, isPending: isChangingRole } = useChangeUserRole();

  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleDelete = () => {
    Alert.alert('Delete User', 'Are you sure you want to soft delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteUser(id) },
    ]);
  };

  const handleRestore = () => {
    Alert.alert('Restore User', 'Are you sure you want to restore this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: () => restoreUser(id) },
    ]);
  };

  const handlePermanentDelete = () => {
    Alert.alert('Permanently Delete', 'This action cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => permanentDeleteUser(id) },
    ]);
  };

  const handleRoleSelect = (role: UserRole) => {
    if (user?.role === role) {
      Alert.alert('No change', `User already has role ${role}`);
      return;
    }
    setShowRoleModal(false);
    changeRole({ userId: id, role });
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="user-x" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">User Not Found</Text>
        <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => router.back()}>
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">User Details</Text>
        </View>
      </View>

      <UserDetailsComponent
        user={user}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onRoleChange={() => setShowRoleModal(true)}
      />

      {/* ── Role Change Modal ── */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <Pressable onPress={() => setShowRoleModal(false)} className="flex-1 bg-black/50 justify-end">
          <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-t-[28px] overflow-hidden max-h-[85%]">
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1.5 rounded-full bg-gray-200" />
            </View>

            {/* Header */}
            <View className="px-6 pb-4 flex-row items-start justify-between border-b border-gray-100">
              <View className="flex-1 pr-4">
                <Text className="text-[18px] font-black text-[#0F172A]">Change Role</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Select a new role for <Text className="font-bold text-[#0F172A]">{user.firstName} {user.lastName}</Text>
                </Text>
                <View className="mt-2 self-start px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-primary" />
                  <Text className="text-[11px] font-bold text-gray-600">Current: {user.role.replace('_',' ')}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowRoleModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Role list */}
            <ScrollView className="px-4 pt-4" showsVerticalScrollIndicator={false}>
              <View className="gap-3 pb-2">
                {ROLE_OPTIONS.map((opt) => {
                  const isCurrent = user.role === opt.role;
                  const isSelected = isCurrent;
                  return (
                    <TouchableOpacity
                      key={opt.role}
                      onPress={() => handleRoleSelect(opt.role)}
                      disabled={isChangingRole}
                      activeOpacity={0.85}
                      className={`flex-row items-center gap-3 p-4 rounded-2xl border-2 ${isSelected ? 'bg-gray-50 border-primary' : 'bg-white border-gray-100'}`}
                    >
                      <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: opt.bg }}>
                        <Feather name={opt.icon} size={18} color={opt.color} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className={`text-[14px] font-black ${isSelected ? 'text-primary' : 'text-[#0F172A]'}`}>
                            {opt.label}
                          </Text>
                          {isCurrent && (
                            <View className="px-2 py-0.5 rounded-full bg-primary">
                              <Text className="text-[10px] font-black text-white">CURRENT</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-gray-500 mt-0.5">{opt.sub}</Text>
                        <Text className="text-[10px] text-gray-400 font-mono mt-1">{opt.role}</Text>
                      </View>
                      <View className={`w-7 h-7 rounded-full items-center justify-center border-2 ${isSelected ? 'bg-primary border-primary' : 'border-gray-200 bg-white'}`}>
                        {isSelected ? <Feather name="check" size={14} color="white" /> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="flex-row gap-3 mt-6 mb-6">
                <TouchableOpacity
                  onPress={() => setShowRoleModal(false)}
                  className="flex-1 py-3.5 rounded-xl bg-gray-100 items-center justify-center flex-row gap-2"
                >
                  <Feather name="x" size={16} color="#0F172A" />
                  <Text className="font-bold text-[#0F172A]">Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowRoleModal(false)}
                  className="flex-1 py-3.5 rounded-xl bg-[#0F172A] items-center justify-center flex-row gap-2"
                >
                  <Feather name="slash" size={16} color="white" />
                  <Text className="font-bold text-white">Cancel</Text>
                </TouchableOpacity>
              </View>
              <View className="h-2" />
            </ScrollView>
          </Pressable>
        </Pressable>

        {/* loading overlay */}
        {isChangingRole && (
          <View className="absolute inset-0 bg-white/60 items-center justify-center">
            <View className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100 flex-row items-center gap-3">
              <ActivityIndicator size="small" color="#E23744" />
              <Text className="text-sm font-bold text-[#0F172A]">Updating role…</Text>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
