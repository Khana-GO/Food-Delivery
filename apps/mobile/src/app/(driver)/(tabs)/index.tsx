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

export default function DriverDashboard() {
  const { user } = useAuth();
  const { data: orders, isLoading: loadingAvailable, refetch: refetchAvailable } = useAvailableOrders();
  const { data: activeOrder, isLoading: loadingActive } = useDriverActiveOrder();
  const { data: earnings } = useDriverEarnings();
  const { mutate: acceptDelivery, isPending } = useAcceptDelivery();

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
        <View style={{ backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ position: 'relative' }}>
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: Colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...Shadow.lg,
                }}>
                  {hasProfileImage ? (
                    <Image source={{ uri: user!.imageUrl! }} style={{ width: '100%', height: '100%', borderRadius: 26 }} />
                  ) : (
                    <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.primary }}>
                      {getInitials(user?.firstName, user?.lastName)}
                    </Text>
                  )}
                </View>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>WELCOME BACK</Text>
                <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{user?.firstName || 'Driver'}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>{activeOrder ? `Delivering #${activeOrder.id.slice(0, 6)}` : 'Ready to deliver?'}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(driver)/(tabs)/notifications' as any)}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Feather name="dollar-sign" size={18} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 8 }}>Rs. {earnings?.today ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Today</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Feather name="package" size={18} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 8 }}>{earnings?.deliveries ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Deliveries</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16, ...Shadow.sm }}>
              <Feather name="truck" size={18} color={Colors.secondary} />
              <Text style={{ color: Colors.textDark, fontSize: 20, fontWeight: '800', marginTop: 8 }}>{orders?.length ?? 0}</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 }}>Available</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={16} style={{ borderColor: activeOrder ? Colors.primaryLight : Colors.borderLight }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark }}>Active Delivery</Text>
              <View style={{ backgroundColor: activeOrder ? Colors.successBg : Colors.backgroundAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: activeOrder ? Colors.success : Colors.textSecondary }}>{activeOrder ? activeOrder.orderStatus : 'None'}</Text>
              </View>
            </View>
            {loadingActive ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
            ) : activeOrder ? (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>{activeOrder.restaurantName}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }} numberOfLines={1}>{activeOrder.deliveryAddress}</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(driver)/(tabs)/active' as any)}
                  style={{ marginTop: 14, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center', ...Shadow.primary }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 13 }}>View & Update Status →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="inbox" size={28} color={Colors.primary} />
                </View>
                <Text style={{ color: Colors.textTertiary, fontSize: 14, marginTop: 10, fontWeight: '600' }}>No active delivery</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)}
                  style={{ marginTop: 10, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primaryLight }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 13 }}>Find Orders</Text>
                </TouchableOpacity>
              </View>
            )}
          </PremiumCard>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark }}>Available Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)} activeOpacity={0.7}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>View all</Text>
            </TouchableOpacity>
          </View>

          {loadingAvailable && !orders ? (
            <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
          ) : previewOrders.length === 0 ? (
            <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 28 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="truck" size={28} color={Colors.primary} />
              </View>
              <Text style={{ color: Colors.textTertiary, fontWeight: '600', marginTop: 10 }}>No orders right now</Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 4 }}>Pull to refresh</Text>
            </PremiumCard>
          ) : (
            previewOrders.map((item) => (
              <DeliveryCard key={item.id} order={item as any} onAccept={() => acceptDelivery(item.id)} isAccepting={isPending} />
            ))
          )}
        </View>
      </ScrollView>
    </AnimatedPage>
  );
}