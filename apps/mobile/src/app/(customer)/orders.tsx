import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useOrders } from '@/api/orders';

export default function OrdersScreen() {
  const { data: orders, isLoading, isError } = useOrders();
  const [activeTab, setActiveTab] = useState('Active');

  const activeOrders = orders?.filter((o: any) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'].includes(o.orderStatus)) || [];
  const pastOrders = orders?.filter((o: any) => ['DELIVERED', 'CANCELLED'].includes(o.orderStatus)) || [];

  const displayOrders = activeTab === 'Active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-slate-800">Your Orders</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-slate-200 px-4 pt-2">
        {['Active', 'Past Orders'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            className={`flex-1 items-center pb-3 border-b-2 ${activeTab === tab ? 'border-primary' : 'border-transparent'}`}
            onPress={() => setActiveTab(tab)}
          >
            <Text className={`text-sm font-bold ${activeTab === tab ? 'text-primary' : 'text-slate-500'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-24">
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : isError ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-red-500 font-medium">Failed to load orders.</Text>
          </View>
        ) : displayOrders.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-5xl mb-4">🧾</Text>
            <Text className="text-lg font-bold text-slate-800 mb-2">No {activeTab.toLowerCase()} orders</Text>
            <Text className="text-slate-500">When you place an order, it will appear here.</Text>
            <TouchableOpacity 
              className="mt-6 px-6 py-3 bg-primary rounded-full"
              onPress={() => router.navigate('/(customer)' as any)}
            >
              <Text className="text-white font-bold">Order Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayOrders.map((order: any) => (
            <TouchableOpacity 
              key={order.id} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4"
              onPress={() => {
                // Navigate to order tracking/details
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-extrabold text-slate-800">Order #{order.id.slice(0,8).toUpperCase()}</Text>
                <View className={`px-2 py-1 rounded-md ${
                  order.orderStatus === 'DELIVERED' ? 'bg-green-100' :
                  order.orderStatus === 'CANCELLED' ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                  <Text className={`text-xs font-bold ${
                    order.orderStatus === 'DELIVERED' ? 'text-green-700' :
                    order.orderStatus === 'CANCELLED' ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    {order.orderStatus}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                <View className="w-12 h-12 bg-slate-100 rounded-xl items-center justify-center">
                  <Text className="text-2xl">🏪</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800 mb-1">Food Items</Text>
                  <Text className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-slate-500">Total:</Text>
                  <Text className="text-base font-extrabold text-primary">Rs. {order.totalAmount}</Text>
                </View>
                
                {activeTab === 'Active' ? (
                  <TouchableOpacity className="px-4 py-2 bg-slate-800 rounded-full">
                    <Text className="text-white text-xs font-bold">Track Order</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="px-4 py-2 bg-primary/10 rounded-full">
                    <Text className="text-primary text-xs font-bold">Reorder</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
