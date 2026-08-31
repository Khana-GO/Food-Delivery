import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Order } from '@food_delivery/types';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Colors, Radius, Shadow } from '@/constants/theme';

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
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: Radius['2xl'],
        padding: 16,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderLight,
        ...Shadow.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="shopping-bag" size={16} color={Colors.primary} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <OrderStatusBadge status={order.orderStatus} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <Feather name="home" size={13} color={Colors.textTertiary} />
        <Text style={{ fontSize: 13, color: Colors.textSecondary }} numberOfLines={1}>{order.restaurantName}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <Feather name="map-pin" size={13} color={Colors.textTertiary} />
        <Text style={{ fontSize: 13, color: Colors.textTertiary }} numberOfLines={1}>{order.restaurantAddress}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginTop: 12, borderTopColor: Colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name="user" size={13} color={Colors.textTertiary} />
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{order.customerName}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="map-pin" size={11} color={Colors.textTertiary} />
          <Text style={{ fontSize: 11, color: Colors.textTertiary }}>{formatDistance((order as any).distance)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.primary }}>Rs. {order.deliveryFee || 50}</Text>

        {showAccept && onAccept && (
          <TouchableOpacity
            disabled={isAccepting}
            style={{
              backgroundColor: isAccepting ? Colors.textTertiary : Colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: Radius.full,
              opacity: isAccepting ? 0.6 : 1,
              ...Shadow.primary,
            }}
            onPress={onAccept}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>
              {isAccepting ? 'Accepting...' : 'Accept'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};