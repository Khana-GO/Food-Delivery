import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useOrder } from '@/hooks/customer/useOrder';
import { useUpdateOrderStatus } from '@/hooks/owner/orders/useUpdateOrderStatus';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { StatusUpdateActions } from '@/components/res-owner/orders/StatusUpdateActions';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  if (isLoading || !order) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  const handleStatusUpdate = (status: string) => {
    updateStatus({ id, status });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Order #{order.id.slice(0, 8)}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Status */}
        <View className="flex-row items-center justify-between p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <View>
            <Text className="text-sm text-gray-500">Status</Text>
            <OrderStatusBadge status={order.orderStatus} />
          </View>
          <Text className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</Text>
        </View>

        {/* Customer Info */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Customer Details</Text>
          <Text className="text-sm text-black">{order.customerName}</Text>
          <Text className="text-sm text-gray-500">{order.customerPhone}</Text>
          <Text className="mt-1 text-sm text-gray-500">{order.deliveryAddress}</Text>
        </View>

        {/* Order Items */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Items</Text>
          {order.items.map((item) => (
            <View key={item.id} className="flex-row justify-between py-1.5 border-b border-gray-50">
              <Text className="text-sm text-gray-600">{item.quantity}x {item.name}</Text>
              <Text className="text-sm font-medium text-black">Rs. {item.totalPrice}</Text>
            </View>
          ))}
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-sm font-bold text-black">Total</Text>
            <Text className="text-sm font-bold text-primary">Rs. {order.totalAmount}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Payment Method</Text>
            <Text className="text-sm font-medium text-black">{order.paymentMethod === 'ONLINE' ? 'eSewa' : 'COD'}</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-sm text-gray-500">Payment Status</Text>
            <Text className={`text-sm font-medium ${order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
              {order.paymentStatus}
            </Text>
          </View>
        </View>

        {/* Driver Assignment (if any) */}
        {order.driverId && (
          <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
            <Text className="mb-1 text-sm font-bold text-black">Driver</Text>
            <Text className="text-sm text-black">{order.driverName || 'Driver assigned'}</Text>
          </View>
        )}

        {/* Status Update Actions */}
        <StatusUpdateActions
          currentStatus={order.orderStatus}
          onUpdate={handleStatusUpdate}
          isPending={isPending}
        />

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}