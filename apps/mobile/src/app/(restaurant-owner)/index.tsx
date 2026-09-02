import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/contexts/AuthContext';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';
import { useRestaurantOrders } from '@/hooks/owner/orders/useRestaurantOrders';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

type KitStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'confirmed';
const toKitStatus = (api: string): KitStatus => api.toLowerCase() as any;

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: restaurants, isLoading: restoLoading, refetch: refetchResto, isRefetching: restoRefetching } = useMyRestaurants();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders, isRefetching: ordersRefetching } = useRestaurantOrders();

  const ordersRaw: any[] = (ordersData as any)?.data ?? (ordersData as any) ?? [];

  const statsComputed = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayOrders = ordersRaw.filter((o: any) => new Date(o.createdAt) >= now);
    const pending = ordersRaw.filter((o: any) => (o.orderStatus || o.status) === 'PENDING' || (o.orderStatus || o.status) === 'pending').length;
    const revenueToday = todayOrders.filter((o: any) => (o.orderStatus || o.status) !== 'CANCELLED').reduce((s: number, o: any) => s + (o.totalAmount ?? o.total ?? 0), 0);
    return {
      todayCount: todayOrders.length,
      pending,
      revenueToday,
      totalOrders: ordersRaw.length,
    };
  }, [ordersRaw]);

  const liveOrders = useMemo(() => {
    const live = ordersRaw
      .filter((o: any) => ['PENDING', 'PREPARING', 'READY', 'CONFIRMED'].includes((o.orderStatus || o.status || '').toUpperCase()))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((o: any) => {
        const status = toKitStatus(o.orderStatus || o.status || 'pending');
        const items = Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity}x ${i.name || i.itemNameSnapshot}`).join(' · ') : '';
        const created = o.createdAt ? new Date(o.createdAt) : new Date();
        const diffMin = Math.max(0, Math.floor((Date.now() - created.getTime()) / 60000));
        const time = diffMin < 1 ? 'just now' : diffMin < 60 ? `${diffMin} min ago` : `${Math.floor(diffMin / 60)} hr ago`;
        return {
          id: o.id,
          customer: o.customerName || o.customer || 'Customer',
          items,
          total: o.totalAmount ?? o.total ?? 0,
          time,
          status,
        };
      });
    return live;
  }, [ordersRaw]);

  const onRefresh = useCallback(() => {
    refetchResto();
    refetchOrders();
  }, [refetchResto, refetchOrders]);

  const refreshing = restoRefetching || ordersRefetching;

  const quickActions = [
    { label: 'Orders', sub: `${statsComputed.pending} pending`, icon: 'shopping-bag' as const, route: '/(restaurant-owner)/orders' },
    { label: 'Add Item', sub: 'Grow menu', icon: 'plus-circle' as const, route: '/(restaurant-owner)/menu/create' },
    { label: 'Menu', sub: 'View dishes', icon: 'book-open' as const, route: '/(restaurant-owner)/menu' },
    { label: 'Earnings', sub: rs(statsComputed.revenueToday), icon: 'dollar-sign' as const, route: '/(restaurant-owner)/earnings' },
  ];

  const initials = `${user?.firstName?.charAt(0).toUpperCase() || 'O'}${user?.lastName?.charAt(0).toUpperCase() || ''}`;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        {/* ─── Premium crimson header ─── */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: insets.top + 12,
            paddingBottom: 28,
            paddingHorizontal: 20,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: Colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...Shadow.lg,
                }}
              >
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary }}>{initials}</Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 0.7 }} numberOfLines={1}>
                  {(new Date().getHours() < 12 ? 'GOOD MORNING' : new Date().getHours() < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, minWidth: 0 }}>
                  <Text style={{ color: Colors.white, fontSize: 17, fontWeight: '800', flexShrink: 1, minWidth: 0 }} numberOfLines={1} ellipsizeMode="tail">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Owner'}
                  </Text>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    <Text style={{ color: Colors.white, fontSize: 8, fontWeight: '700', letterSpacing: 0.4 }}>OWNER</Text>
                  </View>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
                  {restaurants?.length ?? 0} restaurants • {statsComputed.totalOrders} orders
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(restaurant-owner)/notifications' as any)}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', flexShrink: 0 }}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color={Colors.white} />
              {unreadCount > 0 && (
                <View style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary }} />
              )}
            </TouchableOpacity>
          </View>

          {/* Translucent real stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Feather name="shopping-bag" size={16} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 8 }}>{statsComputed.todayCount}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Today's Orders</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Feather name="clock" size={16} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 8 }}>{statsComputed.pending}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Pending</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', ...Shadow.sm }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary }}>₹</Text>
              <Text style={{ color: Colors.textDark, fontSize: 15, fontWeight: '800', marginTop: 8 }} numberOfLines={1}>{rs(statsComputed.revenueToday)}</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 }}>Revenue Today</Text>
            </View>
          </View>
        </View>

        {/* Overlap cards */}
        <View style={{ paddingHorizontal: 16, marginTop: -16, gap: 16 }}>
          {/* Restaurants count card */}
          <PremiumCard elevation="md" padding={16} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
              <Feather name="package" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>{restaurants?.length ?? 0} Stores</Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{restaurants?.filter((r) => r.isOpen).length ?? 0} open • {restaurants?.filter((r) => r.isVerified).length ?? 0} verified</Text>
            </View>
            {restoLoading ? <ActivityIndicator color={Colors.primary} /> : <Feather name="chevron-right" size={18} color={Colors.textTertiary} />}
          </PremiumCard>

          {/* Quick Actions */}
          <View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 10 }}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {quickActions.map((a) => (
                <PremiumCard key={a.label} elevation="sm" padding={0} pressable onPress={() => router.push(a.route as never)} style={{ flex: 1, minWidth: '46%', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                    <Feather name={a.icon} size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>{a.label}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }}>{a.sub}</Text>
                  </View>
                </PremiumCard>
              ))}
            </View>
          </View>

          {/* My Restaurants */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>My Restaurants</Text>
              <TouchableOpacity onPress={() => router.push('/(restaurant-owner)/restaurant' as any)} activeOpacity={0.7}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Manage all</Text>
              </TouchableOpacity>
            </View>
            {restoLoading ? (
              <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
            ) : restaurants && restaurants.length > 0 ? (
              <View style={{ gap: 10 }}>
                {restaurants.slice(0, 2).map((r) => (
                  <PremiumCard key={r.id} elevation="sm" padding={0} pressable onPress={() => router.push(`/(restaurant-owner)/restaurant/${r.id}` as any)} style={{ overflow: 'hidden' }}>
                    <View style={{ height: 72, backgroundColor: Colors.backgroundAlt }}>
                      {r.coverImageUrl ? <Image source={{ uri: r.coverImageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name="image" size={22} color={Colors.textMuted} /></View>}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: -20 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.white, ...Shadow.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                        {r.logoUrl ? <Image source={{ uri: r.logoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary }}>{r.name.charAt(0).toUpperCase()}</Text>}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }} numberOfLines={1}>{r.name}</Text>
                        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }} numberOfLines={1}>{r.cuisineType} • {r.address}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: r.isOpen ? Colors.success : Colors.error }} />
                            <Text style={{ fontSize: 10, fontWeight: '700', color: r.isOpen ? Colors.success : Colors.error }}>{r.isOpen ? 'Open' : 'Closed'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Feather name="star" size={11} color={Colors.ratingGold} />
                            <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary }}>{r.averageRating ? Number(r.averageRating).toFixed(1) : 'New'}</Text>
                          </View>
                        </View>
                      </View>
                      <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
                    </View>
                  </PremiumCard>
                ))}
              </View>
            ) : (
              <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 24 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                  <Feather name="plus" size={28} color={Colors.primary} />
                </View>
                <Text style={{ marginTop: 10, fontSize: 14, fontWeight: '700', color: Colors.textDark }}>Add your first restaurant</Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' }}>Set up your kitchen and start receiving orders.</Text>
                <TouchableOpacity onPress={() => router.push('/(restaurant-owner)/restaurant/create' as any)} style={{ marginTop: 14, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full, ...Shadow.sm }} activeOpacity={0.7}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.white }}>Create Restaurant</Text>
                </TouchableOpacity>
              </PremiumCard>
            )}
          </View>

          {/* Live Orders - real */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Live Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(restaurant-owner)/orders' as any)} activeOpacity={0.7}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>See all</Text>
              </TouchableOpacity>
            </View>
            {ordersLoading && !ordersRaw.length ? (
              <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
            ) : liveOrders.length === 0 ? (
              <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 24 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                  <Feather name="inbox" size={22} color={Colors.primary} />
                </View>
                <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '700', color: Colors.textTertiary }}>No live orders</Text>
                <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>New orders will appear here in real time</Text>
              </PremiumCard>
            ) : (
              <PremiumCard elevation="sm" padding={0} style={{ overflow: 'hidden' }}>
                {liveOrders.map((o, idx) => (
                  <TouchableOpacity
                    key={o.id}
                    onPress={() => router.push(`/(restaurant-owner)/orders/${o.id}` as any)}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: idx !== liveOrders.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}
                    activeOpacity={0.7}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: o.status === 'pending' ? '#FEF3C7' : o.status === 'preparing' ? '#FFEDD5' : '#EFF6FF', borderWidth: 1, borderColor: o.status === 'pending' ? '#FDE68A' : o.status === 'preparing' ? '#FED7AA' : '#BFDBFE' }}>
                      <Feather name={o.status === 'pending' ? 'inbox' : o.status === 'preparing' ? 'clock' : 'check-circle'} size={16} color={o.status === 'pending' ? '#D97706' : o.status === 'preparing' ? '#EA580C' : '#2563EB'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>{o.customer}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>{rs(o.total)}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{o.items ? `${o.items} • ${o.time}` : o.time}</Text>
                      <View style={{ marginTop: 6, alignSelf: 'flex-start', backgroundColor: o.status === 'pending' ? '#FEF3C7' : o.status === 'preparing' ? '#FFEDD5' : o.status === 'ready' ? '#DBEAFE' : Colors.successBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: o.status === 'pending' ? '#FDE68A' : o.status === 'preparing' ? '#FED7AA' : o.status === 'ready' ? '#BFDBFE' : '#BBF7D0' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: o.status === 'pending' ? '#92400E' : o.status === 'preparing' ? '#9A3412' : o.status === 'ready' ? '#1E40AF' : Colors.success }}>{o.status.toUpperCase()}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </PremiumCard>
            )}
          </View>

          <View style={{ height: 8 }} />
        </View>
      </ScrollView>
    </View>
  );
}
