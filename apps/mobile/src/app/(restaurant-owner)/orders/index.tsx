import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StatusPill,
  FilterChip,
  EmptyState,
  ContentWidth,
  useResponsive,
  rs,
  type OrderStatus,
} from '@/components/res-owner/owner/kit';
import { useRestaurantOrders } from '@/hooks/owner/orders/useRestaurantOrders';
import { useOrderStore } from '@/stores/customer/orderStore';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ backgroundColor: Colors.primary, paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
        <View style={{ maxWidth: isTablet ? 688 : undefined, alignSelf: 'center', width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.white }}>Orders</Text>
              <Text style={{ marginTop: 2, fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{activeCount} active • {rs(revenueToday)} today • {orders.length} total</Text>
            </View>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Feather name="shopping-bag" size={16} color={Colors.white} />
              {counts.pending ? (
                <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1, borderColor: Colors.primary }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.primary }}>{counts.pending}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Feather name="search" size={14} color={Colors.white} />
            <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
              style={{ flex: 1, marginLeft: 8, fontSize: 13, color: Colors.white }}
              placeholder="Search order, customer or item…"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Feather name="x-circle" size={16} color={Colors.white} />
              </Pressable>
            ) : null}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ alignSelf: 'center', paddingHorizontal: 16, gap: 6 }}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: Radius.full,
                backgroundColor: tab === t.key ? Colors.white : 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: tab === t.key ? Colors.white : 'rgba(255,255,255,0.25)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: tab === t.key ? Colors.primary : Colors.white }}>{t.label}</Text>
              {typeof counts[t.key] === 'number' ? (
                <View style={{ backgroundColor: tab === t.key ? Colors.primaryBg : 'rgba(255,255,255,0.2)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: tab === t.key ? Colors.primary : Colors.white }}>{counts[t.key]}</Text>
                </View>
              ) : null}
            </Pressable>
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
            <PremiumCard
              elevation="sm"
              padding={14}
              pressable
              onPress={() => router.push(`/(restaurant-owner)/orders/${item.id}` as never)}
              style={{ flex: isTablet ? 1 : undefined }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                <StatusPill status={item.status} />
              </View>
              <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary }}>{item.customer.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>{item.customer}</Text>
                  <Text style={{ marginTop: 2, fontSize: 11, color: Colors.textSecondary }} numberOfLines={1}>{item.items}</Text>
                </View>
              </View>
              <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.borderLight, borderStyle: 'dashed', paddingTop: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Feather name="clock" size={12} color={Colors.textTertiary} />
                  <Text style={{ fontSize: 11, color: Colors.textTertiary }}>{item.time}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.success }}>{rs(item.total)}</Text>
                  <Feather name="chevron-right" size={14} color={Colors.textTertiary} />
                </View>
              </View>
            </PremiumCard>
          )}
        />
      )}
    </View>
  );
}
