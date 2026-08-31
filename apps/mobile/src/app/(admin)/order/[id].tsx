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

export default function AdminOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id);
  const { mutate: updateStatus, isPending } = useAdminUpdateOrderStatus();

  const [showStatusModal, setShowStatusModal] = useState(false);

  if (isLoading || !order) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Order #{order.id.slice(0, 8)}</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-primary/10"
            onPress={() => setShowStatusModal(true)}
          >
            <Feather name="edit-2" size={16} color="#E23744" />
            <Text className="text-sm font-semibold text-primary">Update Status</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Status */}
        <View className="flex-row items-center justify-between p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <View>
            <Text className="text-sm text-gray-500">Order Status</Text>
            <OrderStatusBadge status={order.orderStatus} />
          </View>
          <Text className="text-xs text-gray-400">{formatDate(order.createdAt)}</Text>
        </View>

        {/* Customer Info */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Customer</Text>
          <Text className="text-sm font-medium text-black">{order.customerName}</Text>
          <Text className="text-sm text-gray-500">{order.customerPhone}</Text>
          <Text className="mt-1 text-sm text-gray-500">{order.deliveryAddress}</Text>
        </View>

        {/* Restaurant Info */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Restaurant</Text>
          <Text className="text-sm font-medium text-black">{order.restaurantName}</Text>
          <Text className="text-sm text-gray-500">{order.restaurantAddress}</Text>
        </View>

        {/* Driver Info */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Driver</Text>
          {order.driverId ? (
            <>
              <Text className="text-sm font-medium text-black">{order.driverName || 'Driver Assigned'}</Text>
              <Text className="text-sm text-gray-500">ID: {order.driverId}</Text>
            </>
          ) : (
            <Text className="text-sm text-gray-500">Not assigned yet</Text>
          )}
        </View>

        {/* Items */}
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

        {/* Payment */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Payment</Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Method</Text>
            <Text className="text-sm font-medium text-black">
              {order.paymentMethod === 'ONLINE' ? 'eSewa' : 'Cash on Delivery'}
            </Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-sm text-gray-500">Status</Text>
            <Text className={`text-sm font-medium ${order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
              {order.paymentStatus}
            </Text>
          </View>
          {order.paymentId && (
            <View className="flex-row justify-between mt-1">
              <Text className="text-sm text-gray-500">Payment ID</Text>
              <Text className="text-sm text-black">{order.paymentId}</Text>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Status Update Modal */}
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