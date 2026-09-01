import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CheckoutFailureScreen() {
  const params = useLocalSearchParams<{ reason?: string; message?: string }>();
  const reason = params.reason ?? params.message ?? 'Your payment could not be processed. Please try again.';

  const handleRetry = useCallback(() => {
    router.replace('/(customer)/checkout' as any);
  }, []);

  const handleGoCart = useCallback(() => {
    router.replace('/(customer)/cart' as any);
  }, []);

  const handleSupport = useCallback(() => {
    router.push('/(customer)/chatbot' as any);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-28 h-28 rounded-full bg-red-50 items-center justify-center mb-6 border border-red-100">
          <Feather name="x-circle" size={64} color="#EF4444" />
        </View>

        <Text className="text-2xl font-bold text-center" style={{ color: '#1F2937' }}>Payment Failed</Text>
        <Text className="text-base text-gray-500 text-center mt-2 leading-6">{reason}</Text>

        <View className="bg-red-50 rounded-xl p-4 mt-6 border border-red-100 w-full">
          <View className="flex-row gap-2 items-start">
            <Feather name="alert-circle" size={18} color="#EF4444" />
            <Text className="text-sm flex-1 leading-5" style={{ color: '#991B1B' }}>
              No amount was deducted. You can retry payment or choose a different method.
            </Text>
          </View>
        </View>

        <View className="w-full gap-3 mt-8">
          <TouchableOpacity onPress={handleRetry} className="bg-primary rounded-xl py-4 items-center">
            <Text className="text-white font-bold text-base">Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoCart}
            className="bg-white rounded-xl py-4 items-center border border-gray-200"
          >
            <Text className="text-black font-semibold text-base">Back to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSupport} className="py-3 items-center">
            <Text className="text-gray-500 font-medium">Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
