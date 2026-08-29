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

const ROLES: (UserRole | 'ALL')[] = ['ALL', 'ADMIN', 'CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER'];

export default function AdminUsersScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter change
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

  // Hooks must be called unconditionally (Rules of Hooks)
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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-black">Users</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {stats ? `${stats.totalUsers} total • ${stats.activeUsers} active` : `${total} users`}
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-primary"
            onPress={() => router.push('/(admin)/users/create' as any)}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text className="text-sm font-semibold text-white">Add User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center h-12 px-4 bg-white border border-gray-200 rounded-xl">
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 text-base text-black"
            placeholder="Search name, email, phone..."
            placeholderTextColor="#94A3B8"
            value={searchInput}
            onChangeText={setSearchInput}
            autoCapitalize="none"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput('')}>
              <Feather name="x-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status tabs */}
      <View className="flex-row gap-2 px-4 pt-3">
        {(['all', 'active', 'deleted'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            className={`px-4 py-2 rounded-full ${statusFilter === status ? 'bg-primary' : 'bg-white border border-gray-200'}`}
            onPress={() => setStatusFilter(status)}
          >
            <Text className={`text-xs font-semibold ${statusFilter === status ? 'text-white' : 'text-gray-600'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => {
            setSearchInput('');
            setRoleFilter(undefined);
            setVerifiedFilter(undefined);
            setStatusFilter('all');
          }}
          className="px-3 py-2 ml-auto"
        >
          <Text className="text-xs font-semibold text-primary">Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Role & verified filters */}
      <View className="px-4 pt-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {ROLES.map((role) => {
            const isActive = (role === 'ALL' && !roleFilter) || roleFilter === role;
            return (
              <TouchableOpacity
                key={role}
                className={`px-3 py-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-white border border-gray-200'}`}
                onPress={() => setRoleFilter(role === 'ALL' ? undefined : (role as UserRole))}
              >
                <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View className="flex-row gap-2 mt-2">
          {[
            { label: 'All', value: undefined },
            { label: 'Verified', value: true },
            { label: 'Unverified', value: false },
          ].map((opt) => (
            <TouchableOpacity
              key={String(opt.label)}
              className={`px-3 py-1.5 rounded-full ${verifiedFilter === opt.value ? 'bg-primary' : 'bg-white border border-gray-200'}`}
              onPress={() => setVerifiedFilter(opt.value as any)}
            >
              <Text className={`text-xs ${verifiedFilter === opt.value ? 'text-white font-semibold' : 'text-gray-600'}`}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List – single loading only */}
      <ScrollView
        className="flex-1 px-4 mt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} tintColor="#E23744" />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (isCloseToBottom) handleLoadMore();
        }}
        scrollEventThrottle={200}
      >
        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#E23744" />
            <Text className="mt-3 text-sm text-gray-400">Loading users...</Text>
          </View>
        ) : users.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Feather name="users" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Users Found</Text>
            <Text className="px-6 mt-1 text-sm text-center text-gray-400">
              {search ? 'Try a different search or filter' : 'Create your first user to get started'}
            </Text>
            {search || roleFilter || verifiedFilter !== undefined ? (
              <TouchableOpacity
                className="mt-4 px-5 py-2.5 bg-white border border-gray-200 rounded-xl"
                onPress={() => {
                  setSearchInput('');
                  setRoleFilter(undefined);
                  setVerifiedFilter(undefined);
                }}
              >
                <Text className="text-sm font-semibold text-gray-700">Clear filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <>
            {users.map((user: any) => (
              <UserCard key={user.id} user={user} />
            ))}
            {page < totalPages && (
              <TouchableOpacity
                className="items-center py-3 mb-2 bg-white border border-gray-200 rounded-xl"
                onPress={handleLoadMore}
                disabled={isFetching}
              >
                {isFetching ? <ActivityIndicator size="small" color="#E23744" /> : <Text className="text-sm font-semibold text-primary">Load more ({total - users.length} remaining)</Text>}
              </TouchableOpacity>
            )}
            <View className="items-center py-2">
              <Text className="text-xs text-gray-400">
                Page {page} of {totalPages} • {total} users
              </Text>
            </View>
          </>
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
