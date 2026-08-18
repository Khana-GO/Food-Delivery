import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOrder({
        id: id as string,
        customer: 'John Doe',
        restaurant: 'Spice Garden',
        total: 45.99,
        status: 'DELIVERED',
        items: [
          { name: 'Chicken Biryani', quantity: 1, price: 15.99 },
          { name: 'Garlic Naan', quantity: 2, price: 4.99 },
        ],
        createdAt: '2024-06-01T14:20:00Z',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-600';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-600';
      case 'PENDING':
        return 'bg-orange-100 text-orange-600';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Order Details</Text>
          <Text className="text-sm text-gray-500">#{id?.slice(0, 8)}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Order Status</Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(order?.status)}`}>
              <Text className={`text-xs font-semibold`}>{order?.status}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
          <Text className="text-sm font-bold text-black mb-3">Customer</Text>
          <Text className="text-base text-black">{order?.customer}</Text>
          <Text className="text-sm text-gray-500 mt-1">{order?.restaurant}</Text>
        </View>

        {/* Items */}
        <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
          <Text className="text-sm font-bold text-black mb-3">Order Items</Text>
          {order?.items.map((item: any, index: number) => (
            <View key={index} className="flex-row items-center justify-between py-2 border-b border-gray-50">
              <View>
                <Text className="text-sm text-black font-medium">{item.name}</Text>
                <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
              </View>
              <Text className="text-sm font-semibold text-black">${item.price.toFixed(2)}</Text>
            </View>
          ))}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
            <Text className="text-base font-bold text-black">Total</Text>
            <Text className="text-base font-bold text-black">${order?.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 mt-6 mb-8">
          <TouchableOpacity className="flex-1 bg-primary py-3 rounded-xl">
            <Text className="text-white font-semibold text-center">Update Status</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-red-500 py-3 rounded-xl">
            <Text className="text-white font-semibold text-center">Cancel Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 