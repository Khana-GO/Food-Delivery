import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/owner/notification/useNotifications';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';
import { useMarkAsRead } from '@/hooks/owner/notification/useMarkAsRead';
import { useMarkAllAsRead } from '@/hooks/owner/notification/useMarkAllAsRead';
import { useDeleteNotification } from '@/hooks/owner/notification/useDeleteNotification';
import { NotificationItem } from '@/components/res-owner/notification/NotificationItem';
import { useNotificationStore } from '@/stores/owner/notificationStore';

export default function NotificationsScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useNotifications({ page, limit: 20 });
  const { data: unreadData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { notifications, unreadCount } = useNotificationStore();

  const loadMore = () => {
    if (data && page < data.totalPages) {
      setPage(page + 1);
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
        <Text className="mt-1 text-sm text-gray-500">
          {unreadCount} unread
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={(notification) => {
              // Navigate based on notification data
              if (notification.data?.orderId) {
                router.push(`/(restaurant-owner)/orders/${notification.data.orderId}` as any);
              }
            }}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Feather name="bell-off" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Notifications</Text>
            <Text className="mt-1 text-sm text-gray-400">You're all caught up!</Text>
          </View>
        }
        ListFooterComponent={
          isLoading && notifications.length > 0 ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#E23744" />
            </View>
          ) : null
        }
      />
    </View>
  );
}