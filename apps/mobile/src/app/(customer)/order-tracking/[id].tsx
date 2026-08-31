import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useOrderTracking } from '@/hooks/tracking/useOrderTracking';
import { useAuth } from '@/contexts/AuthContext';
import { OrderTrackingMap } from '@/components/map/OrderTrackingMap';

const STATUS_STEPS: Array<{ key: string; label: string; icon: any }> = [
  { key: 'PENDING', label: 'Order Placed', icon: 'clock' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: 'check-circle' },
  { key: 'PREPARING', label: 'Preparing', icon: 'coffee' },
  { key: 'READY', label: 'Ready', icon: 'package' },
  { key: 'PICKED_UP', label: 'On the way', icon: 'truck' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'home' },
];

function getStatusMeta(status?: string) {
  const map: Record<string, { color: string; label: string; icon: string }> = {
    PENDING: { color: '#F59E0B', label: 'Order Placed', icon: 'clock' },
    CONFIRMED: { color: '#2563EB', label: 'Confirmed', icon: 'check-circle' },
    PREPARING: { color: '#8B5CF6', label: 'Preparing', icon: 'coffee' },
    READY: { color: '#0E9F6E', label: 'Ready for pickup', icon: 'package' },
    PICKED_UP: { color: '#E23744', label: 'Out for delivery', icon: 'truck' },
    DELIVERED: { color: '#22C55E', label: 'Delivered', icon: 'check' },
    CANCELLED: { color: '#EF4444', label: 'Cancelled', icon: 'x-circle' },
  };
  return map[status || 'PENDING'] || { color: '#94A3B8', label: status || 'Unknown', icon: 'clock' };
}

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();

  const { data, isLoading, isPolling, error, fetchTrackingData, connectWebSocket } = useOrderTracking({
    orderId: id,
    autoFetch: true,
    pollingInterval: 15000,
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) connectWebSocket(user.id);
  }, [user?.id, connectWebSocket]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTrackingData();
    setRefreshing(false);
  };

  const statusMeta = getStatusMeta(data?.orderStatus);
  const stepIndex = useMemo(() => {
    const idx = STATUS_STEPS.findIndex((s) => s.key === data?.orderStatus);
    return idx === -1 ? (data?.orderStatus === 'CANCELLED' ? -1 : 0) : idx;
  }, [data?.orderStatus]);

  if (!id) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <Text className="text-gray-500">Missing order ID</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-6 py-3 mt-4 bg-black rounded-xl">
          <Text className="font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-black">Track Order</Text>
              <Text className="text-xs text-gray-500">Order #{id.slice(0, 8)} {isPolling ? '• syncing' : ''}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRefresh} className="p-2">
            <Feather name="refresh-cw" size={20} color={refreshing ? '#E23744' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2 mt-3">
          <Feather name={statusMeta.icon as any} size={16} color={statusMeta.color} />
          <Text className="text-sm font-semibold" style={{ color: statusMeta.color }}>
            {statusMeta.label}
          </Text>
          {data?.estimatedDeliveryTime && data.orderStatus !== 'DELIVERED' && data.orderStatus !== 'CANCELLED' && (
            <>
              <Text className="text-xs text-gray-300">•</Text>
              <Text className="text-xs text-gray-500">
                ETA {new Date(data.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {data.estimatedDuration ? ` (${Math.round(data.estimatedDuration / 60)} min)` : ''}
              </Text>
            </>
          )}
        </View>

        {/* Timeline */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 8, paddingRight: 12 }}>
          {STATUS_STEPS.map((s, idx) => {
            const isDone = stepIndex >= idx && stepIndex !== -1;
            const isCurrent = stepIndex === idx;
            const isCancelled = data?.orderStatus === 'CANCELLED';
            return (
              <View
                key={s.key}
                className={`px-3 py-2 rounded-full border ${isDone ? 'border-transparent' : 'border-gray-200'} flex-row items-center gap-1.5`}
                style={{ backgroundColor: isDone ? (isCurrent ? statusMeta.color : '#111') : '#F8F9FB' }}
              >
                <Feather name={s.icon as any} size={14} color={isDone ? '#FFF' : '#94A3B8'} />
                <Text className={`text-xs font-semibold ${isDone ? 'text-white' : 'text-gray-500'}`}>{s.label}</Text>
              </View>
            );
          })}
          {data?.orderStatus === 'CANCELLED' && (
            <View className="px-3 py-2 rounded-full bg-red-500 flex-row items-center gap-1.5">
              <Feather name="x-circle" size={14} color="#FFF" />
              <Text className="text-xs font-semibold text-white">Cancelled</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Map */}
      <View className="flex-1">
        {isLoading && !data ? (
          <View className="items-center justify-center flex-1 bg-gray-50">
            <ActivityIndicator size="large" color="#E23744" />
            <Text className="mt-4 text-sm text-gray-500">Loading tracking data...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center flex-1 px-6 bg-gray-50">
            <Feather name="alert-circle" size={48} color="#EF4444" />
            <Text className="mt-4 text-lg font-medium text-red-500">Something went wrong</Text>
            <Text className="mt-2 text-sm text-center text-gray-500">{error}</Text>
            <TouchableOpacity className="px-6 py-3 mt-6 bg-black rounded-xl" onPress={handleRefresh}>
              <Text className="font-semibold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <OrderTrackingMap data={data} isLoading={isLoading} />
        )}
      </View>

      {/* Bottom */}
      {data && (
        <View className="px-4 py-3 bg-white border-t border-gray-100" style={{ paddingBottom: 18 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xs text-gray-500">Delivery to</Text>
              <Text className="text-sm font-medium text-black" numberOfLines={1}>
                {data.delivery.address || 'Customer address'}
              </Text>
              <Text className="mt-1 text-xs text-gray-400">
                {data.restaurant.name ? `${data.restaurant.name} • ` : ''}
                {data.route ? `${(data.route.distance / 1000).toFixed(1)} km away` : ''}
              </Text>
            </View>
            {data.orderStatus !== 'DELIVERED' && data.orderStatus !== 'CANCELLED' && (
              <View className="items-end">
                <Text className="text-xs text-gray-500">Live</Text>
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-green-500" style={{ opacity: isPolling ? 0.5 : 1 }} />
                  <Text className="text-xs font-bold text-green-600">Tracking</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
