import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  ScreenHeader,
  StatusPill,
  PrimaryButton,
  InfoRow,
  ContentWidth,
  useResponsive,
  rs,
  type OrderStatus,
} from '@/components/res-owner/owner/kit';
import { useOrder } from '@/hooks/customer/useOrder';
import { useUpdateOrderStatus } from '@/hooks/owner/orders/useUpdateOrderStatus';

const FLOW: Array<{ key: OrderStatus; label: string; icon: React.ComponentProps<typeof Feather>['name'] }> = [
  { key: 'pending', label: 'Order Placed', icon: 'inbox' },
  { key: 'preparing', label: 'Preparing', icon: 'cpu' },
  { key: 'ready', label: 'Ready for Pickup', icon: 'package' },
  { key: 'delivered', label: 'Delivered', icon: 'check-circle' },
];

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTablet } = useResponsive();
  const { data: apiOrder, isLoading } = useOrder(id!);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  if (isLoading || !apiOrder) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }
  // Map API order to kit Order shape
  const order = {
    id: apiOrder.id,
    customer: (apiOrder as any).customerName || 'Customer',
    restaurant: (apiOrder as any).restaurantName || '',
    items: (apiOrder.items || []).map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.unitPrice })),
    subtotal: (apiOrder as any).subtotal ?? 0,
    deliveryFee: (apiOrder as any).deliveryFee ?? 0,
    total: (apiOrder as any).totalAmount ?? 0,
    status: ((apiOrder.orderStatus || 'pending').toLowerCase() as OrderStatus),
    placedAt: new Date(apiOrder.createdAt).toLocaleString(),
    deliveryAddress: (apiOrder as any).deliveryAddress || '',
    phone: (apiOrder as any).customerPhone || '',
  };

  const currentStep = FLOW.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  const nextAction = (() => {
    switch (order.status) {
      case 'pending':
        return { label: 'Accept & Start Preparing', to: 'preparing' as OrderStatus, variant: 'green' as const };
      case 'preparing':
        return { label: 'Mark as Ready', to: 'ready' as OrderStatus, variant: 'green' as const };
      case 'ready':
        return { label: 'Mark as Delivered', to: 'delivered' as OrderStatus, variant: 'green' as const };
      default:
        return null;
    }
  })();

  const advance = (to: OrderStatus) => {
    Alert.alert('Update Status', `Move this order to “${to}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus({ id: id!, status: to.toUpperCase() }) },
    ]);
  };

  const reject = () => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus({ id: id!, status: 'CANCELLED' }) },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={`Order #${(id || '').slice(-6).toUpperCase()}`}
        subtitle={isCancelled ? 'This order was cancelled' : `Placed ${order.placedAt}`}
        right={<StatusPill status={order.status} size="md" />}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[{ padding: 16 }, ContentWidth(isTablet ? 720 : 9999)]}>
        {/* ─── Status timeline ─── */}
        {!isCancelled && (
          <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100">
            {FLOW.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              const last = i === FLOW.length - 1;
              return (
                <View key={step.key} className="flex-row">
                  {/* rail */}
                  <View className="items-center">
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        active
                          ? 'bg-green-600'
                          : done
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                      }`}
                    >
                      <Feather
                        name={step.icon}
                        size={15}
                        color={active ? '#FFFFFF' : done ? '#16A34A' : '#94A3B8'}
                      />
                    </View>
                    {!last && (
                      <View
                        className={`w-0.5 flex-1 ${done ? 'bg-green-200' : 'bg-gray-100'}`}
                        style={{ minHeight: 22 }}
                      />
                    )}
                  </View>
                  {/* label */}
                  <View className="ml-3 flex-1 pb-4 pt-1.5">
                    <Text className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </Text>
                    {active && (
                      <Text className="mt-0.5 text-xs font-medium text-green-600">Current stage</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {isCancelled && (
          <View className="flex-row items-center rounded-2xl border border-red-200 bg-red-50 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Feather name="x-circle" size={20} color="#DC2626" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-red-600">Order Cancelled</Text>
              <Text className="text-xs text-red-400">No further action is required.</Text>
            </View>
          </View>
        )}

        {/* ─── Customer ─── */}
        <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100">
          <Text className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">Customer</Text>
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <Text className="text-base font-bold text-slate-600">{order.customer.charAt(0)}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-gray-900">{order.customer}</Text>
              <Text className="mt-0.5 text-xs text-gray-400">{order.phone}</Text>
            </View>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-green-50 active:bg-green-100">
              <Feather name="phone" size={17} color="#16A34A" />
            </Pressable>
          </View>
          <View className="mt-3 border-t border-gray-50 pt-1">
            <InfoRow icon="map-pin" label="Deliver to" value={order.deliveryAddress} last />
          </View>
        </View>

        {/* ─── Items ─── */}
        <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100">
          <Text className="mb-1 text-[13px] font-bold uppercase tracking-wide text-gray-400">
            Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </Text>
          {order.items.map((item, i) => (
            <View key={i} className="flex-row items-center py-2.5">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-green-50">
                <Text className="text-xs font-bold text-green-700">{item.quantity}x</Text>
              </View>
              <Text className="ml-3 flex-1 text-sm font-medium text-gray-800">{item.name}</Text>
              <Text className="text-sm font-semibold text-gray-700">{rs(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View className="mt-2 border-t border-dashed border-gray-200 pt-3">
            <View className="flex-row justify-between py-1">
              <Text className="text-sm text-gray-500">Subtotal</Text>
              <Text className="text-sm font-semibold text-gray-700">{rs(order.subtotal)}</Text>
            </View>
            <View className="flex-row justify-between py-1">
              <Text className="text-sm text-gray-500">Delivery Fee</Text>
              <Text className="text-sm font-semibold text-gray-700">{rs(order.deliveryFee)}</Text>
            </View>
            <View className="mt-1 flex-row justify-between rounded-xl bg-green-50 px-3 py-2.5">
              <Text className="text-sm font-bold text-gray-900">Total</Text>
              <Text className="text-sm font-extrabold text-green-700">{rs(order.total)}</Text>
            </View>
          </View>
        </View>

        {/* ─── Actions ─── */}
        <View className="mb-8 mt-5 gap-3">
          {nextAction ? (
            <>
              <PrimaryButton
                label={nextAction.label}
                variant={nextAction.variant}
                icon="check"
                onPress={() => advance(nextAction.to)}
              />
              {order.status === 'pending' && (
                <PrimaryButton label="Reject Order" variant="outline" icon="x" onPress={reject} />
              )}
            </>
          ) : (
            <PrimaryButton label="Back to Orders" variant="outline" icon="arrow-left" onPress={() => router.back()} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
