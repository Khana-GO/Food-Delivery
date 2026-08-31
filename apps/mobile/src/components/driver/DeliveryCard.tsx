import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Order } from '@food_delivery/types';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';

interface DeliveryCardProps {
  order: Order;
  onAccept?: () => void;
  isAccepting?: boolean;
  showAccept?: boolean;
}

export const DeliveryCard = ({
  order,
  onAccept,
  isAccepting = false,
  showAccept = true,
}: DeliveryCardProps) => {
  const formatDistance = (distance?: number) => {
    if (!distance) return '~2 km';
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
  };

  return (
    <View className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-xl">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name="shopping-bag" size={16} color="#E23744" />
          <Text className="text-sm font-bold text-black">Order #{order.id.slice(0, 8)}</Text>
        </View>
        <OrderStatusBadge status={order.orderStatus} />
      </View>

      {/* Restaurant */}
      <View className="flex-row items-center gap-2 mt-2">
        <Feather name="home" size={14} color="#94A3B8" />
        <Text className="text-sm text-gray-600">{order.restaurantName}</Text>
      </View>

      {/* Location */}
      <View className="flex-row items-center gap-2 mt-1">
        <Feather name="map-pin" size={14} color="#94A3B8" />
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {order.restaurantAddress}
        </Text>
      </View>

      {/* Customer & Distance */}
      <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-gray-50">
        <View className="flex-row items-center gap-2">
          <Feather name="user" size={14} color="#94A3B8" />
          <Text className="text-sm text-gray-600">{order.customerName}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Feather name="map-pin" size={12} color="#94A3B8" />
          <Text className="text-xs text-gray-400">{formatDistance((order as any).distance)}</Text>
        </View>
      </View>

      {/* Earnings */}
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-sm font-bold text-primary">Rs. {order.deliveryFee || 50}</Text>

        {showAccept && onAccept && (
          <TouchableOpacity
            className={`bg-primary px-6 py-2 rounded-lg ${isAccepting ? 'opacity-50' : ''}`}
            onPress={onAccept}
            disabled={isAccepting}
          >
            <Text className="text-sm font-semibold text-white">
              {isAccepting ? 'Accepting...' : 'Accept'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};