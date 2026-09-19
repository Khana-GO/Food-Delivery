import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAvailableOrders } from '@/hooks/driver/useAvailableOrders';
import { useAcceptDelivery } from '@/hooks/driver/useAcceptDelivery';
import { useDriverActiveOrder } from '@/hooks/driver/useDriverActiveOrder';
import { useDriverEarnings } from '@/hooks/driver/useDriverEarnings';
import { DeliveryCard } from '@/components/driver/DeliveryCard';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius, Shadow } from '@/constants/theme';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverNotifications } from '@/hooks/driver/useDriverNotifications';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { data: orders, isLoading: loadingAvailable, refetch: refetchAvailable } = useAvailableOrders();
  const { data: activeOrder, isLoading: loadingActive } = useDriverActiveOrder();
  const { data: earnings } = useDriverEarnings();
  const { mutate: acceptDelivery, isPending, variables } = useAcceptDelivery();
  useDriverNotifications();
  const { unreadCount } = useDriverNotificationStore();

  const onRefresh = useCallback(() => {
    refetchAvailable();
  }, [refetchAvailable]);

  const previewOrders = (orders || []).slice(0, 3);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0).toUpperCase() || ''}${lastName?.charAt(0).toUpperCase() || ''}` || 'D';
  };

  const hasProfileImage = !!user?.imageUrl;

  return (
    <AnimatedPage style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loadingAvailable && !orders} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={{ backgroundColor: Colors.primary, paddingTop: 48, paddingBottom: 26, paddingHorizontal: 18, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/(driver)/(tabs)/profile' as any)}
                style={{ position: 'relative' }}
                activeOpacity={0.8}
              >
                <View style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: Colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...Shadow.lg,
                }}>
                  {hasProfileImage ? (
                    <Image source={{ uri: user!.imageUrl! }} style={{ width: '100%', height: '100%', borderRadius: 23 }} />
                  ) : (
                    <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.primary }}>
                      {getInitials(user?.firstName, user?.lastName)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 }}>WELCOME BACK</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <Text style={{ color: Colors.white, fontSize: 19, fontWeight: '800' }}>{user?.firstName || 'Driver'}</Text>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                    <Text style={{ color: Colors.white, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>DRIVER</Text>
                  </View>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 3 }} numberOfLines={1}>{activeOrder ? `Delivering #${activeOrder.id.slice(0, 6)}` : 'Ready to deliver?'}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(driver)/(tabs)/notifications' as any)}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color={Colors.white} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: Colors.white,
                    borderWidth: 1.5,
                    borderColor: Colors.primary,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            {/* Today – keep semi-transparent */}
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.white }}>₹</Text>
              <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 6 }}>Rs. {earnings?.today ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', marginTop: 2 }}>Today</Text>
            </View>
            {/* Deliveries – keep semi-transparent */}
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Feather name="package" size={15} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 6 }}>{earnings?.deliveries ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', marginTop: 2 }}>Deliveries</Text>
            </View>
            {/* Available – white background, dark text */}
            <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', ...Shadow.sm }}>
              <Feather name="truck" size={15} color={Colors.primary} />
              <Text style={{ color: Colors.textDark, fontSize: 16, fontWeight: '800', marginTop: 6 }}>{orders?.length ?? 0}</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 10, fontWeight: '600', marginTop: 2 }}>Available</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={14} style={{ borderColor: activeOrder ? Colors.primaryLight : Colors.borderLight }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Active Delivery</Text>
              <View style={{ backgroundColor: activeOrder ? Colors.successBg : Colors.backgroundAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: activeOrder ? Colors.success : Colors.textSecondary }}>{activeOrder ? activeOrder.orderStatus : 'None'}</Text>
              </View>
            </View>
            {loadingActive ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 12 }} />
            ) : activeOrder ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>{activeOrder.restaurantName}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3 }} numberOfLines={1}>{activeOrder.deliveryAddress}</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(driver)/(tabs)/active' as any)}
                  style={{ marginTop: 12, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 9, alignItems: 'center', ...Shadow.primary }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 12 }}>View & Update Status →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm }}>
                  <Feather name="inbox" size={22} color={Colors.white} />
                </View>
                <Text style={{ color: Colors.textTertiary, fontSize: 13, marginTop: 8, fontWeight: '600' }}>No active delivery</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)}
                  style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.primary }}
                  activeOpacity={0.7}
                >
                  <Feather name="search" size={13} color={Colors.white} />
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 12 }}>Find Orders</Text>
                </TouchableOpacity>
              </View>
            )}
          </PremiumCard>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Available Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)} activeOpacity={0.7}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>View all</Text>
            </TouchableOpacity>
          </View>

          {loadingAvailable && !orders ? (
            <View style={{ padding: 16, alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
          ) : previewOrders.length === 0 ? (
            <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 22 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm }}>
                <Feather name="truck" size={22} color={Colors.white} />
              </View>
              <Text style={{ color: Colors.textTertiary, fontWeight: '600', marginTop: 8, fontSize: 13 }}>No orders right now</Text>
              <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 3 }}>Pull to refresh</Text>
            </PremiumCard>
          ) : (
            previewOrders.map((item) => (
              <DeliveryCard key={item.id} order={item as any} onAccept={() => acceptDelivery(item.id)} isAccepting={isPending && variables === item.id} />
            ))
          )}
        </View>
      </ScrollView>
    </AnimatedPage>
  );
}