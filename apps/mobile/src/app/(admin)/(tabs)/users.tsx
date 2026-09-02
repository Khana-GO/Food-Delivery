import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUsers } from '@/hooks/admin/user/useUsers';
import { useDeletedUsers } from '@/hooks/admin/user/useDeletedUsers';
import { useUserStats } from '@/hooks/admin/user/useUserStats';
import { UserCard } from '@/components/admin/users/UserCard';
import { UserRole } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

const ROLES: (UserRole | 'ALL')[] = ['ALL', 'ADMIN', 'CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER'];

export default function AdminUsersScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => setPage(1), [roleFilter, verifiedFilter, statusFilter]);

  const filters = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      role: roleFilter,
      isVerified: verifiedFilter,
    }),
    [page, limit, search, roleFilter, verifiedFilter],
  );

  const isDeletedTab = statusFilter === 'deleted';
  const activeQuery = useUsers(filters, { enabled: !isDeletedTab });
  const deletedQuery = useDeletedUsers(filters as any, { enabled: isDeletedTab });
  const query = isDeletedTab ? deletedQuery : activeQuery;
  const { data, isLoading, isFetching, refetch } = query as any;
  const { data: stats } = useUserStats();

  const users = data?.data || [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleLoadMore = () => {
    if (!isFetching && page < totalPages) setPage((p) => p + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} tintColor={Colors.primary} colors={[Colors.primary]} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (isCloseToBottom) handleLoadMore();
        }}
        scrollEventThrottle={200}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Ultra-compact crimson header 36/12 */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: 36,
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.25)',
                }}
              >
                <Feather name="users" size={14} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>Users</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>
                  {stats ? `${stats.totalUsers} total • ${stats.activeUsers} active` : `${total} users`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/users/create' as any)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                ...Shadow.sm,
              }}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search ultra-compact height 40 */}
          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.14)',
              borderRadius: Radius.xl,
              paddingHorizontal: 10,
              height: 40,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Feather name="search" size={14} color={Colors.white} />
            <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
              style={{ flex: 1, marginLeft: 8, fontSize: 12, color: Colors.white }}
              placeholder="Search name, email, phone..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchInput}
              onChangeText={setSearchInput}
              autoCapitalize="none"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <Feather name="x-circle" size={16} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* Status tabs ultra-compact */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            {(['all', 'active', 'deleted'] as const).map((status) => {
              const active = statusFilter === status;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: Radius.full,
                    backgroundColor: active ? Colors.white : 'rgba(255,255,255,0.18)',
                    borderWidth: 1,
                    borderColor: active ? Colors.white : 'rgba(255,255,255,0.25)',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: active ? Colors.primary : Colors.white }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => {
                setSearchInput('');
                setRoleFilter(undefined);
                setVerifiedFilter(undefined);
                setStatusFilter('all');
              }}
              style={{ marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 5 }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white }}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters below header ultra-compact */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 16 }}>
            {ROLES.map((role) => {
              const isActive = (role === 'ALL' && !roleFilter) || roleFilter === role;
              return (
                <TouchableOpacity
                  key={role}
                  onPress={() => setRoleFilter(role === 'ALL' ? undefined : (role as UserRole))}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: Radius.full,
                    backgroundColor: isActive ? Colors.primary : Colors.white,
                    borderWidth: 1,
                    borderColor: isActive ? Colors.primary : Colors.borderLight,
                    ...Shadow.sm,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: isActive ? Colors.white : Colors.textSecondary }}>
                    {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            {[
              { label: 'All', value: undefined },
              { label: 'Verified', value: true },
              { label: 'Unverified', value: false },
            ].map((opt) => (
              <TouchableOpacity
                key={String(opt.label)}
                onPress={() => setVerifiedFilter(opt.value as any)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: Radius.full,
                  backgroundColor: verifiedFilter === opt.value ? Colors.primary : Colors.white,
                  borderWidth: 1,
                  borderColor: verifiedFilter === opt.value ? Colors.primary : Colors.borderLight,
                  ...Shadow.sm,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: verifiedFilter === opt.value ? '700' : '500', color: verifiedFilter === opt.value ? Colors.white : Colors.textSecondary }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 12, fontSize: 13, color: Colors.textTertiary }}>Loading users...</Text>
            </View>
          ) : users.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48, backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm, marginTop: 8 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: Colors.primaryBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                }}
              >
                <Feather name="users" size={28} color={Colors.primary} />
              </View>
              <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '700', color: Colors.textDark }}>No Users Found</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24 }}>
                {search ? 'Try a different search or filter' : 'Create your first user to get started'}
              </Text>
              {(search || roleFilter || verifiedFilter !== undefined) && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchInput('');
                    setRoleFilter(undefined);
                    setVerifiedFilter(undefined);
                  }}
                  style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.primary }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {users.map((user: any) => (
                <UserCard key={user.id} user={user} />
              ))}
              {page < totalPages && (
                <TouchableOpacity
                  onPress={handleLoadMore}
                  disabled={isFetching}
                  style={{
                    alignItems: 'center',
                    paddingVertical: 12,
                    marginTop: 8,
                    backgroundColor: Colors.white,
                    borderRadius: Radius.xl,
                    borderWidth: 1,
                    borderColor: Colors.borderLight,
                    ...Shadow.sm,
                  }}
                  activeOpacity={0.7}
                >
                  {isFetching ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Load more ({total - users.length} remaining)</Text>}
                </TouchableOpacity>
              )}
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ fontSize: 11, color: Colors.textTertiary }}>
                  Page {page} of {totalPages} • {total} users
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
