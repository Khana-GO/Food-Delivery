import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/owner/notification/useNotifications';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';
import { useMarkAsRead } from '@/hooks/owner/notification/useMarkAsRead';
import { useMarkAllAsRead } from '@/hooks/owner/notification/useMarkAllAsRead';
import { useDeleteNotification } from '@/hooks/owner/notification/useDeleteNotification';
import { NotificationItem } from '@/components/res-owner/notification/NotificationItem';
import { useNotificationStore } from '@/stores/owner/notificationStore';

export default function AdminNotifications() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch, isFetching } = useNotifications({ page, limit: 20 });
  const { data: unreadData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { notifications } = useNotificationStore();
  const unreadCount = unreadData?.count ?? 0;

  const loadMore = () => {
    if (data && page < data.totalPages) setPage((p) => p + 1);
  };

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black text-[#0F172A]">Notifications</Text>
            <Text className="text-xs text-gray-500 mt-1">{unreadCount} unread • {notifications.length} total</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => markAllAsRead()} className="flex-row items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10">
              <Feather name="check-circle" size={14} color="#E23744" />
              <Text className="text-xs font-bold text-primary">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onMarkAsRead={markAsRead} onDelete={deleteNotification} onPress={() => {}} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={() => refetch()} tintColor="#E23744" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center">
              <Feather name="bell-off" size={32} color="#94A3B8" />
            </View>
            <Text className="mt-4 text-base font-black text-gray-700">No notifications</Text>
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
