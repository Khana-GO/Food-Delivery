import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAvailableOrders } from '@/hooks/driver/useAvailableOrders';
import { useAcceptDelivery } from '@/hooks/driver/useAcceptDelivery';
import { useDriverActiveOrder } from '@/hooks/driver/useDriverActiveOrder';
import { useDriverEarnings } from '@/hooks/driver/useDriverEarnings';
import { DeliveryCard } from '@/components/driver/DeliveryCard';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Shadow, Radius } from '@/constants/theme';
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

  return (
    <AnimatedPage slide duration={180} style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingAvailable && !orders} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header – premium gradient */}
        <View style={{ backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: Radius['2xl'], borderBottomRightRadius: Radius['2xl'], ...Shadow.primary }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', letterSpacing: 0.6 }}>WELCOME BACK</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 }}>{user?.firstName || 'Driver'} 👋</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 }}>{activeOrder ? `Delivering #${activeOrder.id.slice(0, 6)}` : 'Ready to deliver?'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/notifications' as any)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Feather name="bell" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Stats row – glass */}
          <View className="flex-row gap-3 mt-6">
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}>
              <Feather name="dollar-sign" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 8 }}>Rs. {earnings?.today ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' }}>Today</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}>
              <Feather name="package" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 8 }}>{earnings?.deliveries ?? 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' }}>Deliveries</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: Radius.xl, padding: 14, ...Shadow.sm }}>
              <Feather name="truck" size={18} color={Colors.primary} />
              <Text style={{ color: Colors.textDark, fontSize: 18, fontWeight: '800', marginTop: 8 }}>{orders?.length ?? 0}</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 11, fontWeight: '600' }}>Available</Text>
            </View>
          </View>
        </View>

        {/* Active delivery – premium card */}
        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={16} style={{ borderColor: activeOrder ? Colors.primaryLight : Colors.borderLight }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Active Delivery</Text>
              <View style={{ backgroundColor: activeOrder ? Colors.successBg : Colors.backgroundAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: activeOrder ? Colors.success : Colors.textSecondary }}>{activeOrder ? activeOrder.orderStatus : 'None'}</Text>
              </View>
            </View>
            {loadingActive ? <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} /> : activeOrder ? (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>{activeOrder.restaurantName}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{activeOrder.deliveryAddress}</Text>
                <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/active' as any)} style={{ marginTop: 14, backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 12, alignItems: 'center', ...Shadow.primary }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>View & Update Status →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                <Feather name="inbox" size={32} color="#D1D5DB" />
                <Text style={{ color: Colors.textTertiary, fontSize: 13, marginTop: 8, fontWeight: '600' }}>No active delivery</Text>
                <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)} style={{ marginTop: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryLight }}>
                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 12 }}>Find Orders</Text>
                </TouchableOpacity>
              </View>
            )}
          </PremiumCard>
        </View>

        {/* Available preview */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark }}>Available Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>View all →</Text>
            </TouchableOpacity>
          </View>

          {loadingAvailable && !orders ? (
            <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
          ) : previewOrders.length === 0 ? (
            <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 22 }}>
              <Feather name="truck" size={36} color="#D1D5DB" />
              <Text style={{ color: Colors.textTertiary, fontWeight: '600', marginTop: 8 }}>No orders right now</Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>Pull to refresh</Text>
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
