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

  const customerEmail = (order as any).customerEmail || (order as any).email || '';
  const customerPhone = (order as any).customerPhone || '';
  const paymentMethod = (order as any).paymentMethod || 'OFFLINE';
  const paymentStatus = (order as any).paymentStatus || 'PENDING';
  const deliveryAddress = (order as any).deliveryAddress || '';
  const totalAmount = (order as any).totalAmount ?? (order as any).total ?? 0;

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

      {/* Restaurant */}
      <View style={{ backgroundColor: Colors.backgroundAlt, borderRadius: Radius.lg, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: Colors.borderLight }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="home" size={13} color={Colors.primary} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark, flex: 1 }} numberOfLines={1}>{order.restaurantName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.white, paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight }}>
            <Feather name="map-pin" size={10} color={Colors.textTertiary} />
            <Text style={{ fontSize: 10, color: Colors.textTertiary, fontWeight: '600' }}>{formatDistance((order as any).distance)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
          <Feather name="map-pin" size={12} color={Colors.textTertiary} style={{ marginTop: 2 }} />
          <Text style={{ fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 16 }} numberOfLines={2}>{order.restaurantAddress}</Text>
        </View>
      </View>

      {/* Delivery location - critical for driver decision */}
      <View style={{ backgroundColor: '#EFF6FF', borderRadius: Radius.lg, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#BFDBFE' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Feather name="navigation" size={12} color="#2563EB" />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E40AF', letterSpacing: 0.3 }}>DELIVERY LOCATION</Text>
          <View style={{ marginLeft: 'auto', backgroundColor: Colors.white, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: '#BFDBFE' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#2563EB' }}>{formatDistance((order as any).distance)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
          <Feather name="map-pin" size={13} color="#2563EB" style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 13, color: '#1E293B', fontWeight: '600', flex: 1, lineHeight: 18 }} numberOfLines={3}>{deliveryAddress || 'Delivery address not available'}</Text>
        </View>
        <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4, marginLeft: 19 }}>Customer drop-off • Verify before accept</Text>
      </View>

      {/* Customer contact */}
      <View style={{ backgroundColor: '#F0FDF4', borderRadius: Radius.lg, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#BBF7D0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Feather name="user" size={12} color="#15803D" />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#14532D', letterSpacing: 0.3 }}>CUSTOMER CONTACT</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <Feather name="user" size={13} color={Colors.textTertiary} />
          <Text style={{ fontSize: 13, color: Colors.textDark, fontWeight: '600', flex: 1 }} numberOfLines={1}>{order.customerName || 'Customer'}</Text>
        </View>
        {customerPhone ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Feather name="phone" size={12} color="#15803D" />
            <Text style={{ fontSize: 13, color: '#15803D', fontWeight: '600' }} selectable>{customerPhone}</Text>
            <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: '#BBF7D0' }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#15803D' }}>Call</Text>
            </View>
          </View>
        ) : null}
        {customerEmail ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Feather name="mail" size={12} color="#15803D" />
            <Text style={{ fontSize: 12, color: Colors.textSecondary, flex: 1 }} numberOfLines={1} selectable>{customerEmail}</Text>
          </View>
        ) : null}
        {!customerPhone && !customerEmail ? (
          <Text style={{ fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic', marginTop: 2 }}>Contact available after accept</Text>
        ) : null}
      </View>

      {/* Payment */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: paymentMethod === 'ONLINE' ? '#FEF3C7' : Colors.backgroundAlt, borderRadius: Radius.lg, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: paymentMethod === 'ONLINE' ? '#FDE68A' : Colors.borderLight }}>
        <Feather name="credit-card" size={14} color={paymentMethod === 'ONLINE' ? '#D97706' : Colors.textSecondary} />
        <Text style={{ fontSize: 12, fontWeight: '800', color: paymentMethod === 'ONLINE' ? '#92400E' : Colors.textSecondary }}>
          {paymentMethod === 'ONLINE' ? 'Online Paid' : 'Cash on Delivery'}
        </Text>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11, color: Colors.textTertiary, fontWeight: '600' }}>{paymentStatus}</Text>
          <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.primary }}>Rs. {totalAmount}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary }}>Fee</Text>
          <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.primary }}>Rs. {order.deliveryFee || 50}</Text>
        </View>

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
              {isAccepting ? 'Accepting...' : 'Accept & View Map →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};