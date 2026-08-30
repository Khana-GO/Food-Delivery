import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const handleProceedToPayment = useCallback(() => {
    router.push('/(customer)/payment' as any);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center gap-3 px-6 pt-2 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Checkout</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-5 border border-gray-100">
          <Text className="text-lg font-bold text-black mb-1">Order Summary</Text>
          <Text className="text-sm text-gray-500 mb-4">Review your items before placing the order.</Text>

          <View className="bg-gray-50 rounded-xl p-4 items-center justify-center py-8">
            <Feather name="shopping-bag" size={48} color="#D1D5DB" />
            <Text className="text-base font-medium text-gray-400 mt-3">Your cart is empty</Text>
            <Text className="text-sm text-gray-400 mt-1 text-center">Add items from a restaurant to checkout.</Text>
          </View>

          <View className="mt-5 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Subtotal</Text>
              <Text className="text-sm font-medium text-black">Rs 0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Delivery Fee</Text>
              <Text className="text-sm font-medium text-black">Rs 0</Text>
            </View>
            <View className="h-px bg-gray-100 my-2" />
            <View className="flex-row justify-between">
              <Text className="text-base font-bold text-black">Total</Text>
              <Text className="text-base font-bold text-black">Rs 0</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 bg-white rounded-2xl p-5 border border-gray-100">
          <Text className="text-base font-bold text-black mb-3">Delivery Address</Text>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/addresses' as any)}
            className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center border border-gray-100">
                <Feather name="map-pin" size={18} color="#E23744" />
              </View>
              <View>
                <Text className="text-sm font-medium text-black">Select address</Text>
                <Text className="text-xs text-gray-500">Choose delivery location</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-100 px-6 py-4">
        <TouchableOpacity onPress={handleProceedToPayment} className="bg-primary rounded-xl py-4 items-center">
          <Text className="text-white font-bold text-base">Proceed to Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(customer)/(tabs)' as any)} className="py-3 items-center mt-2">
          <Text className="text-gray-500 font-medium">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
