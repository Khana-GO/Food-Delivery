import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useOrder } from '@/hooks/customer/useOrder';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useCheckoutStore } from '@/stores/customer/checkoutStore';

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { reset } = useCheckoutStore();

  useEffect(() => {
    // Reset checkout state when component unmounts
    return () => reset();
  }, []);

  if (isLoading || !order) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
        <Text className="mt-4 text-sm text-gray-500">Loading order details...</Text>
      </View>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Success Header */}
        <View className="items-center py-8">
          <View className="items-center justify-center w-20 h-20 bg-green-100 rounded-full">
            <Feather name="check" size={40} color="#22C55E" />
          </View>
          <Text className="mt-4 text-2xl font-bold text-black">Order Placed! 🎉</Text>
          <Text className="mt-1 text-sm text-gray-500">Your order has been confirmed</Text>
        </View>

        {/* Order ID */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="text-sm text-gray-500">Order ID</Text>
          <Text className="text-base font-bold text-black">{order.id.slice(0, 12).toUpperCase()}</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <OrderStatusBadge status={order.orderStatus} />
            <Text className="text-xs text-gray-400">• {formatDate(order.createdAt)}</Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-semibold text-black">Restaurant</Text>
          <Text className="text-base font-medium text-black">{order.restaurantName}</Text>
          <Text className="text-sm text-gray-500">{order.restaurantAddress}</Text>
        </View>

        {/* Delivery Address */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-semibold text-black">Delivery Address</Text>
          <Text className="text-sm text-gray-600">{order.deliveryAddress}</Text>
        </View>

        {/* Order Items */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-semibold text-black">Order Items</Text>
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
          <Text className="mb-2 text-sm font-semibold text-black">Payment</Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Method</Text>
            <Text className="text-sm font-medium text-black">{order.paymentMethod === 'ONLINE' ? 'eSewa' : 'Cash on Delivery'}</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-sm text-gray-600">Status</Text>
            <Text className={`text-sm font-medium ${order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
              {order.paymentStatus}
            </Text>
          </View>
        </View>

        {/* Estimated Delivery */}
        {order.estimatedDeliveryTime && (
          <View className="flex-row items-center gap-3 p-4 mb-4 border border-blue-100 bg-blue-50 rounded-xl">
            <Feather name="clock" size={20} color="#2563EB" />
            <View>
              <Text className="text-sm font-semibold text-blue-700">Estimated Delivery</Text>
              <Text className="text-sm text-blue-600">
                {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Actions */}
      <View className="flex-row gap-3 px-4 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="items-center flex-1 py-4 bg-primary rounded-xl"
          onPress={() => router.push(`/(customer)/order-tracking/${order.id}` as any)}
        >
          <Text className="font-bold text-white">Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center flex-1 py-4 bg-gray-100 rounded-xl"
          onPress={() => router.push('/(customer)/(tabs)')}
        >
          <Text className="font-bold text-black">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}