import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAuth } from '@/contexts/AuthContext';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';
import { useUnreadCount } from '@/hooks/notification/useUnreadCount';
import {
  StatCard,
  StatusPill,
  SectionHeader,
  ContentWidth,
  useResponsive,
  rs,
  type OrderStatus,
} from '@/components/owner/kit';

// ─── Mock live feed (replace with real hooks when order APIs land) ───
const RECENT_ORDERS: Array<{
  id: string;
  customer: string;
  items: string;
  total: number;
  time: string;
  status: OrderStatus;
}> = [
  { id: '1', customer: 'Anish Sharma', items: '2x Chicken Momo · 1x Thali', total: 840, time: '2 min ago', status: 'pending' },
  { id: '2', customer: 'Sita Gurung', items: '1x Pizza Margherita · 2x Coke', total: 1260, time: '15 min ago', status: 'preparing' },
  { id: '3', customer: 'Ram Thapa', items: '3x Burger · 1x Fries', total: 720, time: '28 min ago', status: 'ready' },
];

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const { data: restaurants, isLoading, refetch } = useMyRestaurants();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const stats = [
    { icon: 'package' as const, label: 'Restaurants', value: restaurants?.length ?? 0, tone: 'brand' as const },
    { icon: 'shopping-bag' as const, label: "Today's Orders", value: 24, trend: '+12%', tone: 'green' as const },
    { icon: 'clock' as const, label: 'Pending', value: 8, tone: 'amber' as const },
    { icon: 'trending-up' as const, label: "Today's Revenue", value: rs(12450), trend: '+8%', tone: 'green' as const },
  ];

  const quickActions = [
    { label: 'New Order?', sub: 'View queue', icon: 'bell' as const, bg: 'bg-red-500', route: '/(restaurant-owner)/orders' },
    { label: 'Add Menu Item', sub: 'Grow your menu', icon: 'plus-circle' as const, bg: 'bg-green-600', route: '/(restaurant-owner)/menu/create' },
    { label: 'Categories', sub: 'Organise items', icon: 'grid' as const, bg: 'bg-slate-800', route: '/(restaurant-owner)/categories' },
    { label: 'Earnings', sub: 'Track payouts', icon: 'dollar-sign' as const, bg: 'bg-emerald-600', route: '/(restaurant-owner)/earnings' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ContentWidth(isTablet ? 820 : 9999)}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FFFFFF" />
        }
      >
        {/* ─── Hero header — clean professional red, round avatar, real notification count ─── */}
        <View className="bg-primary" style={{ paddingTop: insets.top }}>
          <View className="rounded-b-[32px] bg-primary px-5 pb-16 pt-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-3 pr-3">
                {/* Round avatar — shows real imageUrl from DB immediately after upload */}
                <View className="h-12 w-12 overflow-hidden rounded-full border-2 border-white/30 bg-white/15">
                  {user?.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-white/10">
                      <Text className="text-sm font-extrabold text-white">
                        {(user?.firstName?.charAt(0) || 'O').toUpperCase()}
                        {(user?.lastName?.charAt(0) || '').toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-medium tracking-wide text-white/80" numberOfLines={1}>
                    {greeting},
                  </Text>
                  <Text className="mt-0.5 text-[20px] font-extrabold leading-6 tracking-tight text-white" numberOfLines={1}>
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Owner'}
                  </Text>
                  <Text className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70" numberOfLines={1}>
                    Restaurant Owner
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push('/(restaurant-owner)/notifications')}
                accessibilityRole="button"
                accessibilityLabel={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                hitSlop={8}
                className="relative items-center justify-center border rounded-full h-11 w-11 border-white/20 bg-white/15 active:bg-white/25"
              >
                <Feather name="bell" size={19} color="#FFFFFF" />
                {unreadCount > 0 ? (
                  <View
                    className="absolute -right-1 -top-1 items-center justify-center rounded-full bg-red-500 border border-white"
                    style={{ minWidth: 20, height: 20, paddingHorizontal: 4 }}
                  >
                    <Text className="text-[11px] font-extrabold leading-none text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── Stats overlapping the hero ─── */}
        <View className="flex-row flex-wrap justify-center gap-3 px-4 -mt-10">
          {stats.map((s) => (
            <View
              key={s.label}
              className="grow"
              style={{ width: isTablet ? undefined : '47.5%', minWidth: 150, maxWidth: isTablet ? 220 : undefined }}
            >
              <StatCard icon={s.icon} label={s.label} value={s.value} trend={'trend' in s ? s.trend : undefined} tone={s.tone} />
            </View>
          ))}
        </View>

        <View className="px-4">
          {/* ─── Quick actions ─── */}
          <View className="mt-7">
            <SectionHeader title="Quick Actions" />
            <View className="flex-row flex-wrap justify-center gap-3">
              {quickActions.map((a) => (
                <Pressable
                  key={a.label}
                  onPress={() => router.push(a.route as never)}
                  className="flex-col p-4 bg-white border border-gray-100 shadow-sm grow rounded-2xl shadow-gray-100 active:opacity-80"
                  style={{ width: isTablet ? undefined : '47.5%', minWidth: 150, maxWidth: isTablet ? 250 : undefined }}
                >
                  <View className={`h-10 w-10 items-center justify-center rounded-xl ${a.bg}`}>
                    <Feather name={a.icon} size={18} color="#FFFFFF" />
                  </View>
                  <Text className="mt-2.5 text-sm font-bold text-gray-900">{a.label}</Text>
                  <Text className="text-xs text-gray-400">{a.sub}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ─── My restaurants ─── */}
          <View className="mt-7">
            <SectionHeader
              title="My Restaurants"
              actionLabel="Manage all"
              onAction={() => router.push('/(restaurant-owner)/restaurant')}
            />
            {restaurants && restaurants.length > 0 ? (
              <View className="gap-3">
                {restaurants.slice(0, 2).map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => router.push(`/(restaurant-owner)/restaurant/${r.id}` as never)}
                    className="flex-row items-center rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm shadow-gray-100 active:bg-gray-50"
                  >
                    <View className="overflow-hidden h-14 w-14 rounded-xl bg-red-50">
                      {r.logoUrl ? (
                        <Image source={{ uri: r.logoUrl }} className="w-full h-full" contentFit="cover" />
                      ) : (
                        <View className="items-center justify-center w-full h-full">
                          <Text className="text-xl font-extrabold text-primary">
                            {r.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1 mx-3">
                      <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                        {r.name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                        {r.cuisineType} · {r.address}
                      </Text>
                      <View className="mt-1.5 flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1">
                          <View className={`h-1.5 w-1.5 rounded-full ${r.isOpen ? 'bg-green-500' : 'bg-red-400'}`} />
                          <Text className={`text-[11px] font-semibold ${r.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            {r.isOpen ? 'Open now' : 'Closed'}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Feather name="star" size={11} color="#F59E0B" />
                          <Text className="text-[11px] font-semibold text-gray-600">
                            {r.averageRating ? Number(r.averageRating).toFixed(1) : 'New'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={18} color="#CBD5E1" />
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="items-center px-6 border border-green-300 border-dashed rounded-2xl bg-green-50/50 py-7">
                <View className="items-center justify-center bg-white rounded-full h-14 w-14">
                  <Feather name="plus" size={24} color="#16A34A" />
                </View>
                <Text className="mt-3 text-sm font-bold text-gray-900">Add your first restaurant</Text>
                <Text className="mt-0.5 text-center text-xs leading-4 text-gray-500">
                  Set up your kitchen profile and start receiving orders.
                </Text>
                <Pressable
                  onPress={() => router.push('/(restaurant-owner)/restaurant/create')}
                  className="mt-4 rounded-full bg-green-600 px-6 py-2.5 active:bg-green-700"
                >
                  <Text className="text-xs font-bold text-white">Create Restaurant</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* ─── Live orders ─── */}
          <View className="mb-8 mt-7">
            <SectionHeader
              title="Live Orders"
              actionLabel="See all"
              onAction={() => router.push('/(restaurant-owner)/orders')}
            />
            <View className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl shadow-gray-100">
              {RECENT_ORDERS.map((o, i) => (
                <Pressable
                  key={o.id}
                  onPress={() => router.push(`/(restaurant-owner)/orders/${o.id}` as never)}
                  className={`flex-row items-center px-4 py-3.5 active:bg-gray-50 ${
                    i !== RECENT_ORDERS.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-xl ${
                      o.status === 'pending'
                        ? 'bg-amber-50'
                        : o.status === 'preparing'
                          ? 'bg-orange-50'
                          : 'bg-blue-50'
                    }`}
                  >
                    <Feather
                      name={o.status === 'pending' ? 'inbox' : o.status === 'preparing' ? 'cpu' : 'check-circle'}
                      size={17}
                      color={o.status === 'pending' ? '#D97706' : o.status === 'preparing' ? '#EA580C' : '#2563EB'}
                    />
                  </View>
                  <View className="flex-1 mx-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-sm font-bold text-gray-900" numberOfLines={1}>
                        {o.customer}
                      </Text>
                      <Text className="ml-2 text-sm font-extrabold text-gray-900">{rs(o.total)}</Text>
                    </View>
                    <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                      {o.items} · {o.time}
                    </Text>
                    <View className="mt-1.5">
                      <StatusPill status={o.status} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
