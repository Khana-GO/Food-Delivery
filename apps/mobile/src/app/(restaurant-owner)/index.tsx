import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
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

// ─── Responsive scaling ──────────────────────────────────────────────
const scale = (size: number, width: number) => (width / 375) * size;

// ─── Helpers ──────────────────────────────────────────────────────────
const rs = (n: number) => `₹ ${Math.round(n).toLocaleString('en-IN')}`;

type KitStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'confirmed';
const toKitStatus = (api: string): KitStatus => api.toLowerCase() as any;

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Data hooks ────────────────────────────────────────────────────
  const {
    data: restaurants,
    isLoading: restoLoading,
    refetch: refetchResto,
    isRefetching: restoRefetching,
  } = useMyRestaurants();

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isRefetching: ordersRefetching,
  } = useRestaurantOrders();

  const ordersRaw: any[] = (ordersData as any)?.data ?? (ordersData as any) ?? [];

  // ─── Statistics ────────────────────────────────────────────────────
  const statsComputed = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayOrders = ordersRaw.filter((o: any) => new Date(o.createdAt) >= now);
    const pending = ordersRaw.filter(
      (o: any) => (o.orderStatus || o.status) === 'PENDING' || (o.orderStatus || o.status) === 'pending'
    ).length;
    const revenueToday = todayOrders
      .filter((o: any) => (o.orderStatus || o.status) !== 'CANCELLED')
      .reduce((s: number, o: any) => s + (o.totalAmount ?? o.total ?? 0), 0);
    return {
      todayCount: todayOrders.length,
      pending,
      revenueToday,
      totalOrders: ordersRaw.length,
    };
  }, [ordersRaw]);

  // ─── Live orders ──────────────────────────────────────────────────
  const liveOrders = useMemo(() => {
    const live = ordersRaw
      .filter((o: any) =>
        ['PENDING', 'PREPARING', 'READY', 'CONFIRMED'].includes(
          (o.orderStatus || o.status || '').toUpperCase()
        )
      )
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((o: any) => {
        const status = toKitStatus(o.orderStatus || o.status || 'pending');
        const items = Array.isArray(o.items)
          ? o.items.map((i: any) => `${i.quantity}x ${i.name || i.itemNameSnapshot}`).join(' · ')
          : '';
        const createdTime = o.createdAt ? new Date(o.createdAt).getTime() : currentTime;
        const diffMin = Math.max(0, Math.floor((currentTime - createdTime) / 60000));
        const time =
          diffMin < 1 ? 'just now' : diffMin < 60 ? `${diffMin} min ago` : `${Math.floor(diffMin / 60)} hr ago`;
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

  // ─── Refresh ──────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    refetchResto();
    refetchOrders();
  }, [refetchResto, refetchOrders]);

  const refreshing = restoRefetching || ordersRefetching;

  // ─── Quick actions ────────────────────────────────────────────────
  const quickActions = [
    { label: 'Orders', sub: `${statsComputed.pending} pending`, icon: 'shopping-bag' as const, route: '/(restaurant-owner)/orders' },
    { label: 'Add Item', sub: 'Grow menu', icon: 'plus-circle' as const, route: '/(restaurant-owner)/menu/create' },
    { label: 'Menu', sub: 'View dishes', icon: 'book-open' as const, route: '/(restaurant-owner)/menu' },
    { label: 'Earnings', sub: rs(statsComputed.revenueToday), icon: 'dollar-sign' as const, route: '/(restaurant-owner)/earnings' },
  ];

  const initials = `${user?.firstName?.charAt(0).toUpperCase() || 'O'}${user?.lastName?.charAt(0).toUpperCase() || ''}`;

  // ─── Responsive values ────────────────────────────────────────────
  const s = (size: number) => scale(size, width);
  const fontSize = {
    tiny: s(10),
    small: s(11),
    base: s(13),
    medium: s(14),
    large: s(16),
    xl: s(18),
    xxl: s(22),
  };

  const spacing = {
    xs: s(4),
    sm: s(8),
    md: s(12),
    lg: s(16),
    xl: s(20),
    xxl: s(24),
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ─── Header ───────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: spacing.xl,
            paddingHorizontal: spacing.lg,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
              <View
                style={{
                  width: s(48),
                  height: s(48),
                  borderRadius: s(24),
                  backgroundColor: Colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...Shadow.lg,
                }}
              >
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={{ width: '100%', height: '100%', borderRadius: s(24) }}
                  />
                ) : (
                  <Text style={{ fontSize: fontSize.medium, fontWeight: '800', color: Colors.primary }}>
                    {initials}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: fontSize.tiny,
                    fontWeight: '700',
                    letterSpacing: 0.7,
                  }}
                  numberOfLines={1}
                >
                  {(new Date().getHours() < 12
                    ? 'GOOD MORNING'
                    : new Date().getHours() < 17
                    ? 'GOOD AFTERNOON'
                    : 'GOOD EVENING')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    marginTop: spacing.xs,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.white,
                      fontSize: fontSize.large,
                      fontWeight: '800',
                      flexShrink: 1,
                    }}
                    numberOfLines={1}
                  >
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Owner'}
                  </Text>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: Radius.full,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.white,
                        fontSize: fontSize.tiny,
                        fontWeight: '700',
                        letterSpacing: 0.4,
                      }}
                    >
                      OWNER
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: fontSize.small,
                    marginTop: spacing.xs,
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                >
                  {restaurants?.length ?? 0} restaurants • {statsComputed.totalOrders} orders
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(restaurant-owner)/notifications' as any)}
              style={{
                width: s(40),
                height: s(40),
                borderRadius: s(20),
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={s(18)} color={Colors.white} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: s(4),
                    right: s(4),
                    width: s(10),
                    height: s(10),
                    borderRadius: s(5),
                    backgroundColor: Colors.white,
                    borderWidth: 1.5,
                    borderColor: Colors.primary,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* ─── Stats row ─────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              marginTop: spacing.xl,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: Radius.xl,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Feather name="shopping-bag" size={s(16)} color={Colors.white} />
              <Text
                style={{
                  color: Colors.white,
                  fontSize: fontSize.xl,
                  fontWeight: '800',
                  marginTop: spacing.sm,
                }}
              >
                {statsComputed.todayCount}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: fontSize.small,
                  fontWeight: '600',
                  marginTop: spacing.xs,
                }}
              >
                Today's Orders
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: Radius.xl,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Feather name="clock" size={s(16)} color={Colors.white} />
              <Text
                style={{
                  color: Colors.white,
                  fontSize: fontSize.xl,
                  fontWeight: '800',
                  marginTop: spacing.sm,
                }}
              >
                {statsComputed.pending}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: fontSize.small,
                  fontWeight: '600',
                  marginTop: spacing.xs,
                }}
              >
                Pending
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: Radius.xl,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.6)',
                ...Shadow.sm,
              }}
            >
              <Text style={{ fontSize: s(16), fontWeight: '800', color: Colors.primary }}>₹</Text>
              <Text
                style={{
                  color: Colors.textDark,
                  fontSize: fontSize.medium,
                  fontWeight: '800',
                  marginTop: spacing.sm,
                }}
                numberOfLines={1}
              >
                {rs(statsComputed.revenueToday)}
              </Text>
              <Text
                style={{
                  color: Colors.textSecondary,
                  fontSize: fontSize.small,
                  fontWeight: '600',
                  marginTop: spacing.xs,
                }}
              >
                Revenue Today
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Content ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: -s(12), gap: spacing.lg }}>
          {/* ─── Restaurant summary card ───────────────────────────── */}
          <PremiumCard elevation="md" padding={spacing.lg} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: s(44),
                height: s(44),
                borderRadius: s(22),
                backgroundColor: Colors.primaryBg,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#FECDD3',
              }}
            >
              <Feather name="package" size={s(20)} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.medium, fontWeight: '800', color: Colors.textDark }}>
                {restaurants?.length ?? 0} Stores
              </Text>
              <Text style={{ fontSize: fontSize.small, color: Colors.textSecondary, marginTop: spacing.xs }}>
                {restaurants?.filter((r) => r.isOpen).length ?? 0} open •{' '}
                {restaurants?.filter((r) => r.isVerified).length ?? 0} verified
              </Text>
            </View>
            {restoLoading ? <ActivityIndicator color={Colors.primary} /> : <Feather name="chevron-right" size={s(18)} color={Colors.textTertiary} />}
          </PremiumCard>

          {/* ─── Quick Actions ──────────────────────────────────────── */}
          <View>
            <Text style={{ fontSize: fontSize.medium, fontWeight: '800', color: Colors.textDark, marginBottom: spacing.sm }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {quickActions.map((a) => (
                <PremiumCard
                  key={a.label}
                  elevation="sm"
                  padding={0}
                  pressable
                  onPress={() => router.push(a.route as never)}
                  style={{
                    flex: 1,
                    minWidth: width < 400 ? '46%' : '30%',
                    padding: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: s(38),
                      height: s(38),
                      borderRadius: s(19),
                      backgroundColor: Colors.primaryBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#FECDD3',
                    }}
                  >
                    <Feather name={a.icon} size={s(16)} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '800', color: Colors.textDark }}>
                      {a.label}
                    </Text>
                    <Text style={{ fontSize: fontSize.small, color: Colors.textSecondary, marginTop: spacing.xs }}>
                      {a.sub}
                    </Text>
                  </View>
                </PremiumCard>
              ))}
            </View>
          </View>

          {/* ─── My Restaurants ─────────────────────────────────────── */}
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ fontSize: fontSize.medium, fontWeight: '800', color: Colors.textDark }}>
                My Restaurants
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(restaurant-owner)/restaurant' as any)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: fontSize.small, fontWeight: '700', color: Colors.primary }}>
                  Manage all
                </Text>
              </TouchableOpacity>
            </View>

            {restoLoading ? (
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : restaurants && restaurants.length > 0 ? (
              <View style={{ gap: spacing.md }}>
                {restaurants.slice(0, 2).map((r) => (
                  <PremiumCard
                    key={r.id}
                    elevation="sm"
                    padding={0}
                    pressable
                    onPress={() => router.push(`/(restaurant-owner)/restaurant/${r.id}` as any)}
                    style={{ overflow: 'hidden' }}
                  >
                    <View style={{ height: s(72), backgroundColor: Colors.backgroundAlt }}>
                      {r.coverImageUrl ? (
                        <Image
                          source={{ uri: r.coverImageUrl }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="image" size={s(22)} color={Colors.textMuted} />
                        </View>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: spacing.md,
                        marginTop: -s(16),
                      }}
                    >
                      <View
                        style={{
                          width: s(48),
                          height: s(48),
                          borderRadius: s(14),
                          backgroundColor: Colors.white,
                          borderWidth: 2,
                          borderColor: Colors.white,
                          ...Shadow.sm,
                          overflow: 'hidden',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {r.logoUrl ? (
                          <Image
                            source={{ uri: r.logoUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                          />
                        ) : (
                          <Text
                            style={{
                              fontSize: fontSize.large,
                              fontWeight: '800',
                              color: Colors.primary,
                            }}
                          >
                            {r.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text
                          style={{ fontSize: fontSize.medium, fontWeight: '800', color: Colors.textDark }}
                          numberOfLines={1}
                        >
                          {r.name}
                        </Text>
                        <Text
                          style={{ fontSize: fontSize.small, color: Colors.textSecondary, marginTop: spacing.xs }}
                          numberOfLines={1}
                        >
                          {r.cuisineType} • {r.address}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.sm,
                            marginTop: spacing.xs,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <View
                              style={{
                                width: s(7),
                                height: s(7),
                                borderRadius: s(3.5),
                                backgroundColor: r.isOpen ? Colors.success : Colors.error,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: fontSize.tiny,
                                fontWeight: '700',
                                color: r.isOpen ? Colors.success : Colors.error,
                              }}
                            >
                              {r.isOpen ? 'Open' : 'Closed'}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Feather name="star" size={s(11)} color={Colors.ratingGold} />
                            <Text
                              style={{
                                fontSize: fontSize.small,
                                fontWeight: '600',
                                color: Colors.textSecondary,
                              }}
                            >
                              {r.averageRating ? Number(r.averageRating).toFixed(1) : 'New'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Feather name="chevron-right" size={s(16)} color={Colors.textTertiary} />
                    </View>
                  </PremiumCard>
                ))}
              </View>
            ) : (
              <PremiumCard
                elevation="sm"
                style={{ alignItems: 'center', paddingVertical: spacing.xl }}
              >
                <View
                  style={{
                    width: s(64),
                    height: s(64),
                    borderRadius: s(32),
                    backgroundColor: Colors.primaryBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#FECDD3',
                  }}
                >
                  <Feather name="plus" size={s(28)} color={Colors.primary} />
                </View>
                <Text
                  style={{
                    marginTop: spacing.md,
                    fontSize: fontSize.medium,
                    fontWeight: '700',
                    color: Colors.textDark,
                  }}
                >
                  Add your first restaurant
                </Text>
                <Text
                  style={{
                    marginTop: spacing.xs,
                    fontSize: fontSize.small,
                    color: Colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  Set up your kitchen and start receiving orders.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(restaurant-owner)/restaurant/create' as any)}
                  style={{
                    marginTop: spacing.md,
                    backgroundColor: Colors.primary,
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.md,
                    borderRadius: Radius.full,
                    ...Shadow.sm,
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: fontSize.small,
                      fontWeight: '800',
                      color: Colors.white,
                    }}
                  >
                    Create Restaurant
                  </Text>
                </TouchableOpacity>
              </PremiumCard>
            )}
          </View>

          {/* ─── Live Orders ────────────────────────────────────────── */}
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ fontSize: fontSize.medium, fontWeight: '800', color: Colors.textDark }}>
                Live Orders
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(restaurant-owner)/orders' as any)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: fontSize.small, fontWeight: '700', color: Colors.primary }}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {ordersLoading && !ordersRaw.length ? (
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : liveOrders.length === 0 ? (
              <PremiumCard
                elevation="sm"
                style={{ alignItems: 'center', paddingVertical: spacing.xl }}
              >
                <View
                  style={{
                    width: s(56),
                    height: s(56),
                    borderRadius: s(28),
                    backgroundColor: Colors.primaryBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#FECDD3',
                  }}
                >
                  <Feather name="inbox" size={s(22)} color={Colors.primary} />
                </View>
                <Text
                  style={{
                    marginTop: spacing.sm,
                    fontSize: fontSize.base,
                    fontWeight: '700',
                    color: Colors.textTertiary,
                  }}
                >
                  No live orders
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.small,
                    color: Colors.textMuted,
                    marginTop: spacing.xs,
                  }}
                >
                  New orders will appear here in real time
                </Text>
              </PremiumCard>
            ) : (
              <PremiumCard elevation="sm" padding={0} style={{ overflow: 'hidden' }}>
                {liveOrders.map((o, idx) => (
                  <TouchableOpacity
                    key={o.id}
                    onPress={() => router.push(`/(restaurant-owner)/orders/${o.id}` as any)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.md,
                      borderBottomWidth: idx !== liveOrders.length - 1 ? 1 : 0,
                      borderBottomColor: Colors.borderLight,
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: s(40),
                        height: s(40),
                        borderRadius: s(12),
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          o.status === 'pending'
                            ? '#FEF3C7'
                            : o.status === 'preparing'
                            ? '#FFEDD5'
                            : '#EFF6FF',
                        borderWidth: 1,
                        borderColor:
                          o.status === 'pending'
                            ? '#FDE68A'
                            : o.status === 'preparing'
                            ? '#FED7AA'
                            : '#BFDBFE',
                      }}
                    >
                      <Feather
                        name={
                          o.status === 'pending'
                            ? 'inbox'
                            : o.status === 'preparing'
                            ? 'clock'
                            : 'check-circle'
                        }
                        size={s(16)}
                        color={
                          o.status === 'pending'
                            ? '#D97706'
                            : o.status === 'preparing'
                            ? '#EA580C'
                            : '#2563EB'
                        }
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            fontSize: fontSize.base,
                            fontWeight: '700',
                            color: Colors.textDark,
                          }}
                          numberOfLines={1}
                        >
                          {o.customer}
                        </Text>
                        <Text
                          style={{
                            fontSize: fontSize.base,
                            fontWeight: '800',
                            color: Colors.textDark,
                          }}
                        >
                          {rs(o.total)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: fontSize.small,
                          color: Colors.textSecondary,
                          marginTop: spacing.xs,
                        }}
                        numberOfLines={1}
                      >
                        {o.items ? `${o.items} • ${o.time}` : o.time}
                      </Text>
                      <View
                        style={{
                          marginTop: spacing.xs,
                          alignSelf: 'flex-start',
                          backgroundColor:
                            o.status === 'pending'
                              ? '#FEF3C7'
                              : o.status === 'preparing'
                              ? '#FFEDD5'
                              : o.status === 'ready'
                              ? '#DBEAFE'
                              : Colors.successBg,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                          borderRadius: Radius.full,
                          borderWidth: 1,
                          borderColor:
                            o.status === 'pending'
                              ? '#FDE68A'
                              : o.status === 'preparing'
                              ? '#FED7AA'
                              : o.status === 'ready'
                              ? '#BFDBFE'
                              : '#BBF7D0',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: fontSize.tiny,
                            fontWeight: '700',
                            color:
                              o.status === 'pending'
                                ? '#92400E'
                                : o.status === 'preparing'
                                ? '#9A3412'
                                : o.status === 'ready'
                                ? '#1E40AF'
                                : Colors.success,
                          }}
                        >
                          {o.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </PremiumCard>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}