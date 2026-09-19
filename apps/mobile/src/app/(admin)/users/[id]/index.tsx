import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { goBack } from '@/lib/navigation';
import { useUser } from '@/hooks/admin/user/useUser';
import { useDeleteUser } from '@/hooks/admin/user/useDeleteUser';
import { useRestoreUser } from '@/hooks/admin/user/useRestoreUser';
import { usePermanentDeleteUser } from '@/hooks/admin/user/usePermanentDeleteUser';
import { useChangeUserRole } from '@/hooks/admin/user/useChangeUserRole';
import { UserDetails as UserDetailsComponent } from '@/components/admin/users/UserDetails';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { UserRole } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

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
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [confirm, setConfirm] = useState<
    'delete' | 'restore' | 'permanent' | null
  >(null);

  const openRoleModal = () => {
    setSelectedRole(user?.role ?? null);
    setShowRoleModal(true);
  };
  const handleDelete = () => setConfirm('delete');
  const handleRestore = () => setConfirm('restore');
  const handlePermanentDelete = () => setConfirm('permanent');

  const handleRoleUpdate = () => {
    if (!selectedRole || !user || selectedRole === user.role) return;
    setShowRoleModal(false);
    changeRole({ userId: id, role: selectedRole });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Colors.background }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
          <Feather name="user-x" size={32} color={Colors.primary} />
        </View>
        <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: Colors.textDark }}>User Not Found</Text>
        <TouchableOpacity onPress={() => goBack('/(admin)/(tabs)/users')} style={{ marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.full }} activeOpacity={0.7}>
          <Text style={{ fontWeight: '700', color: Colors.white }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: 52,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => goBack('/(admin)/(tabs)/users')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800' }}>User Details</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{user.firstName} {user.lastName} • {user.role}</Text>
        </View>
        <TouchableOpacity
          onPress={openRoleModal}
          style={{ backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, ...Shadow.sm }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Change Role</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <UserDetailsComponent
            user={user}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onRoleChange={openRoleModal}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <Pressable onPress={() => setShowRoleModal(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: Colors.white, borderTopLeftRadius: Radius['3xl'], borderTopRightRadius: Radius['3xl'], overflow: 'hidden', maxHeight: '85%' }}>
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ width: 40, height: 6, borderRadius: 999, backgroundColor: Colors.borderLight }} />
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark }}>Change Role</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3 }}>
                  Select a new role for <Text style={{ fontWeight: '700', color: Colors.textDark }}>{user.firstName} {user.lastName}</Text>
                </Text>
                <View style={{ marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: '#FECDD3', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>Current: {user.role.replace('_',' ')}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowRoleModal(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight }}
              >
                <Feather name="x" size={16} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 16, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 8, paddingBottom: 8 }}>
                {ROLE_OPTIONS.map((opt) => {
                  const isCurrent = user.role === opt.role;
                  const isSelected = selectedRole === opt.role;
                  const isActive = isSelected && !isCurrent;
                  return (
                    <TouchableOpacity
                      key={opt.role}
                      onPress={() => setSelectedRole(opt.role)}
                      disabled={isChangingRole}
                      activeOpacity={0.85}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        padding: 10,
                        borderRadius: Radius.xl,
                        borderWidth: 1.5,
                        borderColor: isActive ? Colors.primary : isCurrent ? '#FECDD3' : Colors.borderLight,
                        backgroundColor: isActive ? Colors.primaryBg : Colors.white,
                      }}
                    >
                      <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? Colors.primary : opt.bg }}>
                        <Feather name={opt.icon} size={15} color={isActive ? Colors.white : opt.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: isActive ? Colors.primary : Colors.textDark }}>
                          {opt.label}
                        </Text>
                        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }}>{opt.sub}</Text>
                      </View>
                      {isCurrent && (
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: '#FEE2E2' }}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.primary }}>CURRENT</Text>
                        </View>
                      )}
                      <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: isActive ? Colors.primary : Colors.borderLight, backgroundColor: isActive ? Colors.primary : Colors.white }}>
                        {isActive ? <Feather name="check" size={12} color={Colors.white} /> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setShowRoleModal(false)} style={{ flex: 1, paddingVertical: 11, borderRadius: Radius.full, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.primary }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.primary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRoleUpdate}
                  disabled={!selectedRole || selectedRole === user.role || isChangingRole}
                  style={{ flex: 1, paddingVertical: 11, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', opacity: !selectedRole || selectedRole === user.role || isChangingRole ? 0.5 : 1 }}
                >
                  {isChangingRole ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>Update</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>

        {isChangingRole && (
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ backgroundColor: Colors.white, paddingHorizontal: 24, paddingVertical: 16, borderRadius: Radius.xl, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.md }}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Updating role…</Text>
            </View>
          </View>
        )}
      </Modal>

      <ConfirmDialog
        visible={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); deleteUser(id); }}
        title="Delete User"
        message="Are you sure you want to soft delete this user?"
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
      />
      <ConfirmDialog
        visible={confirm === 'restore'}
        onClose={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); restoreUser(id); }}
        title="Restore User"
        message="Are you sure you want to restore this user?"
        confirmLabel="Restore"
        icon="rotate-ccw"
        tone="info"
      />
      <ConfirmDialog
        visible={confirm === 'permanent'}
        onClose={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); permanentDeleteUser(id); }}
        title="Permanently Delete"
        message="This action cannot be undone. Are you sure?"
        confirmLabel="Delete Forever"
        icon="alert-octagon"
        tone="danger"
      />
    </View>
  );
}
