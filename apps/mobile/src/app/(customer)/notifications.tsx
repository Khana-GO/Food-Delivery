import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/owner/notification/useNotifications';
import { useMarkAsRead } from '@/hooks/owner/notification/useMarkAsRead';
import { useMarkAllAsRead } from '@/hooks/owner/notification/useMarkAllAsRead';
import { useDeleteNotification } from '@/hooks/owner/notification/useDeleteNotification';
import { NotificationItem } from '@/components/res-owner/notification/NotificationItem';
import { useNotificationStore } from '@/stores/owner/notificationStore';

export default function CustomerNotifications() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useNotifications({ page, limit: 20 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { notifications, unreadCount } = useNotificationStore();

  const loadMore = () => {
    if (data && page < data.totalPages) setPage(page + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFB' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' }}>
              <Feather name="arrow-left" size={18} color="#0F172A" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 }}>Notifications</Text>
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={() => markAllAsRead()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#FECACA' }}>
              <Feather name="check-circle" size={14} color="#B91C1C" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#B91C1C' }}>Mark all read</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={{ marginTop: 6, fontSize: 12, color: '#64748B', fontWeight: '500' }}>{unreadCount} unread • real-time</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={(n) => {
              if (n.data?.orderId) router.push(`/(customer)/order/${n.data.orderId}` as any);
            }}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-12">
              <Feather name="bell-off" size={64} color="#D1D5DB" />
              <Text className="mt-4 text-lg font-medium text-gray-400">No Notifications</Text>
              <Text className="mt-1 text-sm text-gray-400">You're all caught up!</Text>
            </View>
          ) : null
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
