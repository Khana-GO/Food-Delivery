import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from '../../../../lib/axios';
import { getApiErrorMessage } from '@/lib/api-error';
import { OrderTrackingMap } from '@/components/map/OrderTrackingMap';
import { useOrderTracking } from '@/hooks/tracking/useOrderTracking';
import { useAuth } from '@/contexts/AuthContext';

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: tracking, connectWebSocket } = useOrderTracking({
    orderId,
    autoFetch: !!orderId,
    pollingInterval: 15000,
  });

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (e: any) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (user?.id && orderId) connectWebSocket(user.id);
  }, [user?.id, orderId, connectWebSocket]);

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/orders/${orderId}/cancel`);
            Alert.alert('Cancelled', 'Order cancelled');
            fetchOrder();
          } catch (e: any) {
            Alert.alert('Error', getApiErrorMessage(e));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
        <Text className="mt-3 text-gray-500">Loading order…</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text className="mt-3 text-center text-gray-600">{error || 'Order not found'}</Text>
        <TouchableOpacity onPress={fetchOrder} className="px-6 py-3 mt-6 bg-black rounded-xl">
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-3">
          <Text className="text-gray-500">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canTrack = order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED';
  const canCancel = order.orderStatus === 'PENDING';

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Feather name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-black">Order #{orderId.slice(0, 8)}</Text>
          <Text className="text-xs text-gray-500">{order.restaurantName} • {order.orderStatus}</Text>
        </View>
        <TouchableOpacity onPress={fetchOrder} className="p-2">
          <Feather name="refresh-cw" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Quick Track Card */}
        {canTrack && (
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/order-tracking/${orderId}` as any)}
            className="mx-4 mt-4 flex-row items-center justify-between p-4 bg-black rounded-2xl"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 items-center justify-center bg-white/15 rounded-full">
                <Feather name="map-pin" size={18} color="#FFF" />
              </View>
              <View>
                <Text className="text-sm font-bold text-white">Track Live</Text>
                <Text className="text-xs text-white/70">
                  {tracking?.driver ? `Driver ${tracking.driver.isOnline ? 'online' : 'offline'} • ${(tracking.route?.distance ?? 0) / 1000 > 0 ? `${((tracking.route?.distance ?? 0) / 1000).toFixed(1)} km` : 'calculating…'}` : 'Waiting for driver…'}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* Mini Map Preview */}
        {canTrack && tracking && (
          <View className="mx-4 mt-4 h-[220px] rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <OrderTrackingMap data={tracking} isLoading={false} />
          </View>
        )}

        {/* Status + ETA */}
        <View className="mx-4 mt-4 p-4 bg-white rounded-2xl border border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-black">Status</Text>
            <View className="px-3 py-1 rounded-full bg-gray-900">
              <Text className="text-xs font-bold text-white">{order.orderStatus}</Text>
            </View>
          </View>
          {order.estimatedDeliveryTime && (
            <Text className="mt-2 text-xs text-gray-500">
              Estimated delivery: {new Date(order.estimatedDeliveryTime).toLocaleString()}
              {order.estimatedDeliveryMinutes ? ` • ~${order.estimatedDeliveryMinutes} min` : ''}
            </Text>
          )}
          {tracking?.estimatedDuration && (
            <Text className="mt-1 text-xs text-gray-500">
              Live ETA: ~{Math.round((tracking.estimatedDuration || 0) / 60)} min • {tracking.estimatedDistance ? `${(tracking.estimatedDistance / 1000).toFixed(1)} km left` : ''}
            </Text>
          )}
        </View>

        {/* Delivery address */}
        <View className="mx-4 mt-4 p-4 bg-white rounded-2xl border border-gray-100">
          <Text className="text-sm font-semibold text-black">Delivery Address</Text>
          <Text className="mt-1 text-sm text-gray-600">{order.deliveryAddress}</Text>
          {order.customerPhone && <Text className="mt-1 text-xs text-gray-500">{order.customerName} • {order.customerPhone}</Text>}
          {order.driverName && <Text className="mt-2 text-xs font-medium text-blue-600">Driver: {order.driverName}</Text>}
        </View>

        {/* Items */}
        <View className="mx-4 mt-4 p-4 bg-white rounded-2xl border border-gray-100">
          <Text className="text-sm font-semibold text-black">Items ({order.items?.length || 0})</Text>
          <View className="mt-3 gap-3">
            {order.items?.map((it: any) => (
              <View key={it.id} className="flex-row justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-medium text-black">{it.name}</Text>
                  <Text className="text-xs text-gray-500">Qty {it.quantity} • Rs. {it.unitPrice}</Text>
                </View>
                <Text className="text-sm font-semibold text-black">Rs. {Number(it.totalPrice).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          <View className="mt-4 pt-3 border-t border-gray-100 gap-1">
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-500">Subtotal</Text>
              <Text className="text-xs text-gray-700">Rs. {Number(order.subtotal).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-500">Delivery Fee</Text>
              <Text className="text-xs text-gray-700">Rs. {Number(order.deliveryFee).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-sm font-bold text-black">Total</Text>
              <Text className="text-sm font-bold text-black">Rs. {Number(order.totalAmount).toFixed(2)}</Text>
            </View>
            <Text className="mt-1 text-xs text-gray-400">
              {order.paymentMethod} • {order.paymentStatus}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mx-4 mt-4 gap-3">
          {canTrack && (
            <TouchableOpacity onPress={() => router.push(`/(customer)/order-tracking/${orderId}` as any)} className="py-3 bg-primary rounded-xl items-center">
              <Text className="font-semibold text-white">Open Live Tracking</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity onPress={handleCancel} className="py-3 bg-white border border-red-200 rounded-xl items-center">
              <Text className="font-semibold text-red-600">Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
