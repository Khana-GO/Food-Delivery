import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import EmptyState from '@/components/ui/EmptyState';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius } from '@/constants/theme';
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 5 }}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: Radius.full,
                backgroundColor: filter === f.key ? Colors.white : 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: filter === f.key ? Colors.white : 'rgba(255,255,255,0.25)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Text style={{ fontSize: 10.5, fontWeight: '700', color: filter === f.key ? Colors.primary : Colors.white }}>{f.label}</Text>
              {counts[f.key] > 0 ? (
                <View style={{ backgroundColor: filter === f.key ? Colors.primaryBg : 'rgba(255,255,255,0.2)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 8 }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: filter === f.key ? Colors.primary : Colors.white }}>{counts[f.key]}</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {orders.length === 0 ? (
        <EmptyState icon="shopping-bag" title="No orders yet" description="Your orders will appear here. Start exploring!" actionLabel="Explore" onAction={() => router.push('/(customer)/(tabs)/explore' as any)} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14, gap: 10 }} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={Colors.primary} />}>
          {filtered.length === 0 ? (
            <EmptyState icon="inbox" title="No orders here" description={filter === 'active' ? 'No active orders right now.' : filter === 'delivered' ? 'No delivered orders yet.' : 'No cancelled orders.'} />
          ) : (
            filtered.map((o: any) => {
              const itemsText = Array.isArray(o.items) ? o.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ') : '';
              const time = o.createdAt ? new Date(o.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
              const logoUrl = o.restaurantLogoUrl;
              const initial = (o.restaurantName || 'R').charAt(0).toUpperCase();
              return (
                <PremiumCard key={o.id} style={{ padding: 0, overflow: 'hidden' } as any}>
                  <View style={{ padding: 11, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.logoWrap}>
                      {logoUrl ? (
                        <Image source={{ uri: logoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                      ) : (
                        <Text style={styles.logoInitial}>{initial}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 9 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>{o.restaurantName || 'Restaurant'}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }} numberOfLines={1}>{itemsText || `${o.totalAmount ? `Rs. ${o.totalAmount}` : ''}`}</Text>
                      <Text style={{ fontSize: 10, color: Colors.textTertiary, marginTop: 4 }}>{time} • Rs. {o.totalAmount}</Text>
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
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] },
  title: { fontSize: 18, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1, fontWeight: '500' },
  logoWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoInitial: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9 },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.textMedium },
});