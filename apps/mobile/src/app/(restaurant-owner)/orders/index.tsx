import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, FlatList } from 'react-native';
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
} from '@/components/owner/kit';

type TabKey = 'all' | OrderStatus;

interface Order {
  id: string;
  customer: string;
  items: string;
  total: number;
  time: string;
  status: OrderStatus;
}

const ORDERS: Order[] = [
  { id: 'ORD-124', customer: 'Anish Sharma', items: '2x Chicken Momo · 1x Thali', total: 840, time: '2 min ago', status: 'pending' },
  { id: 'ORD-123', customer: 'Sita Gurung', items: '1x Pizza Margherita · 2x Coke', total: 1260, time: '15 min ago', status: 'preparing' },
  { id: 'ORD-122', customer: 'Ram Thapa', items: '3x Burger · 1x Fries', total: 720, time: '28 min ago', status: 'ready' },
  { id: 'ORD-121', customer: 'Hari Lama', items: '1x Biryani · 1x Raita', total: 560, time: '45 min ago', status: 'delivered' },
  { id: 'ORD-120', customer: 'Gita Adhikari', items: '1x Chowmein · 1x Coke', total: 380, time: '1 hr ago', status: 'cancelled' },
];

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: ORDERS.length };
    for (const o of ORDERS) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(
    () =>
      ORDERS.filter((o) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          o.customer.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.items.toLowerCase().includes(q);
        const matchesTab = tab === 'all' || o.status === tab;
        return matchesSearch && matchesTab;
      }),
    [search, tab]
  );

  const activeCount = (counts.pending || 0) + (counts.preparing || 0) + (counts.ready || 0);
  const revenueToday = ORDERS.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* ─── Header ─── */}
      <View className="bg-white px-4 pb-3 pt-3">
        <View style={{ maxWidth: isTablet ? 688 : undefined, alignSelf: 'center', width: '100%' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-extrabold tracking-tight text-gray-900">Orders</Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                {activeCount} active · {rs(revenueToday)} today
              </Text>
            </View>
            <View className="relative h-11 w-11 items-center justify-center rounded-full bg-green-50">
              <Feather name="check-circle" size={19} color="#16A34A" />
              <View className="absolute -right-0.5 -top-0.5 h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1">
                <Text className="text-[10px] font-bold text-white">{counts.pending || 0}</Text>
              </View>
            </View>
          </View>

          {/* ─── Search ─── */}
          <View className="mt-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by order, customer or item…" />
          </View>
        </View>

        {/* ─── Status tabs ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ alignSelf: 'center', paddingHorizontal: 16 }}
        >
          {TABS.map((t) => (
            <FilterChip
              key={t.key}
              label={t.label}
              active={tab === t.key}
              count={counts[t.key]}
              onPress={() => setTab(t.key)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ─── List ─── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? { gap: 12, paddingHorizontal: 16 } : undefined}
        contentContainerStyle={{ padding: 16, gap: 12, ...ContentWidth(isTablet ? 960 : 9999) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="inbox"
            title="No orders here"
            message={
              search
                ? `Nothing matches “${search}”. Try a different search.`
                : tab === 'all'
                  ? 'New orders will appear here the moment customers place them.'
                  : `You have no ${tab} orders right now.`
            }
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(restaurant-owner)/orders/${item.id}` as never)}
            className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100 active:bg-gray-50 ${
              isTablet ? 'flex-1' : ''
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm font-extrabold tracking-wide text-gray-900">#{item.id}</Text>
              </View>
              <StatusPill status={item.status} />
            </View>

            <View className="mt-3 flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Text className="text-sm font-bold text-slate-600">{item.customer.charAt(0)}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
                  {item.customer}
                </Text>
                <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                  {item.items}
                </Text>
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
    </View>
  );
}
