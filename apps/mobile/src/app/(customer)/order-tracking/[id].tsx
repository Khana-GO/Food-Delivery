import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goBack } from '@/lib/navigation';
import { useOrderTracking } from '@/hooks/tracking/useOrderTracking';
import { useETA } from '@/hooks/tracking/useETA';
import { useAuth } from '@/contexts/AuthContext';
import { OrderTrackingMap } from '@/components/map/OrderTrackingMap';
import { OrderProgressTimeline } from '@/components/order/OrderProgressTimeline';
import { OrderStatusCard } from '@/components/order/OrderStatusCard';
import { ETADisplay } from '@/components/order/ETADisplay';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Responsive layout ───
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isCompact = width < 360;
  const headerPad = isTablet ? 24 : 16;
  const contentPad = isTablet ? 24 : isCompact ? 12 : 16;
  const headerTopPad = Math.max(insets.top + 6, 10);
  const mapHeight = isLandscape
    ? Math.max(Math.min(Math.round(height * 0.55), 420), 240)
    : Math.max(Math.min(Math.round(height * 0.42), 380), 240);
  const titleSize = isCompact ? 19 : isTablet ? 24 : 22;
  const subSize = isCompact ? 11 : 12;

  // ─── Tracking hook ───
  const {
    data,
    driverLocation,
    isLoading,
    error,
    refresh,
    connectWebSocket,
  } = useOrderTracking({
    orderId: id,
    autoFetch: true,
    pollingInterval: 5000,
  });

  // ─── ETA calculation ───
  const { etaInfo, isCalculating } = useETA({
    distance: data?.route?.distance || 0,
    speed: driverLocation?.speed || 0,
    isMoving: !!driverLocation,
    lastUpdatedAt: driverLocation?.lastUpdatedAt ? new Date(driverLocation.lastUpdatedAt) : undefined,
  });

  // ─── Connect WebSocket when user is available ───
  useEffect(() => {
    if (user?.id) {
      connectWebSocket(user.id);
    }
  }, [user?.id, connectWebSocket]);

  // ─── Handle refresh ───
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  // ─── Get order status ───
  const getStatusLabel = () => {
    if (!data) return 'Loading...';
    const statusMap: Record<string, string> = {
      PENDING: 'Order Placed',
      CONFIRMED: 'Confirmed',
      PREPARING: 'Preparing',
      READY: 'Ready',
      PICKED_UP: 'Out for Delivery',
      DELIVERED: 'Delivered!',
      CANCELLED: 'Cancelled',
    };
    return statusMap[data.orderStatus] || data.orderStatus;
  };

  // Live map is only available after the driver picks up the order
  const canShowMap = ['PICKED_UP', 'DELIVERED'].includes(data?.orderStatus ?? '');

  if (isLoading && !data) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
        <Text className="mt-4 text-sm text-gray-500">Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text className="mt-4 text-lg font-medium text-red-500">Something went wrong</Text>
        <Text className="mt-2 text-sm text-center text-gray-500">{error}</Text>
        <TouchableOpacity
          className="px-6 py-3 mt-6 bg-primary rounded-xl"
          onPress={handleRefresh}
        >
          <Text className="font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="shopping-bag" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">Order Not Found</Text>
        <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => goBack('/(customer)/(tabs)/orders')}>
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ─── Header ─── premium crimson */}
      <View className="pb-4 border-b border-gray-100" style={{ backgroundColor: '#B5122A', paddingTop: headerTopPad, paddingHorizontal: headerPad }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => goBack('/(customer)/(tabs)/orders')} className="p-1" style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Feather name="arrow-left" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="font-bold" style={{ color: '#FFFFFF', fontSize: titleSize }}>Track Order</Text>
              <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.85)', fontSize: subSize }}>Order #{id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRefresh} className="p-2" style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Status Badge */}
        <View className="flex-row items-center gap-2 mt-3">
          <View className={`w-2 h-2 rounded-full ${data.orderStatus === 'DELIVERED' ? 'bg-green-500' : 'bg-primary'}`} />
          <Text className="text-sm font-semibold text-black" style={{ fontSize: isCompact ? 13 : 14 }}>{getStatusLabel()}</Text>
          {data.estimatedDeliveryTime && (
            <>
              <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontSize: subSize }}>•</Text>
              <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.85)', fontSize: subSize }}>
                Est: {new Date(data.estimatedDeliveryTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* ─── Map — shown only after driver picks up ─── */}
      {canShowMap ? (
        <View style={{ height: mapHeight }}>
          <OrderTrackingMap
            data={data}
            isLoading={isLoading}
          />
        </View>
      ) : (
        <View className="items-center justify-center px-6 py-10 bg-gray-50 border-b border-gray-100">
          <Feather name="truck" size={36} color="#B5122A" />
          <Text className="mt-3 text-base font-bold text-gray-800" style={{ fontSize: isCompact ? 15 : 16 }}>
            {['CONFIRMED', 'PREPARING'].includes(data.orderStatus) ? 'Restaurant is preparing your order' : 'Waiting for driver'}
          </Text>
          <Text className="mt-1 text-xs text-gray-500 text-center leading-5">
            Live map will appear once the driver picks up your order and heads your way.
          </Text>
        </View>
      )}

      {/* ─── Scrollable Bottom Section ─── */}
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="pt-4" style={{ paddingHorizontal: contentPad, paddingBottom: Math.max(insets.bottom + 16, 32) }}>
          {/* ─── ETA Display ─── */}
          {data.orderStatus !== 'DELIVERED' && data.orderStatus !== 'CANCELLED' && (
            <ETADisplay etaInfo={etaInfo} isCalculating={isCalculating} />
          )}

          {/* ─── Order Status Card ─── */}
          <OrderStatusCard
            status={data.orderStatus}
            deliveryAddress={data.deliveryAddress}
            totalAmount={data.totalAmount}
            createdAt={data.createdAt}
          />

          {/* ─── Progress Timeline ─── */}
          <OrderProgressTimeline
            currentStatus={data.orderStatus}
            estimatedDelivery={data.estimatedDeliveryTime ?? undefined}
          />

          {/* ─── Driver Info (if assigned) ─── */}
          {driverLocation && (
            <View className="p-4 mt-4 bg-white border border-gray-100 rounded-xl">
              <View className="flex-row items-center gap-3">
                <View className="items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Feather name="user" size={18} color="#E23744" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-black">Driver is on the way</Text>
                  <Text className="text-xs text-gray-400">
                    {driverLocation.isOnline ? 'Online' : 'Offline'} •
                    Updated {new Date(driverLocation.lastUpdatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View className={`w-2 h-2 rounded-full ${driverLocation.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              </View>
              {driverLocation.speed && (
                <Text className="mt-2 text-xs text-gray-400">
                  Speed: {Math.round(driverLocation.speed * 3.6)} km/h
                </Text>
              )}
            </View>
          )}

          {/* ─── Connection Status ─── */}
          <View className="flex-row items-center justify-center gap-2 mt-4">
            <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <Text className="text-[10px] text-gray-400">
              Live updates active
            </Text>
          </View>

          {/* ─── View Full Order Button ─── */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3 mt-4 bg-primary/10 rounded-xl"
            onPress={() => router.push(`/(customer)/order/${id}` as any)}
          >
            <Feather name="file-text" size={18} color="#E23744" />
            <Text className="font-semibold text-primary">View Full Order Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}