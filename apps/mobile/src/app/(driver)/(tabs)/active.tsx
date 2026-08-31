import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDriverActiveOrder } from '@/hooks/driver/useDriverActiveOrder';
import { useDriverLocation } from '@/hooks/driver/useDriverLocation';
import { useUpdateDeliveryStatus } from '@/hooks/driver/useUpdateDeliveryStatus';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius, Shadow } from '@/constants/theme';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';

export default function ActiveDeliveryScreen() {
  const { data: order, isLoading, refetch } = useDriverActiveOrder();
  const { location } = useDriverLocation(order?.id || '', !!order);
  const { mutate: updateStatus, isPending } = useUpdateDeliveryStatus();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <AnimatedPage style={{ flex: 1, backgroundColor: Colors.background }}>
        <View className="items-center justify-center flex-1 px-6">
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="truck" size={32} color={Colors.primary} />
          </View>
          <Text className="mt-4 text-lg font-bold text-gray-900">No Active Delivery</Text>
          <Text className="mt-1 text-sm text-gray-500 text-center">Accept an order to start delivering</Text>
          <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)} style={{ marginTop: 18, backgroundColor: Colors.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: Radius.lg, ...Shadow.primary }}>
            <Text className="font-bold text-white">Find Orders</Text>
          </TouchableOpacity>
        </View>
      </AnimatedPage>
    );
  }

  const canPickUp = order.orderStatus === 'READY';
  const canDeliver = order.orderStatus === 'PICKED_UP';

  const handlePickUp = () => {
    Alert.alert('Picked Up?', 'Confirm you have picked up the order from restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus({ orderId: order.id, status: 'PICKED_UP' }) },
    ]);
  };
  const handleDelivered = () => {
    Alert.alert('Delivered?', 'Confirm delivery to customer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus({ orderId: order.id, status: 'DELIVERED' }) },
    ]);
  };

  return (
    <AnimatedPage slide style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: Colors.primary, paddingTop: 48, paddingBottom: 18, paddingHorizontal: 16, borderBottomLeftRadius: Radius['2xl'], borderBottomRightRadius: Radius['2xl'] }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 }}>ACTIVE DELIVERY</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 2 }}>#{(order.id as string).slice(0, 8).toUpperCase()}</Text>
            </View>
            <OrderStatusBadge status={order.orderStatus} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -12, gap: 12 }}>
          <PremiumCard elevation="md" padding={14}>
            <View className="flex-row items-center gap-2">
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="home" size={16} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Pickup • {order.restaurantName}</Text>
            </View>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 8 }} numberOfLines={2}>{order.restaurantAddress}</Text>
            <TouchableOpacity style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="map-pin" size={12} color={Colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Open in Maps</Text>
            </TouchableOpacity>
          </PremiumCard>

          <PremiumCard elevation="md" padding={14}>
            <View className="flex-row items-center gap-2">
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="user" size={16} color={Colors.success} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Deliver to • {order.customerName}</Text>
            </View>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 8 }}>{order.deliveryAddress}</Text>
            <Text style={{ fontSize: 12, color: Colors.primary, marginTop: 4, fontWeight: '600' }}>{order.customerPhone}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.success, paddingVertical: 10, borderRadius: Radius.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                <Feather name="phone" size={14} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.backgroundAlt, paddingVertical: 10, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.textDark }}>Directions</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>

          <PremiumCard elevation="sm" padding={14}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, marginBottom: 10 }}>Order • Rs. {order.totalAmount ?? (order as any).total ?? 0}</Text>
            {(order.items || []).slice(0, 4).map((it: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: i === Math.min((order.items || []).length, 4) - 1 ? 0 : 1, borderBottomColor: Colors.borderLight }}>
                <Text style={{ fontSize: 12, color: Colors.textMedium }}>{it.quantity}x {it.name}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark }}>Rs. {it.totalPrice ?? it.price * it.quantity}</Text>
              </View>
            ))}
          </PremiumCard>

          <PremiumCard elevation="sm" padding={12} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: location ? Colors.success : Colors.warning }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark }}>{location ? 'Live location sharing' : 'Starting location...'}</Text>
            </View>
            <Feather name="navigation" size={16} color={location ? Colors.success : Colors.textTertiary} />
          </PremiumCard>

          {/* Status actions – the core driver flow */}
          <View style={{ gap: 10, marginTop: 4 }}>
            {canPickUp && (
              <TouchableOpacity onPress={handlePickUp} disabled={isPending} style={{ backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.xl, alignItems: 'center', opacity: isPending ? 0.6 : 1, ...Shadow.primary }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>{isPending ? 'Updating...' : 'Mark as Picked Up →'}</Text>
              </TouchableOpacity>
            )}
            {canDeliver && (
              <TouchableOpacity onPress={handleDelivered} disabled={isPending} style={{ backgroundColor: Colors.success, paddingVertical: 14, borderRadius: Radius.xl, alignItems: 'center', opacity: isPending ? 0.6 : 1, ...Shadow.sm }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>{isPending ? 'Updating...' : 'Mark as Delivered ✓'}</Text>
              </TouchableOpacity>
            )}
            {!canPickUp && !canDeliver && order.orderStatus !== 'DELIVERED' && (
              <View style={{ backgroundColor: Colors.backgroundAlt, padding: 12, borderRadius: Radius.lg, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '600' }}>Waiting for restaurant to prepare… Status: {order.orderStatus}</Text>
              </View>
            )}
            {order.orderStatus === 'DELIVERED' && (
              <View style={{ backgroundColor: Colors.successBg, padding: 12, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.successLight }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.success }}>Delivered ✓ Great job!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </AnimatedPage>
  );
}
