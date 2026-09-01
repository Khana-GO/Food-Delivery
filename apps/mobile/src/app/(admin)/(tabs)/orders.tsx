import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';
import { useAdminOrders } from '@/hooks/admin/order/useAdminOrders';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';

export default function AdminOrdersTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useAdminOrders({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter as any,
  } as any);

  const orders = (data as any)?.data ?? (data as any)?.orders ?? [];
  const total = (data as any)?.total ?? orders.length;
  const totalPages = (data as any)?.totalPages ?? 1;

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} tintColor={Colors.primary} colors={[Colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
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
                <Feather name="shopping-bag" size={14} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>Orders</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>{total} total • Manage all orders</Text>
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white }}>Live</Text>
            </View>
          </View>

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
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 12, color: Colors.white }}
              placeholder="Search orders, customer, restaurant..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x-circle" size={16} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 16, marginTop: 10 }}>
            {statuses.map((s) => {
              const active = (s === 'ALL' && !statusFilter) || statusFilter === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatusFilter(s === 'ALL' ? undefined : s)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: Radius.full,
                    backgroundColor: active ? Colors.white : 'rgba(255,255,255,0.18)',
                    borderWidth: 1,
                    borderColor: active ? Colors.white : 'rgba(255,255,255,0.25)',
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '700', color: active ? Colors.primary : Colors.white }}>{s.replace('_', ' ')}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : orders.length === 0 ? (
            <PremiumCard elevation="sm" padding={32} style={{ alignItems: 'center', marginTop: 8 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                <Feather name="shopping-bag" size={28} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, marginTop: 12 }}>No orders found</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' }}>Try adjusting filters or search</Text>
            </PremiumCard>
          ) : (
            orders.map((order: any) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/(admin)/order/${order.id}` as any)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: Radius.xl,
                  padding: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: Colors.borderLight,
                  ...Shadow.sm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.textDark }}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  <OrderStatusBadge status={order.orderStatus} />
                </View>
                <View style={{ marginTop: 8, gap: 5 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="home" size={12} color={Colors.textTertiary} />
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, flex: 1 }} numberOfLines={1}>{order.restaurantName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="user" size={12} color={Colors.textTertiary} />
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, flex: 1 }} numberOfLines={1}>{order.customerName} • {order.deliveryAddress}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Rs. {order.totalAmount}</Text>
                    <Text style={{ fontSize: 10, color: Colors.textTertiary }}>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          {orders.length > 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontSize: 11, color: Colors.textTertiary }}>Page {page} of {totalPages} • {total} orders</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
