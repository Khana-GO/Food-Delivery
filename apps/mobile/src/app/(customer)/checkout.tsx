import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCartStore } from '@/stores/customer/cartStore';
import { useAddressStore } from '@/stores/customer/addressStore';
import { useCheckoutStore } from '@/stores/customer/checkoutStore';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { useCreateOrder } from '@/hooks/customer/useCreateOrder';
import { AddressCard } from '@/components/customer/AddressCard';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { OrderSummary } from '@/components/payment/OrderSummary';
import { orderService } from '@/services/customer/order.service';
import { cartService } from '@/stores/customer/cart.service';
import { getApiErrorMessage } from '@/lib/api-error';

export default function CheckoutScreen() {
  const { items, totalPrice, restaurantId } = useCartStore();
  const { addresses } = useAddressStore();
  const { setSelectedAddress } = useAddressStore();
  const { selectedAddressId, paymentMethod, notes, setSelectedAddressId, setPaymentMethod, setNotes, setProcessing, isProcessing } = useCheckoutStore();
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
  const { refetch: refetchAddresses } = useAddresses();

  const [isValidating, setIsValidating] = useState(false);
  const [isPlacingOnline, setIsPlacingOnline] = useState(false);
  const [backendCart, setBackendCart] = useState<any>(null);

  // Derive fees from backend if available, else fallback (must be before handlePlaceOrder)
  const deliveryFee = backendCart?.deliveryFee != null ? Number(backendCart.deliveryFee) : 50;
  const subtotal = backendCart?.subtotal != null ? Number(backendCart.subtotal) : totalPrice;
  const total = subtotal + deliveryFee;
  const minimumOrder = backendCart?.minimumOrderAmount != null ? Number(backendCart.minimumOrderAmount) : undefined;
  const belowMinimum = minimumOrder != null && subtotal < minimumOrder;

  // Load addresses + backend cart on mount
  useEffect(() => {
    refetchAddresses();
    cartService
      .getCart()
      .then(setBackendCart)
      .catch(() => {});
  }, []);

  // Auto-select default address
  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
      setSelectedAddress(def);
    }
  }, [addresses, selectedAddressId]);

  const validateCart = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    try {
      const cartItems = items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));
      const result: any = await orderService.validateCart(cartItems);
      if (!result.valid) {
        const unavailable = result.items?.filter((i: any) => !i.isAvailable) || [];
        const priceUpdated = result.items?.filter((i: any) => i.priceUpdated) || [];
        let msg = '';
        if (unavailable.length) msg += `${unavailable.length} item(s) unavailable: ${unavailable.map((i: any) => i.name).join(', ')}. `;
        if (priceUpdated.length) msg += `${priceUpdated.length} item(s) price changed. `;
        msg = msg || 'Some items changed. Please review your cart.';
        Alert.alert('Cart Updated', msg.trim());
        // Optionally, sync cart with backend to reflect new prices/availability
        // For now, we let user review; backend will enforce correct pricing on order creation anyway
        return false;
      }
      return true;
    } catch (e: any) {
      Alert.alert('Error', getApiErrorMessage(e, 'Failed to validate cart'));
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [items]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }
    if (!restaurantId) {
      Alert.alert('Error', 'Restaurant missing. Please re-add items.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty');
      return;
    }
    // Minimum order check using backend cart if available
    if (backendCart?.minimumOrderAmount) {
      const subtotal = backendCart?.subtotal ?? totalPrice;
      if (subtotal < Number(backendCart.minimumOrderAmount)) {
        Alert.alert('Minimum Order', `Minimum order is Rs. ${backendCart.minimumOrderAmount}. Add more items.`);
        return;
      }
      if (backendCart.restaurantIsOpen === false) {
        Alert.alert('Restaurant Closed', 'This restaurant is currently closed. Please try later.');
        return;
      }
    }

    const isValid = await validateCart();
    if (!isValid) return;

    const basePayload: any = {
      restaurantId,
      addressId: selectedAddressId,
      items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, unitPrice: i.price })),
      notes: notes?.trim() || undefined,
      paymentMethod,
    };

    if (paymentMethod === 'OFFLINE') {
      // Cash on delivery – direct create
      setProcessing(true);
      createOrder(basePayload);
      // useCreateOrder handles clear + navigation; reset processing after
      setTimeout(() => setProcessing(false), 800);
      return;
    }

    // ONLINE (eSewa) – create pending order first, then pay
    setIsPlacingOnline(true);
    setProcessing(true);
    try {
      const order = await orderService.create({ ...basePayload, paymentMethod: 'ONLINE' });
      // Navigate to eSewa webview with orderId and amount from backend (authoritative)
      const amount = (order as any).totalAmount ?? total;
      router.push({ pathname: '/(customer)/payment/esewa-webview' as any, params: { orderId: order.id, amount: String(amount) } });
    } catch (e: any) {
      Alert.alert('Order Failed', getApiErrorMessage(e, 'Failed to place order'));
    } finally {
      setIsPlacingOnline(false);
      setProcessing(false);
    }
  };

  const isBusy = isValidating || isCreating || isPlacingOnline || isProcessing;

  if (items.length === 0) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-gray-50">
        <Feather name="shopping-bag" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">Cart is empty</Text>
        <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => router.push('/(customer)/(tabs)/explore' as any)}>
          <Text className="font-semibold text-white">Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 border-b border-gray-100" style={{ backgroundColor: '#B5122A', shadowColor: '#7F0D1D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8 }}>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Feather name="arrow-left" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Checkout</Text>
            {backendCart?.restaurantName ? <Text className="ml-2 text-xs" style={{ color: 'rgba(255,255,255,0.85)' }} numberOfLines={1}>{backendCart.restaurantName}</Text> : null}
          </View>
        </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Address Section */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-bold text-black">Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/address/create' as any)}>
              <Text className="text-sm font-semibold text-primary">Add New</Text>
            </TouchableOpacity>
          </View>
          {addresses.length === 0 ? (
            <TouchableOpacity className="items-center p-4 bg-white border border-gray-300 border-dashed rounded-xl" onPress={() => router.push('/(customer)/address/create' as any)}>
              <Feather name="plus" size={24} color="#94A3B8" />
              <Text className="mt-2 text-sm text-gray-500">Add a delivery address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddressId === address.id}
                onSelect={(id) => {
                  setSelectedAddressId(id);
                  const found = addresses.find((a) => a.id === id) || null;
                  setSelectedAddress(found);
                }}
                onEdit={(id) => router.push(`/(customer)/address/${id}/edit` as any)}
                onDelete={(id) => {
                  Alert.alert('Delete Address', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          const { addressService } = await import('@/services/customer/address.service');
                          await addressService.delete(id);
                          refetchAddresses();
                        } catch {}
                      },
                    },
                  ]);
                }}
              />
            ))
          )}
        </View>

        {/* Payment Method */}
        <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
        {paymentMethod === 'ONLINE' && (
          <View className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex-row gap-2">
            <Feather name="info" size={16} color="#2563EB" />
            <Text className="flex-1 text-xs text-blue-800">You'll be redirected to eSewa to complete payment securely. Order will be created as pending and confirmed after payment.</Text>
          </View>
        )}

        {/* Notes */}
        <View className="mt-4">
          <Text className="text-sm font-semibold text-black mb-1.5">Order Notes (Optional)</Text>
          <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
            className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
            placeholder="Special instructions for the restaurant"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Order Summary – authoritative from backend when available */}
        <View className="mt-4">
          <OrderSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} itemsCount={items.length} />
          {belowMinimum && <Text className="mt-2 text-xs text-red-500">Below minimum order Rs. {minimumOrder}. Add Rs. {(minimumOrder! - subtotal).toFixed(2)} more.</Text>}
          {backendCart?.restaurantIsOpen === false && <Text className="mt-2 text-xs text-red-500">Restaurant is currently closed.</Text>}
        </View>

        <View className="h-6" />
      </ScrollView>

      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity className={`bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 ${isBusy || belowMinimum || addresses.length === 0 ? 'opacity-50' : ''}`} onPress={handlePlaceOrder} disabled={isBusy || belowMinimum || addresses.length === 0}>
          {isBusy ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text className="text-base font-bold text-white">{paymentMethod === 'ONLINE' ? 'Pay with eSewa' : 'Place Order'}</Text>
              <Feather name={paymentMethod === 'ONLINE' ? 'credit-card' : 'arrow-right'} size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
        {addresses.length === 0 && <Text className="mt-2 text-xs text-center text-red-500">Please add a delivery address</Text>}
        {belowMinimum && <Text className="mt-2 text-xs text-center text-red-500">Add more items to meet minimum</Text>}
      </View>
    </View>
  );
}
