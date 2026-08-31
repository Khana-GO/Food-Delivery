import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDriverNotifications } from '@/hooks/driver/useDriverNotifications';
import { useMarkAsRead } from '@/hooks/owner/notification/useMarkAsRead';
import { useMarkAllAsRead } from '@/hooks/owner/notification/useMarkAllAsRead';
import { DriverNotificationItem } from '@/components/driver/DriverNotificationItem';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';

export default function DriverNotificationsScreen() {
  const { isLoading, refetch } = useDriverNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { notifications, unreadCount } = useDriverNotificationStore();

  const handlePress = (notification: any) => {
    // Navigate based on notification data
    if (notification.data?.orderId) {
      router.push(`/(driver)/delivery/${notification.data.orderId}` as any);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Notifications</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => markAllAsRead()} className="flex-row items-center gap-1">
              <Feather name="check-circle" size={16} color="#E23744" />
              <Text className="text-sm font-semibold text-primary">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="mt-1 text-sm text-gray-500">{unreadCount} unread</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <DriverNotificationItem
            notification={item}
            onPress={handlePress}
            onMarkAsRead={markAsRead}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Feather name="bell-off" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Notifications</Text>
            <Text className="mt-1 text-sm text-gray-400">You're all caught up!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}