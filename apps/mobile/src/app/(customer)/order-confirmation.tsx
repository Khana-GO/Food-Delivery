import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useOrder } from '@/hooks/customer/useOrder';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useCheckoutStore } from '@/stores/customer/checkoutStore';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { reset } = useCheckoutStore();

  useEffect(() => {
    return () => reset();
  }, []);

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 13, color: Colors.textSecondary }}>Loading order details...</Text>
      </View>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Premium crimson success header - compact */}
      <View style={{ backgroundColor: Colors.primary, paddingTop: 48, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'], alignItems: 'center' }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', ...Shadow.sm }}>
          <Feather name="check" size={28} color={Colors.primary} />
        </View>
        <Text style={{ marginTop: 10, fontSize: 18, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 }}>Order Placed!</Text>
        <Text style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Your order has been confirmed</Text>
        <View style={{ marginTop: 10, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
          <Text style={{ fontSize: 11, color: Colors.white, fontWeight: '700' }}>ID {order.id.slice(0, 12).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}>
        {/* Order ID + Status */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.label}>Order ID</Text>
              <Text style={styles.value}>{order.id.slice(0, 12).toUpperCase()}</Text>
            </View>
            <OrderStatusBadge status={order.orderStatus} />
          </View>
          <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 6 }}>{formatDate(order.createdAt)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Restaurant</Text>
          <Text style={styles.cardValue}>{order.restaurantName}</Text>
          <Text style={styles.cardSub}>{order.restaurantAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <Text style={styles.cardSub}>{order.deliveryAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, flex: 1 }}>{item.quantity}x {item.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Rs. {item.totalPrice}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Total</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.primary }}>Rs. {order.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={styles.rowLabel}>Method</Text>
            <Text style={styles.rowValue}>{order.paymentMethod === 'ONLINE' ? 'eSewa' : 'Cash on Delivery'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={styles.rowLabel}>Status</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: order.paymentStatus === 'PAID' ? Colors.success : Colors.warning }}>{order.paymentStatus}</Text>
          </View>
        </View>

        {order.estimatedDeliveryTime && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: Radius.xl }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' }}>
              <Feather name="clock" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Estimated Delivery</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Actions — smaller, centered, responsive */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E2E8F0' }}>
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/order-tracking/${order.id}` as any)}
          activeOpacity={0.85}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Radius.full, ...Shadow.sm }}
        >
          <Feather name="map-pin" size={14} color="#FFFFFF" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' }}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/(tabs)' as any)}
          activeOpacity={0.85}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.white, paddingVertical: 12, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight }}
        >
          <Feather name="shopping-bag" size={14} color={Colors.textDark} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark, textAlign: 'center' }}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', ...Shadow.xs },
  label: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  value: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginTop: 2 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 6 },
  cardValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  rowLabel: { fontSize: 12, color: Colors.textSecondary },
  rowValue: { fontSize: 12, fontWeight: '600', color: Colors.textDark },
});
