import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/owner/notification/useNotifications';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';
import { useMarkAsRead } from '@/hooks/owner/notification/useMarkAsRead';
import { useMarkAllAsRead } from '@/hooks/owner/notification/useMarkAllAsRead';
import { useDeleteNotification } from '@/hooks/owner/notification/useDeleteNotification';
import { DriverNotificationItem } from '@/components/driver/DriverNotificationItem';
import { useNotificationStore } from '@/stores/owner/notificationStore';
import { notificationService } from '@/services/owner/notification/notification.service';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function AdminNotifications() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch, isFetching } = useNotifications({ page, limit: 20 });
  const { data: unreadData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { notifications, clearAll } = useNotificationStore();
  const unreadCount = unreadData?.count ?? 0;

  const loadMore = () => {
    if (data && page < data.totalPages) setPage((p) => p + 1);
  };

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Remove notification?', 'This will permanently delete the notification.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteNotification(id) },
    ]);
  }, [deleteNotification]);

  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) return;
    Alert.alert('Delete all notifications?', 'This will permanently delete all notifications.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationService.deleteAll();
            clearAll();
            refetch();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to delete notifications');
          }
        },
      },
    ]);
  }, [notifications.length, clearAll, refetch]);

  const handleMarkAll = useCallback(() => {
    if (unreadCount === 0) return;
    markAllAsRead();
  }, [markAllAsRead, unreadCount]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Ultra-compact crimson header 36/12 */}
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: 52,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              <Feather name="bell" size={14} color={Colors.white} />
            </View>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 }}>Notifications</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: unreadCount > 0 ? '#4ADE80' : 'rgba(255,255,255,0.5)' }} />
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} • {notifications.length} total
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={16} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {notifications.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={handleMarkAll}
              disabled={unreadCount === 0 || markingAll}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 11,
                borderRadius: Radius.full,
                backgroundColor: unreadCount > 0 ? Colors.white : 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: unreadCount > 0 ? Colors.white : 'rgba(255,255,255,0.25)',
                opacity: unreadCount === 0 ? 0.6 : 1,
              }}
              activeOpacity={0.8}
            >
              <Feather name="check-circle" size={16} color={unreadCount > 0 ? Colors.primary : Colors.white} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: unreadCount > 0 ? Colors.primary : Colors.white }}>
                {markingAll ? 'Marking…' : 'Mark all as read'}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                paddingHorizontal: 14,
                paddingVertical: 11,
                borderRadius: Radius.full,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>Live</Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <DriverNotificationItem notification={item} onMarkAsRead={markAsRead} onDelete={handleDelete} onPress={() => {}} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={() => refetch()} tintColor={Colors.primary} colors={[Colors.primary]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={{ paddingVertical: 56, alignItems: 'center', paddingHorizontal: 32 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: Colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: Colors.borderLight,
                ...Shadow.sm,
              }}
            >
              <Feather name="bell-off" size={32} color={Colors.textMuted} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textDark }}>No Notifications</Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
              You're all caught up! New alerts will appear here in real time.
            </Text>
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: Colors.primaryBg,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: Radius.full,
                borderWidth: 1,
                borderColor: '#FECDD3',
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>Real-time updates active</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          isLoading && notifications.length > 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
