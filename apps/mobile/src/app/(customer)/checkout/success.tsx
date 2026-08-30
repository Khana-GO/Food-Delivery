import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CheckoutSuccessScreen() {
  const params = useLocalSearchParams<{ orderId?: string; id?: string }>();
  const orderId = params.orderId ?? params.id;

  const handleViewOrder = useCallback(() => {
    if (orderId) router.replace(`/(customer)/order/${orderId}` as any);
    else router.replace('/(customer)/(tabs)/orders' as any);
  }, [orderId]);

  const handleGoHome = useCallback(() => {
    router.replace('/(customer)/(tabs)' as any);
  }, []);

  const handleTrackOrder = useCallback(() => {
    if (orderId) router.replace(`/(customer)/order-tracking/${orderId}` as any);
    else router.replace('/(customer)/(tabs)/orders' as any);
  }, [orderId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-28 h-28 rounded-full bg-green-50 items-center justify-center mb-6 border border-green-100">
          <Feather name="check-circle" size={64} color="#22C55E" />
        </View>

        <Text className="text-2xl font-bold text-black text-center">Payment Successful!</Text>
        <Text className="text-base text-gray-500 text-center mt-2 leading-6">
          Your order has been placed successfully. You will receive a confirmation shortly.
        </Text>

        {orderId ? (
          <View className="bg-gray-50 rounded-xl px-4 py-3 mt-6 border border-gray-100">
            <Text className="text-xs text-gray-500 text-center">Order ID</Text>
            <Text className="text-sm font-mono font-bold text-black text-center mt-1">{orderId}</Text>
          </View>
        ) : null}

        <View className="w-full gap-3 mt-8">
          <TouchableOpacity onPress={handleTrackOrder} className="bg-primary rounded-xl py-4 items-center">
            <Text className="text-white font-bold text-base">Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewOrder}
            className="bg-white rounded-xl py-4 items-center border border-gray-200"
          >
            <Text className="text-black font-semibold text-base">View Order Details</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGoHome} className="py-3 items-center">
            <Text className="text-gray-500 font-medium">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
