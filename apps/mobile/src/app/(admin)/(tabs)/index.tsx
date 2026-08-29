import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStats } from '@/hooks/admin/user/useUserStats';
import { useAdminRestaurantStats } from '@/hooks/admin/restaurant/useAdminRestaurantStats';
import { useAuth } from '@/contexts/AuthContext';

type Stat = {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  bg: string;
  trend?: string;
  sub: string;
};

type RestaurantStat = {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  bg: string;
  sub: string;
};

export default function AdminDashboard() {
  const {
    data: userStats,
    isLoading: userLoading,
    refetch: refetchUsers,
    isRefetching: isRefetchingUsers,
  } = useUserStats();

  const {
    data: restaurantStats,
    isLoading: restaurantLoading,
    refetch: refetchRestaurants,
    isRefetching: isRefetchingRestaurants,
  } = useAdminRestaurantStats();

  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    []
  );

  const isLoading = userLoading || restaurantLoading;
  const isRefetching = isRefetchingUsers || isRefetchingRestaurants;

  // ─── User Stats Cards ───
  const userStatCards: Stat[] = [
    {
      label: 'Total Users',
      value: userStats?.totalUsers ?? 0,
      icon: 'users',
      color: '#E23744',
      bg: '#FFF0F1',
      sub: 'All registered',
      trend: userStats?.totalUsers ? '+100%' : undefined,
    },
    {
      label: 'Active',
      value: userStats?.activeUsers ?? 0,
      icon: 'user-check',
      color: '#0E9F6E',
      bg: '#ECFDF5',
      sub: `${userStats?.totalUsers ? Math.round(((userStats?.activeUsers ?? 0) / userStats.totalUsers) * 100) : 0}% of total`,
    },
    {
      label: 'Verified',
      value: userStats?.verifiedUsers ?? 0,
      icon: 'shield',
      color: '#2563EB',
      bg: '#EFF6FF',
      sub: 'Email verified',
    },
    {
      label: 'Online',
      value: userStats?.onlineUsers ?? 0,
      icon: 'activity',
      color: '#7C3AED',
      bg: '#F5F3FF',
      sub: 'Currently online',
    },
    {
      label: 'Admins',
      value: userStats?.adminUsers ?? 0,
      icon: 'award',
      color: '#D97706',
      bg: '#FFFBEB',
      sub: 'Privileged',
    },
    {
      label: 'Deleted',
      value: userStats?.deletedUsers ?? 0,
      icon: 'user-x',
      color: '#64748B',
      bg: '#F8FAFC',
      sub: 'Soft deleted',
    },
  ];

  // ─── Restaurant Stats Cards ───
  const restaurantStatCards: RestaurantStat[] = [
    {
      label: 'Total Restaurants',
      value: restaurantStats?.total ?? 0,
      icon: 'home',
      color: '#E23744',
      bg: '#FFF0F1',
      sub: 'All restaurants',
    },
    {
      label: 'Active',
      value: restaurantStats?.active ?? 0,
      icon: 'wifi',
      color: '#0E9F6E',
      bg: '#ECFDF5',
      sub: `${restaurantStats?.total ? Math.round(((restaurantStats?.active ?? 0) / restaurantStats.total) * 100) : 0}% of total`,
    },
    {
      label: 'Verified',
      value: restaurantStats?.verified ?? 0,
      icon: 'check-circle',
      color: '#2563EB',
      bg: '#EFF6FF',
      sub: 'Approved',
    },
    {
      label: 'Open Now',
      value: restaurantStats?.open ?? 0,
      icon: 'clock',
      color: '#7C3AED',
      bg: '#F5F3FF',
      sub: 'Currently open',
    },
    {
      label: 'Inactive',
      value: restaurantStats?.inactive ?? 0,
      icon: 'pause-circle',
      color: '#D97706',
      bg: '#FFFBEB',
      sub: 'Deactivated',
    },
    {
      label: 'Deleted',
      value: restaurantStats?.deleted ?? 0,
      icon: 'trash-2',
      color: '#64748B',
      bg: '#F8FAFC',
      sub: 'Soft deleted',
    },
  ];

  // ─── Percentages for progress bars ───
  const verifiedPct = userStats?.totalUsers
    ? Math.round(((userStats?.verifiedUsers ?? 0) / userStats.totalUsers) * 100)
    : 0;
  const activePct = userStats?.totalUsers
    ? Math.round(((userStats?.activeUsers ?? 0) / userStats.totalUsers) * 100)
    : 0;
  const onlinePct = userStats?.activeUsers
    ? Math.round(((userStats?.onlineUsers ?? 0) / (userStats.activeUsers || 1)) * 100)
    : 0;

  const restaurantActivePct = restaurantStats?.total
    ? Math.round(((restaurantStats?.active ?? 0) / restaurantStats.total) * 100)
    : 0;
  const restaurantVerifiedPct = restaurantStats?.total
    ? Math.round(((restaurantStats?.verified ?? 0) / restaurantStats.total) * 100)
    : 0;
  const restaurantOpenPct = restaurantStats?.total
    ? Math.round(((restaurantStats?.open ?? 0) / restaurantStats.total) * 100)
    : 0;

  // ─── Quick Actions ───
  const quickActions = [
    {
      label: 'Users',
      sub: `${userStats?.totalUsers ?? 0} total`,
      icon: 'users' as const,
      color: '#E23744',
      bg: '#FFF0F1',
      route: '/(admin)/(tabs)/users',
    },
    {
      label: 'Restaurants',
      sub: `${restaurantStats?.total ?? 0} total`,
      icon: 'home' as const,
      color: '#0E9F6E',
      bg: '#ECFDF5',
      route: '/(admin)/(tabs)/restaurants',
    },
    {
      label: 'Orders',
      sub: 'All orders',
      icon: 'shopping-bag' as const,
      color: '#2563EB',
      bg: '#EFF6FF',
      route: '/(admin)/(tabs)/orders',
    },
    {
      label: 'Analytics',
      sub: 'Insights',
      icon: 'bar-chart-2' as const,
      color: '#7C3AED',
      bg: '#F5F3FF',
      route: '/(admin)/(tabs)/analytics',
    },
  ];

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchUsers();
              refetchRestaurants();
            }}
            tintColor="#E23744"
          />
        }
      >
        {/* ─── Header – primary background like previous (rounded, Saturday Aug 20) ─── */}
        <View style={{ paddingTop: insets.top }} className="bg-primary">
          <View className="rounded-b-[32px] bg-primary px-6 pb-8 pt-6">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-1.5 h-6 rounded-full bg-white" />
                  <Text className="text-[11px] font-bold tracking-[1.2px] text-white uppercase">Admin Console</Text>
                </View>
                <Text className="text-[22px] font-extrabold text-white mt-2 leading-6">Welcome back,</Text>
                <Text className="text-[22px] font-extrabold text-white leading-7">{user?.firstName || 'Admin'} </Text>
                <Text className="text-[11px] text-white/80 mt-1.5 font-medium">{today} • All systems operational</Text>
              </View>
              <View className="items-center gap-3">
                <View className="items-center justify-center w-12 h-12 border rounded-2xl bg-white/20 border-white/20">
                  <Text className="text-white font-black text-[17px]">
                    {(user?.firstName?.[0] || 'A').toUpperCase()}
                    {(user?.lastName?.[0] || '').toUpperCase()}
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full bg-white/20 border border-white/20">
                  <Text className="text-[10px] font-bold text-white tracking-widest">{user?.role || 'ADMIN'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Single loading for whole dashboard (fix duplicate loading) ─── */}
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#E23744" />
            <Text className="mt-3 text-sm text-gray-400">Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {/* ─── Users Overview ─── */}
            <View className="px-4 pt-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[13px] font-extrabold tracking-[1px] text-[#0F172A] uppercase">Users Overview</Text>
                <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/users' as any)} className="flex-row items-center gap-1">
                  <Text className="text-xs font-bold text-primary">Manage</Text>
                  <Feather name="chevron-right" size={14} color="#E23744" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {userStatCards.map((s) => (
                  <View
                    key={s.label}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex-1 min-w-[47%] shadow-sm"
                    style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="items-center justify-center w-9 h-9 rounded-xl" style={{ backgroundColor: s.bg }}>
                        <Feather name={s.icon} size={16} color={s.color} />
                      </View>
                      {s.trend && (
                        <View className="px-2 py-1 bg-gray-900 rounded-full">
                          <Text className="text-[10px] font-extrabold text-white">{s.trend}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[22px] font-black text-[#0F172A] mt-3 tracking-tight">{s.value}</Text>
                    <Text className="text-xs font-bold text-[#0F172A] mt-0.5">{s.label}</Text>
                    <Text className="text-[11px] text-gray-400 font-medium">{s.sub}</Text>
                    <View className="h-1 mt-3 overflow-hidden bg-gray-100 rounded-full">
                      <View className="h-full rounded-full" style={{ width: `${Math.min(100, (s.value / Math.max(1, userStats?.totalUsers || 1)) * 100)}%`, backgroundColor: s.color, opacity: 0.9 }} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ─── Restaurants Overview ─── */}
            <View className="px-4 pt-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[13px] font-extrabold tracking-[1px] text-[#0F172A] uppercase">Restaurants Overview</Text>
                <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/restaurants' as any)} className="flex-row items-center gap-1">
                  <Text className="text-xs font-bold text-primary">Manage</Text>
                  <Feather name="chevron-right" size={14} color="#E23744" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {restaurantStatCards.map((s) => (
                  <View
                    key={s.label}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex-1 min-w-[47%] shadow-sm"
                    style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="items-center justify-center w-9 h-9 rounded-xl" style={{ backgroundColor: s.bg }}>
                        <Feather name={s.icon} size={16} color={s.color} />
                      </View>
                    </View>
                    <Text className="text-[22px] font-black text-[#0F172A] mt-3 tracking-tight">{s.value}</Text>
                    <Text className="text-xs font-bold text-[#0F172A] mt-0.5">{s.label}</Text>
                    <Text className="text-[11px] text-gray-400 font-medium">{s.sub}</Text>
                    <View className="h-1 mt-3 overflow-hidden bg-gray-100 rounded-full">
                      <View className="h-full rounded-full" style={{ width: `${Math.min(100, (s.value / Math.max(1, restaurantStats?.total || 1)) * 100)}%`, backgroundColor: s.color, opacity: 0.9 }} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ─── Insights (combined) ─── */}
            <View className="px-4 mt-6">
              <Text className="text-[13px] font-extrabold tracking-[1px] text-[#0F172A] uppercase mb-3">Platform Health</Text>
              <View className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-[#0F172A]">User & Restaurant Health</Text>
                  <View className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <Text className="text-[11px] font-extrabold text-emerald-700">● Live</Text>
                  </View>
                </View>

                <View className="mt-5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                        <Feather name="shield" size={14} color="#2563EB" />
                      </View>
                      <Text className="text-xs font-bold text-gray-700">User Verification</Text>
                    </View>
                    <Text className="text-xs font-black text-[#0F172A]">{verifiedPct}%</Text>
                  </View>
                  <View className="h-2 rounded-full bg-gray-100 mt-2.5 overflow-hidden">
                    <View className="h-full rounded-full bg-[#2563EB]" style={{ width: `${verifiedPct}%` }} />
                  </View>
                  <Text className="text-[11px] text-gray-400 mt-1.5">{userStats?.verifiedUsers ?? 0} of {userStats?.totalUsers ?? 0} users verified</Text>
                </View>

                <View className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="items-center justify-center w-8 h-8 rounded-full bg-indigo-50">
                        <Feather name="check-circle" size={14} color="#4F46E5" />
                      </View>
                      <Text className="text-xs font-bold text-gray-700">Restaurant Verification</Text>
                    </View>
                    <Text className="text-xs font-black text-[#0F172A]">{restaurantVerifiedPct}%</Text>
                  </View>
                  <View className="h-2 rounded-full bg-gray-100 mt-2.5 overflow-hidden">
                    <View className="h-full rounded-full bg-[#4F46E5]" style={{ width: `${restaurantVerifiedPct}%` }} />
                  </View>
                  <Text className="text-[11px] text-gray-400 mt-1.5">{restaurantStats?.verified ?? 0} of {restaurantStats?.total ?? 0} restaurants verified</Text>
                </View>

                <View className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="items-center justify-center w-8 h-8 rounded-full bg-emerald-50">
                        <Feather name="user-check" size={14} color="#0E9F6E" />
                      </View>
                      <Text className="text-xs font-bold text-gray-700">User Activity</Text>
                    </View>
                    <Text className="text-xs font-black text-[#0F172A]">{activePct}%</Text>
                  </View>
                  <View className="h-2 rounded-full bg-gray-100 mt-2.5 overflow-hidden">
                    <View className="h-full rounded-full bg-[#0E9F6E]" style={{ width: `${activePct}%` }} />
                  </View>
                  <Text className="text-[11px] text-gray-400 mt-1.5">{userStats?.activeUsers ?? 0} active • {userStats?.deletedUsers ?? 0} deleted</Text>
                </View>

                <View className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="items-center justify-center w-8 h-8 rounded-full bg-teal-50">
                        <Feather name="wifi" size={14} color="#0D9488" />
                      </View>
                      <Text className="text-xs font-bold text-gray-700">Restaurant Activity</Text>
                    </View>
                    <Text className="text-xs font-black text-[#0F172A]">{restaurantActivePct}%</Text>
                  </View>
                  <View className="h-2 rounded-full bg-gray-100 mt-2.5 overflow-hidden">
                    <View className="h-full rounded-full bg-[#0D9488]" style={{ width: `${restaurantActivePct}%` }} />
                  </View>
                  <Text className="text-[11px] text-gray-400 mt-1.5">{restaurantStats?.active ?? 0} active • {restaurantStats?.deleted ?? 0} deleted</Text>
                </View>

                <View className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="items-center justify-center w-8 h-8 rounded-full bg-amber-50">
                        <Feather name="clock" size={14} color="#D97706" />
                      </View>
                      <Text className="text-xs font-bold text-gray-700">Open Now</Text>
                    </View>
                    <Text className="text-xs font-black text-[#0F172A]">{restaurantOpenPct}%</Text>
                  </View>
                  <View className="h-2 rounded-full bg-gray-100 mt-2.5 overflow-hidden">
                    <View className="h-full rounded-full bg-[#D97706]" style={{ width: `${restaurantOpenPct}%` }} />
                  </View>
                  <Text className="text-[11px] text-gray-400 mt-1.5">{restaurantStats?.open ?? 0} restaurants open now</Text>
                </View>

                <View className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="items-center justify-center w-8 h-8 rounded-full bg-violet-50">
                        <Feather name="activity" size={14} color="#7C3AED" />
                      </View>
                      <Text className="text-xs font-bold text-gray-700">Online Users</Text>
                    </View>
                    <Text className="text-xs font-black text-[#0F172A]">{onlinePct}%</Text>
                  </View>
                  <View className="h-2 rounded-full bg-gray-100 mt-2.5 overflow-hidden">
                    <View className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${onlinePct}%` }} />
                  </View>
                  <Text className="text-[11px] text-gray-400 mt-1.5">{userStats?.onlineUsers ?? 0} users online</Text>
                </View>
              </View>
            </View>

            {/* ─── Quick Actions ─── */}
            <View className="px-4 mt-6">
              <Text className="text-[13px] font-extrabold tracking-[1px] text-[#0F172A] uppercase mb-3">Quick Actions</Text>
              <View className="flex-row flex-wrap gap-3">
                {quickActions.map((a) => (
                  <TouchableOpacity key={a.label} onPress={() => router.push(a.route as any)} activeOpacity={0.85} className="bg-white rounded-2xl border border-gray-100 p-4 flex-1 min-w-[47%] flex-row items-center gap-3 shadow-sm">
                    <View className="items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: a.bg }}>
                      <Feather name={a.icon} size={18} color={a.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-extrabold text-[#0F172A]">{a.label}</Text>
                      <Text className="text-[11px] text-gray-400 font-medium">{a.sub}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ─── CTA ─── */}
            <View className="px-4 mt-6 mb-6">
              <View className="rounded-2xl bg-[#0F172A] p-5 flex-row items-center overflow-hidden">
                <View className="flex-1 pr-3">
                  <Text className="text-white font-black text-[15px]">Manage users</Text>
                  <Text className="mt-1 text-xs leading-4 text-white/60">Search, filter, edit roles and handle deletions from one place.</Text>
                  <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/users' as any)} className="flex-row items-center self-start gap-2 px-4 py-2 mt-3 bg-white rounded-full">
                    <Text className="text-xs font-black text-[#0F172A]">Open Users</Text>
                    <Feather name="arrow-right" size={14} color="#0F172A" />
                  </TouchableOpacity>
                </View>
                <View className="items-center justify-center w-20 h-20 border rounded-2xl bg-white/10 border-white/10">
                  <Feather name="users" size={30} color="white" />
                </View>
              </View>
              <View className="flex-row items-center justify-center gap-2 mt-4">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text className="text-[11px] text-gray-400 font-medium">{isLoading ? 'Syncing…' : `Last updated just now • ${userStats?.totalUsers ?? 0} users • ${restaurantStats?.total ?? 0} restaurants`}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
