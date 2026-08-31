import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StatusPill,
  FilterChip,
  SearchInput,
  EmptyState,
  ContentWidth,
  useResponsive,
  rs,
  type OrderStatus,
} from '@/components/res-owner/owner/kit';
import { useRestaurantOrders } from '@/hooks/owner/orders/useRestaurantOrders';
import { useOrderStore } from '@/stores/customer/orderStore';

type TabKey = 'all' | OrderStatus;

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

// Map API uppercase to kit lowercase
const toKitStatus = (apiStatus: string): OrderStatus => apiStatus.toLowerCase() as OrderStatus;
const toApiStatus = (kitStatus: TabKey): string | undefined => (kitStatus === 'all' ? undefined : kitStatus.toUpperCase());

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('all');
  const { data, isLoading, refetch, isRefetching } = useRestaurantOrders(tab === 'all' ? undefined : toApiStatus(tab));
  const { orders: storeOrders } = useOrderStore();

  // Prefer query data, fallback to store
  const rawOrders: any[] = (data as any)?.data ?? (data as any) ?? storeOrders ?? [];

  const orders = useMemo(() => {
    return rawOrders.map((o: any) => ({
      id: o.id,
      customer: o.customerName || o.customer || 'Customer',
      items: Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity}x ${i.name || i.itemNameSnapshot}`).join(' · ') : o.items || '',
      total: o.totalAmount ?? o.total ?? 0,
      time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      status: toKitStatus(o.orderStatus || o.status || 'pending'),
      raw: o,
    }));
  }, [rawOrders]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.items.toLowerCase().includes(q);
        const matchesTab = tab === 'all' || o.status === tab;
        return matchesSearch && matchesTab;
      }),
    [orders, search, tab],
  );

  const activeCount = (counts.pending || 0) + (counts.preparing || 0) + (counts.ready || 0);
  const revenueToday = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="bg-white px-4 pb-3 pt-3">
        <View style={{ maxWidth: isTablet ? 688 : undefined, alignSelf: 'center', width: '100%' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-extrabold tracking-tight text-gray-900">Orders</Text>
              <Text className="mt-0.5 text-xs text-gray-500">{activeCount} active · {rs(revenueToday)} today</Text>
            </View>
            <View className="relative h-11 w-11 items-center justify-center rounded-full bg-green-50">
              <Feather name="check-circle" size={19} color="#16A34A" />
              <View className="absolute -right-0.5 -top-0.5 h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1">
                <Text className="text-[10px] font-bold text-white">{counts.pending || 0}</Text>
              </View>
            </View>
          </View>
          <View className="mt-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by order, customer or item…" />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ alignSelf: 'center', paddingHorizontal: 16 }}>
          {TABS.map((t) => (
            <FilterChip key={t.key} label={t.label} active={tab === t.key} count={counts[t.key]} onPress={() => setTab(t.key)} />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#E23744" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? { gap: 12, paddingHorizontal: 16 } : undefined}
          contentContainerStyle={{ padding: 16, gap: 12, ...ContentWidth(isTablet ? 960 : 9999) }}
          refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon="inbox"
              title="No orders here"
              message={search ? `Nothing matches “${search}”.` : tab === 'all' ? 'New orders will appear here.' : `You have no ${tab} orders.`}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(restaurant-owner)/orders/${item.id}` as never)}
              className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100 active:bg-gray-50 ${isTablet ? 'flex-1' : ''}`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-extrabold tracking-wide text-gray-900">#{item.id.slice(0, 8)}</Text>
                <StatusPill status={item.status} />
              </View>
              <View className="mt-3 flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Text className="text-sm font-bold text-slate-600">{item.customer.charAt(0)}</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>{item.customer}</Text>
                  <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>{item.items}</Text>
                </View>
              </View>
              <View className="mt-3 flex-row items-center justify-between border-t border-dashed border-gray-100 pt-3">
                <View className="flex-row items-center">
                  <Feather name="clock" size={13} color="#94A3B8" />
                  <Text className="ml-1 text-xs text-gray-400">{item.time}</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base font-extrabold text-green-600">{rs(item.total)}</Text>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
