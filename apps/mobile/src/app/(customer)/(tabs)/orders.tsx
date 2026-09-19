import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import EmptyState from '@/components/ui/EmptyState';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useOrders } from '@/hooks/customer/useOrders';
import { useOrderStore } from '@/stores/customer/orderStore';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';

type FilterKey = 'all' | 'active' | 'delivered' | 'cancelled';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'];

export default function Orders() {
  const { refetch, isRefetching } = useOrders();
  const { orders, isLoading } = useOrderStore();
  const [filter, setFilter] = useState<FilterKey>('all');

  const onRefresh = () => refetch();

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: orders.length, active: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) {
      const s = o.orderStatus;
      if (ACTIVE_STATUSES.includes(s)) c.active++;
      else if (s === 'DELIVERED') c.delivered++;
      else if (s === 'CANCELLED') c.cancelled++;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => {
      if (filter === 'active') return ACTIVE_STATUSES.includes(o.orderStatus);
      if (filter === 'delivered') return o.orderStatus === 'DELIVERED';
      if (filter === 'cancelled') return o.orderStatus === 'CANCELLED';
      return true;
    });
  }, [orders, filter]);

  if (isLoading && orders.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>{orders.length} {orders.length === 1 ? 'order' : 'orders'} • Track and reorder</Text>
        </SafeAreaView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 6 }}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: Radius.full,
                backgroundColor: filter === f.key ? Colors.white : 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: filter === f.key ? Colors.white : 'rgba(255,255,255,0.25)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: filter === f.key ? Colors.primary : Colors.white }}>{f.label}</Text>
              {counts[f.key] > 0 ? (
                <View style={{ backgroundColor: filter === f.key ? Colors.primaryBg : 'rgba(255,255,255,0.2)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: filter === f.key ? Colors.primary : Colors.white }}>{counts[f.key]}</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {orders.length === 0 ? (
        <EmptyState icon="shopping-bag" title="No orders yet" description="Your orders will appear here. Start exploring!" actionLabel="Explore" onAction={() => router.push('/(customer)/(tabs)/explore' as any)} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={Colors.primary} />}>
          {filtered.length === 0 ? (
            <EmptyState icon="inbox" title="No orders here" description={filter === 'active' ? 'No active orders right now.' : filter === 'delivered' ? 'No delivered orders yet.' : 'No cancelled orders.'} />
          ) : (
            filtered.map((o: any) => {
              const itemsText = Array.isArray(o.items) ? o.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ') : '';
              const time = o.createdAt ? new Date(o.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <PremiumCard key={o.id} style={{ padding: 0, overflow: 'hidden' } as any}>
                  <View style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textDark }}>{o.restaurantName || 'Restaurant'}</Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{itemsText || `${o.totalAmount ? `Rs. ${o.totalAmount}` : ''}`}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 6 }}>{time} • Rs. {o.totalAmount}</Text>
                    </View>
                    <OrderStatusBadge status={o.orderStatus} />
                  </View>
                  <View style={{ flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F1F5F9' }}>
                    <TouchableOpacity style={styles.action} onPress={() => router.push(`/(customer)/order/${o.id}` as any)}>
                      <Text style={styles.actionText}>View Details</Text>
                    </TouchableOpacity>
                    <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: '#F1F5F9' }} />
                    <TouchableOpacity style={styles.action} onPress={() => router.push(`/(customer)/restaurant/${o.restaurantId}` as any)}>
                      <Text style={[styles.actionText, { color: Colors.primary }]}>Reorder</Text>
                    </TouchableOpacity>
                  </View>
                </PremiumCard>
              );
            })
          )}
          {orders.some((o: any) => ['PICKED_UP'].includes(o.orderStatus)) && (
            <TouchableOpacity onPress={() => { const active = orders.find((o: any) => ['PICKED_UP'].includes(o.orderStatus)); if (active) router.push(`/(customer)/order-tracking/${active.id}` as any); }} style={styles.trackBtn}>
              <Feather name="map-pin" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Track Live Order</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] },
  title: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.textMedium },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    marginTop: 4,
    ...Shadow.primary,
  },
});