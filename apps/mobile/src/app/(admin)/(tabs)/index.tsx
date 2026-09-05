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
import { useUserStats } from '@/hooks/admin/user/useUserStats';
import { useAdminRestaurantStats } from '@/hooks/admin/restaurant/useAdminRestaurantStats';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';
import { usePlatformMetrics } from '@/hooks/admin/usePlatformMetrics';
import { useAdminAnalyticsStore } from '@/stores/admin/adminAnalyticsStore';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';

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

  const { platformMetrics } = useAdminAnalyticsStore();
  usePlatformMetrics();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const { user } = useAuth();

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

  const getInitials = () => {
    return `${user?.firstName?.charAt(0).toUpperCase() || 'A'}${user?.lastName?.charAt(0).toUpperCase() || ''}`;
  };

  const verifiedPct = userStats?.totalUsers
    ? Math.round(((userStats?.verifiedUsers ?? 0) / userStats.totalUsers) * 100)
    : 0;
  const activePct = userStats?.totalUsers
    ? Math.round(((userStats?.activeUsers ?? 0) / userStats.totalUsers) * 100)
    : 0;
  const restaurantActivePct = restaurantStats?.total
    ? Math.round(((restaurantStats?.active ?? 0) / restaurantStats.total) * 100)
    : 0;
  const restaurantVerifiedPct = restaurantStats?.total
    ? Math.round(((restaurantStats?.verified ?? 0) / restaurantStats.total) * 100)
    : 0;

  const quickActions = [
    {
      label: 'Users',
      sub: `${userStats?.totalUsers ?? 0} total`,
      icon: 'users' as const,
      route: '/(admin)/(tabs)/users',
    },
    {
      label: 'Restaurants',
      sub: `${restaurantStats?.total ?? 0} total`,
      icon: 'home' as const,
      route: '/(admin)/(tabs)/restaurants',
    },
    {
      label: 'Orders',
      sub: platformMetrics ? `${platformMetrics.totalOrders} total` : 'All orders',
      icon: 'shopping-bag' as const,
      route: '/(admin)/(tabs)/orders',
    },
    {
      label: 'Analytics',
      sub: 'Insights',
      icon: 'bar-chart-2' as const,
      route: '/(admin)/(tabs)/analytics',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchUsers();
              refetchRestaurants();
            }}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Ultra-compact crimson header */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: 36,
            paddingBottom: 14,
            paddingHorizontal: 16,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: Colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...Shadow.lg,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.primary }}>{getInitials()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: '700', letterSpacing: 0.7 }}>WELCOME BACK</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800' }} numberOfLines={1}>
                    {user?.firstName || 'Admin'}
                  </Text>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Text style={{ color: Colors.white, fontSize: 8, fontWeight: '700', letterSpacing: 0.4 }}>ADMIN</Text>
                  </View>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                  {today} • All systems operational
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/(tabs)/notifications' as any)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={16} color={Colors.white} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: Colors.white,
                    borderWidth: 1.5,
                    borderColor: Colors.primary,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Translucent stats cards - ultra compact */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Feather name="users" size={12} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 5 }}>{userStats?.totalUsers ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', marginTop: 1 }}>Total Users</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Feather name="home" size={12} color={Colors.textDark} />
              <Text style={{ color: Colors.textDark, fontSize: 14, fontWeight: '800', marginTop: 5 }}>{restaurantStats?.total ?? 0}</Text>
              <Text style={{ color: 'Colors.textDark)', fontSize: 9, fontWeight: '600', marginTop: 1 }}>Restaurants</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Feather name="shopping-bag" size={12} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 5 }}>
                {platformMetrics?.totalOrders ?? 0}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', marginTop: 1 }}>Total Orders</Text>
            </View>
          </View>

          {/* Second row translucent - ultra compact */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.white }}>₹</Text>
              <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '800', marginTop: 4 }} numberOfLines={1}>
                Rs. {(platformMetrics?.totalRevenue ?? 0).toLocaleString()}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', marginTop: 1 }}>Revenue</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Feather name="activity" size={12} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 5 }}>{userStats?.activeUsers ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', marginTop: 1 }}>Active Users</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Feather name="check-circle" size={12} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 5 }}>{restaurantStats?.active ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', marginTop: 1 }}>Active Rest.</Text>
            </View>
          </View>
        </View>

        {/* Overlap PremiumCards */}
        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Platform Health</Text>
              <View
                style={{
                  backgroundColor: Colors.successBg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: Radius.full,
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.success }}>Live</Text>
              </View>
            </View>

            {isLoading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                {[
                  { label: 'User Verification', value: verifiedPct, sub: `${userStats?.verifiedUsers ?? 0} of ${userStats?.totalUsers ?? 0} verified`, icon: 'shield', color: Colors.primary, bg: Colors.primaryBg },
                  { label: 'Restaurant Verification', value: restaurantVerifiedPct, sub: `${restaurantStats?.verified ?? 0} of ${restaurantStats?.total ?? 0} verified`, icon: 'check-circle', color: '#2563EB', bg: '#EFF6FF' },
                  { label: 'User Activity', value: activePct, sub: `${userStats?.activeUsers ?? 0} active • ${userStats?.deletedUsers ?? 0} deleted`, icon: 'user-check', color: Colors.success, bg: Colors.successBg },
                  { label: 'Restaurant Activity', value: restaurantActivePct, sub: `${restaurantStats?.active ?? 0} active • ${restaurantStats?.deleted ?? 0} deleted`, icon: 'wifi', color: '#0D9488', bg: '#ECFDF5' },
                ].map((item) => (
                  <View key={item.label}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: item.bg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: `${item.color}20`,
                          }}
                        >
                          <Feather name={item.icon as any} size={14} color={item.color} />
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>{item.label}</Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>{item.value}%</Text>
                    </View>
                    <View style={{ height: 8, borderRadius: 999, backgroundColor: Colors.backgroundAlt, marginTop: 8, overflow: 'hidden' }}>
                      <View style={{ height: '100%', borderRadius: 999, backgroundColor: item.color, width: `${item.value}%` }} />
                    </View>
                    <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 6 }}>{item.sub}</Text>
                  </View>
                ))}
              </View>
            )}
          </PremiumCard>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 12 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {quickActions.map((a) => (
              <PremiumCard
                key={a.label}
                elevation="sm"
                padding={16}
                style={{ flex: 1, minWidth: '47%', flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <TouchableOpacity
                  onPress={() => router.push(a.route as any)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: Colors.primaryBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#FECDD3',
                    }}
                  >
                    <Feather name={a.icon} size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>{a.label}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{a.sub}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              </PremiumCard>
            ))}
          </View>
        </View>

        {/* CTA PremiumCard */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
  <PremiumCard
    elevation="md"
    padding={0}
    style={{
      overflow: 'hidden',
      backgroundColor: Colors.primary,
      borderWidth: 0,
    }}
  >
    <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>Manage users</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6, lineHeight: 16 }}>
          Search, filter, edit roles and handle deletions from one place.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/(tabs)/users' as any)}
          style={{
            marginTop: 14,
            backgroundColor: Colors.white,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: Radius.full,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'flex-start',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.textDark }}>Open Users</Text>
          <Feather name="arrow-right" size={14} color={Colors.textDark} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        }}
      >
        <Feather name="users" size={30} color={Colors.white} />
      </View>
    </View>
  </PremiumCard>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 14,
    }}
  >
    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success }} />
    <Text style={{ fontSize: 11, color: Colors.textTertiary }}>
      {isLoading ? 'Syncing…' : `Last updated just now • ${userStats?.totalUsers ?? 0} users • ${restaurantStats?.total ?? 0} restaurants`}
    </Text>
  </View>
</View>
      </ScrollView>
    </View>
  );
}
