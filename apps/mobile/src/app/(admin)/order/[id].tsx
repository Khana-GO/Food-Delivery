// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAdminOrder } from '@/hooks/admin/order/useAdminOrder';
import { useAdminUpdateOrderStatus } from '@/hooks/admin/order/useAdminUpdateOrderStatus';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { AdminStatusUpdateModal } from '@/components/admin/order/AdminStatusUpdateModal';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function AdminOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id);
  const { mutate: updateStatus, isPending } = useAdminUpdateOrderStatus();

  const [showStatusModal, setShowStatusModal] = useState(false);

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: 52,
          paddingBottom: 24,
          paddingHorizontal: 20,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View>
              <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800' }}>Order #{order.id.slice(0, 8)}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowStatusModal(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full, ...Shadow.sm }}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={14} color={Colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Update</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <OrderStatusBadge status={order.orderStatus} />
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Rs. {order.totalAmount}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 12 }}>
          <PremiumCard elevation="sm" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary }}>Order Status</Text>
                <View style={{ marginTop: 6 }}>
                  <OrderStatusBadge status={order.orderStatus} />
                </View>
              </View>
              <Text style={{ fontSize: 11, color: Colors.textTertiary }}>{formatDate(order.createdAt)}</Text>
            </View>
          </PremiumCard>

          <PremiumCard elevation="sm" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                <Feather name="user" size={14} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Customer</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>{order.customerName}</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>{order.customerPhone}</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>{order.deliveryAddress}</Text>
          </PremiumCard>

          <PremiumCard elevation="sm" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' }}>
                <Feather name="home" size={14} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Restaurant</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>{order.restaurantName}</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>{order.restaurantAddress}</Text>
          </PremiumCard>

          <PremiumCard elevation="sm" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
                <Feather name="truck" size={14} color={Colors.success} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Driver</Text>
            </View>
            {order.driverId ? (
              <>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>{order.driverName || 'Driver Assigned'}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>ID: {order.driverId}</Text>
              </>
            ) : (
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Not assigned yet</Text>
            )}
          </PremiumCard>

          <PremiumCard elevation="sm" padding={16}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, marginBottom: 12 }}>Items • Rs. {order.totalAmount}</Text>
            {order.items.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{item.quantity}x {item.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Rs. {item.totalPrice}</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Total</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.primary }}>Rs. {order.totalAmount}</Text>
            </View>
          </PremiumCard>

          <PremiumCard elevation="sm" padding={16}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, marginBottom: 12 }}>Payment</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Method</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textDark }}>{order.paymentMethod === 'ONLINE' ? 'eSewa' : 'Cash on Delivery'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Status</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: order.paymentStatus === 'PAID' ? Colors.success : Colors.warning }}>{order.paymentStatus}</Text>
            </View>
            {order.paymentId && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Payment ID</Text>
                <Text style={{ fontSize: 12, color: Colors.textDark }}>{order.paymentId}</Text>
              </View>
            )}
          </PremiumCard>
        </View>
      </ScrollView>

      <AdminStatusUpdateModal
        visible={showStatusModal}
        currentStatus={order.orderStatus}
        onClose={() => setShowStatusModal(false)}
        onUpdate={(status) => {
          updateStatus({ id, status });
          setShowStatusModal(false);
        }}
        isPending={isPending}
      />
    </View>
  );
}
