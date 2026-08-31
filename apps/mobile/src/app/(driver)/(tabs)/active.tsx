import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="truck" size={32} color={Colors.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textDark, marginTop: 16 }}>No Active Delivery</Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' }}>Accept an order to start delivering</Text>
          <TouchableOpacity
            onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)}
            style={{ marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: Radius.full, ...Shadow.primary }}
            activeOpacity={0.8}
          >
            <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 15 }}>Find Orders</Text>
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
    <AnimatedPage style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: Colors.primary, paddingTop: 48, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: Radius['2xl'], borderBottomRightRadius: Radius['2xl'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>ACTIVE DELIVERY</Text>
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 4 }}>#{(order.id as string).slice(0, 8).toUpperCase()}</Text>
            </View>
            <OrderStatusBadge status={order.orderStatus} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -12, gap: 12 }}>
          <PremiumCard elevation="md" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="home" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Pickup • {order.restaurantName}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }} numberOfLines={2}>{order.restaurantAddress}</Text>
              </View>
            </View>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 }} activeOpacity={0.7}>
              <Feather name="map-pin" size={12} color={Colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Open in Maps</Text>
            </TouchableOpacity>
          </PremiumCard>

          <PremiumCard elevation="md" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="user" size={18} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Deliver to • {order.customerName}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>{order.deliveryAddress}</Text>
                <Text style={{ fontSize: 12, color: Colors.primary, marginTop: 4, fontWeight: '600' }}>{order.customerPhone}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.success, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }} activeOpacity={0.8}>
                <Feather name="phone" size={14} color={Colors.white} />
                <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 13 }}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.backgroundAlt, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} activeOpacity={0.8}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.textDark }}>Directions</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>

          <PremiumCard elevation="sm" padding={16}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 12 }}>Order • Rs. {order.totalAmount ?? (order as any).total ?? 0}</Text>
            {(order.items || []).slice(0, 4).map((it: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i === Math.min((order.items || []).length, 4) - 1 ? 0 : 1, borderBottomColor: Colors.borderLight }}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{it.quantity}x {it.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Rs. {it.totalPrice ?? it.price * it.quantity}</Text>
              </View>
            ))}
          </PremiumCard>

          <PremiumCard elevation="sm" padding={14} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: location ? Colors.success : Colors.warning }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>{location ? 'Live location sharing' : 'Starting location...'}</Text>
            </View>
            <Feather name="navigation" size={16} color={location ? Colors.success : Colors.textTertiary} />
          </PremiumCard>

          <View style={{ gap: 10, marginTop: 4 }}>
            {canPickUp && (
              <TouchableOpacity
                onPress={handlePickUp}
                disabled={isPending}
                style={{ backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center', opacity: isPending ? 0.6 : 1, ...Shadow.primary }}
                activeOpacity={0.8}
              >
                <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>{isPending ? 'Updating...' : 'Mark as Picked Up →'}</Text>
              </TouchableOpacity>
            )}
            {canDeliver && (
              <TouchableOpacity
                onPress={handleDelivered}
                disabled={isPending}
                style={{ backgroundColor: Colors.success, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center', opacity: isPending ? 0.6 : 1, ...Shadow.sm }}
                activeOpacity={0.8}
              >
                <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>{isPending ? 'Updating...' : 'Mark as Delivered ✓'}</Text>
              </TouchableOpacity>
            )}
            {!canPickUp && !canDeliver && order.orderStatus !== 'DELIVERED' && (
              <View style={{ backgroundColor: Colors.backgroundAlt, padding: 16, borderRadius: Radius.lg, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '600' }}>Waiting for restaurant to prepare… Status: {order.orderStatus}</Text>
              </View>
            )}
            {order.orderStatus === 'DELIVERED' && (
              <View style={{ backgroundColor: Colors.successBg, padding: 16, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.successLight }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.success }}>Delivered ✓ Great job!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </AnimatedPage>
  );
}