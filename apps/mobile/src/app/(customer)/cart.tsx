import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { useCreateOrder } from '@/api/orders';

const PAYMENT_METHODS = [
  { id: 'ONLINE', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'OFFLINE', label: 'Cash on Delivery', icon: '💵' },
];

export default function CartScreen() {
  const { getCartArray, getSubtotal, updateQty, clearCart } = useCartStore();
  const { mutate: placeOrder, isPending: isPlacingOrder } = useCreateOrder();
  
  const [promoCode, setPromoCode] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('OFFLINE');

  const cartItems = getCartArray();
  const subtotal = getSubtotal();

  // Group items by restaurant for display
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        emoji: item.emoji || '🏪',
        items: []
      };
    }
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {} as Record<string, any>);

  const groups = Object.values(groupedItems);

  const tax = Math.round(subtotal * 0.13);
  const deliveryFee = 60;
  const platformFee = 15;
  const discount = promoCode ? 50 : 0; // Fake discount
  const total = subtotal > 0 ? (subtotal + tax + deliveryFee + platformFee - discount) : 0;

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Text className="text-6xl mb-4">🛒</Text>
        <Text className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</Text>
        <Text className="text-slate-500 text-center mb-6">Looks like you haven't added any delicious food yet.</Text>
        <TouchableOpacity 
          className="bg-primary px-8 py-3 rounded-full"
          onPress={() => router.navigate('/(customer)' as any)}
        >
          <Text className="text-white font-bold text-base">Browse Restaurants</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-slate-800">Your Cart</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={clearCart}>
          <Text className="text-lg">🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart groups */}
        {groups.map((group) => (
          <View key={group.restaurantId} className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm border border-slate-100">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-lg bg-orange-50 items-center justify-center">
                <Text className="text-xl">{group.emoji}</Text>
              </View>
              <View>
                <Text className="text-base font-bold text-slate-800">{group.restaurantName}</Text>
              </View>
            </View>

            {group.items.map((item: any) => (
              <View key={item.id} className="flex-row items-center gap-3 py-3 border-t border-slate-100">
                <View className="w-14 h-14 rounded-lg bg-orange-50 items-center justify-center">
                  <Text className="text-2xl">🍽️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800 mb-1">{item.name}</Text>
                  <Text className="text-sm font-bold text-primary">Rs. {item.price}</Text>
                </View>
                <View className="flex-row items-center bg-primary rounded-full px-1 py-1">
                  <TouchableOpacity
                    className="w-7 h-7 items-center justify-center"
                    onPress={() => updateQty(item.id, -1)}
                  >
                    <Text className="text-white text-lg leading-6">−</Text>
                  </TouchableOpacity>
                  <Text className="text-white text-sm font-bold min-w-[20px] text-center">{item.qty}</Text>
                  <TouchableOpacity
                    className="w-7 h-7 items-center justify-center"
                    onPress={() => updateQty(item.id, 1)}
                  >
                    <Text className="text-white text-lg leading-6">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Promo code */}
        <View className="flex-row items-center bg-white mx-4 mt-3 rounded-xl px-4 py-2 border-2 border-dashed border-orange-200">
          <Text className="text-lg mr-2">🏷️</Text>
          <TextInput
            className="flex-1 h-12 text-sm text-slate-800"
            placeholder="Enter promo code"
            placeholderTextColor={Colors.textLight}
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity>
            <Text className="text-primary font-bold text-sm">Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery instructions */}
        <View className="bg-white mx-4 mt-3 rounded-xl px-4 shadow-sm border border-slate-100">
          <TextInput
            className="h-12 text-sm text-slate-800"
            placeholder="Delivery instructions (optional)"
            placeholderTextColor={Colors.textLight}
            value={deliveryNote}
            onChangeText={setDeliveryNote}
          />
        </View>

        {/* Bill Details */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-base font-extrabold text-slate-800 mb-3">Bill Details</Text>
          {[
            { label: 'Subtotal', value: `Rs. ${subtotal}` },
            { label: 'Taxes (13%)', value: `Rs. ${tax}` },
            { label: 'Delivery Fee', value: `Rs. ${deliveryFee}` },
            { label: 'Platform Fee', value: `Rs. ${platformFee}` },
          ].map((row) => (
            <View key={row.label} className="flex-row justify-between mb-2">
              <Text className="text-sm text-slate-500">{row.label}</Text>
              <Text className="text-sm text-slate-800 font-medium">{row.value}</Text>
            </View>
          ))}
          {discount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-green-600">Discount</Text>
              <Text className="text-sm text-green-600 font-medium">- Rs. {discount}</Text>
            </View>
          )}
          <View className="h-[1px] bg-slate-200 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-base font-extrabold text-slate-800">Grand Total</Text>
            <Text className="text-base font-extrabold text-slate-800">Rs. {total}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm border border-slate-100">
          <View className="flex-row justify-between mb-3">
            <Text className="text-base font-bold text-slate-800">📍 Delivery Address</Text>
            <TouchableOpacity>
              <Text className="text-sm font-semibold text-primary">Change</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-lg bg-slate-100 items-center justify-center">
              <Text className="text-2xl">🗺️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-800 mb-1">Home</Text>
              <Text className="text-xs text-slate-500 leading-tight">
                Ward 4, Jhamsikhel Marg, Lalitpur,{"\n"}Kathmandu 44600
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <Text className="text-base font-bold text-slate-800 mb-3">Payment Method</Text>
          {PAYMENT_METHODS.map((method, index) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center py-3 gap-3 ${index !== PAYMENT_METHODS.length - 1 ? 'border-b border-slate-100' : ''}`}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Text className="text-xl">{method.icon}</Text>
              <Text className="flex-1 text-sm font-medium text-slate-800">{method.label}</Text>
              <View className="w-5 h-5 rounded-full border-2 border-primary items-center justify-center">
                {selectedPayment === method.id && (
                  <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View className="h-24" />
      </ScrollView>

      {/* Place Order button */}
      <View className="absolute bottom-0 left-0 right-0 bg-primary flex-row items-center justify-between px-5 py-4 pb-8 shadow-lg border-t border-primary/20">
        <View>
          <Text className="text-xs text-white/80 font-medium mb-0.5">Total Amount</Text>
          <Text className="text-xl font-extrabold text-white">Rs. {total}</Text>
        </View>
        <TouchableOpacity 
          className="flex-row items-center bg-white/20 px-6 py-3 rounded-full"
          disabled={isPlacingOrder}
          onPress={() => {
            const orderData = {
              restaurantId: cartItems[0]?.restaurantId,
              deliveryAddress: 'Ward 4, Jhamsikhel Marg, Lalitpur, Kathmandu 44600',
              paymentMethod: selectedPayment,
              items: cartItems.map((item) => ({
                id: item.id,
                qty: item.qty,
                price: item.price
              }))
            };
            
            placeOrder(orderData, {
              onSuccess: () => {
                clearCart();
                router.replace('/(customer)/orders' as any);
              },
              onError: (err) => {
                console.error('Failed to place order:', err);
                alert('Failed to place order. Please try again.');
              }
            });
          }}
        >
          {isPlacingOrder ? (
             <ActivityIndicator color="white" />
          ) : (
             <>
               <Text className="text-lg font-extrabold text-white mr-2">Place Order</Text>
               <Text className="text-white text-lg">➔</Text>
             </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
