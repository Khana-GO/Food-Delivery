import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDriverActiveOrder } from '@/hooks/driver/useDriverActiveOrder';
import { useDriverLocation } from '@/hooks/driver/useDriverLocation';
import { useUpdateDeliveryStatus } from '@/hooks/driver/useUpdateDeliveryStatus';
import { useOrderTracking } from '@/hooks/tracking/useOrderTracking';
import { OrderTrackingMap } from '@/components/map/OrderTrackingMap';
import { useAuth } from '@/contexts/AuthContext';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius, Shadow } from '@/constants/theme';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';

export default function ActiveDeliveryScreen() {
  const { data: order, isLoading, refetch } = useDriverActiveOrder();
  const { location } = useDriverLocation(order?.id || '', !!order);
  const { mutate: updateStatus, isPending } = useUpdateDeliveryStatus();
  const { user } = useAuth();
  const { data: trackingData, isLoading: trackingLoading, connectWebSocket } = useOrderTracking({
    orderId: order?.id,
    autoFetch: !!order?.id,
    pollingInterval: 5000,
  });
  const customerEmail = (order as any)?.customerEmail || (order as any)?.email || '';

  useEffect(() => {
    if (user?.id && order?.id) connectWebSocket(user.id);
  }, [user?.id, order?.id, connectWebSocket]);

  // Fallback tracking data from order + live driver location so map shows instantly even if API slow
  const mapData = (() => {
    if (trackingData) return trackingData;
    if (!order) return null;
    const o: any = order;
    // Try to extract coords if backend sent them directly on order
    const rLat = o.restaurantLatitude ?? o.restaurantLat ?? o.restaurant?.latitude;
    const rLng = o.restaurantLongitude ?? o.restaurantLng ?? o.restaurant?.longitude;
    const dLat = o.deliveryLatitude ?? o.deliveryLat ?? o.addressLatitude ?? o.customerLatitude;
    const dLng = o.deliveryLongitude ?? o.deliveryLng ?? o.addressLongitude ?? o.customerLongitude;
    return {
      orderId: order.id,
      driver: location ? { latitude: location.coords.latitude, longitude: location.coords.longitude, lastUpdatedAt: new Date().toISOString(), isOnline: true, speed: (location.coords as any)?.speed, heading: (location.coords as any)?.heading } : null,
      route: null,
      restaurant: rLat && rLng ? { lat: Number(rLat), lng: Number(rLng) } : null,
      delivery: dLat && dLng ? { lat: Number(dLat), lng: Number(dLng), address: order.deliveryAddress } : { lat: 27.7172, lng: 85.324, address: order.deliveryAddress },
      orderStatus: order.orderStatus,
      estimatedDistance: null,
      estimatedDuration: null,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      history: [],
    } as any;
  })();
  const mapReadyData = mapData as any;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <AnimatedPage style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm }}>
            <Feather name="truck" size={32} color={Colors.white} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textDark, marginTop: 16 }}>No Active Delivery</Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' }}>Accept an order to start delivering</Text>
          <TouchableOpacity
            onPress={() => router.push('/(driver)/(tabs)/available-orders' as any)}
            style={{ marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: Radius.full, ...Shadow.primary }}
            activeOpacity={0.8}
          >
            <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 15 }}>Find Orders</Text>
          </TouchableOpacity>
        </View>
      </AnimatedPage>
    );
  }

  const canPickUp = order.orderStatus === 'READY';
  const canDeliver = order.orderStatus === 'PICKED_UP';

  const handlePickUp = () => {
    Alert.alert('Picked Up?', 'Confirm you have picked up the order from restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus({ orderId: order.id, status: 'PICKED_UP' }) },
    ]);
  };
  const handleDelivered = () => {
    Alert.alert('Delivered?', 'Confirm delivery to customer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus({ orderId: order.id, status: 'DELIVERED' }) },
    ]);
  };

  return (
    <AnimatedPage style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: Colors.primary, paddingTop: 48, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: Radius['2xl'], borderBottomRightRadius: Radius['2xl'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>ACTIVE DELIVERY</Text>
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 4 }}>#{(order.id as string).slice(0, 8).toUpperCase()}</Text>
            </View>
            <OrderStatusBadge status={order.orderStatus} />
          </View>
        </View>

        {/* ── Driver Map — Live → Customer ── */}
        <View style={{ marginHorizontal: 16, marginTop: -12, borderRadius: Radius.xl, overflow: 'hidden', height: 300, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.md, backgroundColor: Colors.white }}>
          <View style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: location ? Colors.success : Colors.warning }} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textDark }}>{location ? 'LIVE' : 'Locating...'}</Text>
              <Text style={{ fontSize: 11, color: Colors.textTertiary }}>• {location ? 'You → Customer' : 'Starting...'}</Text>
            </View>
            {(trackingData?.estimatedDistance ?? mapReadyData?.estimatedDistance) ? (
              <View style={{ backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 5, borderRadius: Radius.full }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.white }}>
                  {trackingData?.estimatedDistance ? `${(trackingData.estimatedDistance / 1000).toFixed(1)} km • ${Math.round((trackingData.estimatedDuration || 0) / 60)} min` : location ? 'Live tracking' : 'Route ready'}
                </Text>
              </View>
            ) : null}
          </View>
          <OrderTrackingMap key={`${order.id}-${trackingData ? 'tracked' : 'fallback'}-${location ? 'live' : 'static'}`} data={mapReadyData} isLoading={false} />
        </View>

        {/* ── Detailed Customer Location ── */}
        <PremiumCard elevation="md" padding={14} style={{ marginHorizontal: 16, marginTop: 10, borderColor: '#2563EB', borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' }}>
              <Feather name="map-pin" size={14} color="#2563EB" />
            </View>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E40AF', letterSpacing: 0.3 }}>CUSTOMER DROP-OFF LOCATION</Text>
            <View style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, lineHeight: 20 }} selectable>{order.deliveryAddress}</Text>
          <View style={{ height: 1, backgroundColor: Colors.borderLight, marginVertical: 10 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Feather name="user" size={12} color={Colors.textTertiary} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textDark }}>{order.customerName}</Text>
            <Text style={{ fontSize: 12, color: Colors.textTertiary }}>•</Text>
            <Feather name="phone" size={12} color={Colors.success} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.success }} selectable>{order.customerPhone}</Text>
            {customerEmail ? (
              <>
                <Text style={{ fontSize: 12, color: Colors.textTertiary }}>•</Text>
                <Feather name="mail" size={12} color={Colors.textSecondary} />
                <Text style={{ fontSize: 12, color: Colors.textSecondary }} selectable numberOfLines={1}>{customerEmail}</Text>
              </>
            ) : null}
          </View>
          {trackingData?.delivery?.lat ? (
            <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 6, fontWeight: '500' }}>
              Coords: {trackingData.delivery.lat.toFixed(5)}, {trackingData.delivery.lng.toFixed(5)}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={() => {
              const lat = (trackingData?.delivery as any)?.lat;
              const lng = (trackingData?.delivery as any)?.lng;
              const q = lat && lng ? `${lat},${lng}` : encodeURIComponent(order.deliveryAddress);
              Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${q}`);
            }}
            style={{ marginTop: 10, backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: Radius.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
            activeOpacity={0.8}
          >
            <Feather name="navigation" size={14} color={Colors.white} />
            <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 13 }}>Get Directions to Customer</Text>
          </TouchableOpacity>
        </PremiumCard>

        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 10 }}>
          <TouchableOpacity
            onPress={() => {
              const lat = (trackingData?.restaurant as any)?.lat || (trackingData?.delivery as any)?.lat;
              const lng = (trackingData?.restaurant as any)?.lng || (trackingData?.delivery as any)?.lng;
              const q = lat && lng ? `${lat},${lng}` : encodeURIComponent(order.restaurantAddress || order.deliveryAddress);
              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
            }}
            style={{ flex: 1, backgroundColor: Colors.primary, paddingVertical: 11, borderRadius: Radius.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
            activeOpacity={0.8}
          >
            <Feather name="navigation" size={14} color={Colors.white} />
            <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 12 }}>Open Full Map</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 10, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 11, color: Colors.textTertiary, fontWeight: '600' }}>
              {trackingData?.estimatedDistance ? `${(trackingData.estimatedDistance / 1000).toFixed(1)} km` : ''} {trackingData?.estimatedDuration ? `• ${Math.round(trackingData.estimatedDuration / 60)} min` : 'Live route'}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 12 }}>
          <PremiumCard elevation="md" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="home" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Pickup • {order.restaurantName}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }} numberOfLines={2}>{order.restaurantAddress}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                const q = encodeURIComponent(order.restaurantAddress || '');
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 }}
              activeOpacity={0.7}
            >
              <Feather name="map-pin" size={12} color={Colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Open in Maps</Text>
            </TouchableOpacity>
          </PremiumCard>

          <PremiumCard elevation="md" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="user" size={18} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Deliver to • {order.customerName}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }} numberOfLines={2}>{order.deliveryAddress}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight }}>
                    <Feather name="phone" size={11} color={Colors.success} />
                    <Text style={{ fontSize: 12, color: Colors.textDark, fontWeight: '600' }} selectable>{order.customerPhone}</Text>
                  </View>
                  {customerEmail ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight }}>
                      <Feather name="mail" size={11} color={Colors.textSecondary} />
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: '500' }} selectable numberOfLines={1}>{customerEmail}</Text>
                    </View>
                  ) : null}
                  <View style={{ backgroundColor: (order as any).paymentMethod === 'ONLINE' ? '#FEF3C7' : Colors.backgroundAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: (order as any).paymentMethod === 'ONLINE' ? '#FDE68A' : Colors.borderLight }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: (order as any).paymentMethod === 'ONLINE' ? '#92400E' : Colors.textSecondary }}>
                      {(order as any).paymentMethod === 'ONLINE' ? 'Online Paid' : 'Cash on Delivery'} • Rs. {order.totalAmount ?? (order as any).total ?? 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity onPress={() => order.customerPhone && Linking.openURL(`tel:${order.customerPhone}`)} style={{ flex: 1, backgroundColor: Colors.success, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }} activeOpacity={0.8}>
                <Feather name="phone" size={14} color={Colors.white} />
                <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 13 }}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const q = encodeURIComponent(order.deliveryAddress || '');
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
                }}
                style={{ flex: 1, backgroundColor: Colors.backgroundAlt, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
                activeOpacity={0.8}
              >
                <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.textDark }}>Directions</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>

          <PremiumCard elevation="sm" padding={16}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 12 }}>Order • Rs. {order.totalAmount ?? (order as any).total ?? 0}</Text>
            {(order.items || []).slice(0, 4).map((it: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i === Math.min((order.items || []).length, 4) - 1 ? 0 : 1, borderBottomColor: Colors.borderLight }}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{it.quantity}x {it.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Rs. {it.totalPrice ?? it.price * it.quantity}</Text>
              </View>
            ))}
          </PremiumCard>

          <PremiumCard elevation="sm" padding={14} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: location ? Colors.success : Colors.warning }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>{location ? 'Live location sharing' : 'Starting location...'}</Text>
            </View>
            <Feather name="navigation" size={16} color={location ? Colors.success : Colors.textTertiary} />
          </PremiumCard>

          <View style={{ gap: 10, marginTop: 4 }}>
            {canPickUp && (
              <TouchableOpacity
                onPress={handlePickUp}
                disabled={isPending}
                style={{ backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center', opacity: isPending ? 0.6 : 1, ...Shadow.primary }}
                activeOpacity={0.8}
              >
                <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>{isPending ? 'Updating...' : 'Mark as Picked Up →'}</Text>
              </TouchableOpacity>
            )}
            {canDeliver && (
              <TouchableOpacity
                onPress={handleDelivered}
                disabled={isPending}
                style={{ backgroundColor: Colors.success, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center', opacity: isPending ? 0.6 : 1, ...Shadow.sm }}
                activeOpacity={0.8}
              >
                <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>{isPending ? 'Updating...' : 'Mark as Delivered ✓'}</Text>
              </TouchableOpacity>
            )}
            {!canPickUp && !canDeliver && order.orderStatus !== 'DELIVERED' && (
              <View style={{ backgroundColor: Colors.backgroundAlt, padding: 16, borderRadius: Radius.lg, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '600' }}>Waiting for restaurant to prepare… Status: {order.orderStatus}</Text>
              </View>
            )}
            {order.orderStatus === 'DELIVERED' && (
              <View style={{ backgroundColor: Colors.successBg, padding: 16, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.successLight }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.success }}>Delivered ✓ Great job!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </AnimatedPage>
  );
}