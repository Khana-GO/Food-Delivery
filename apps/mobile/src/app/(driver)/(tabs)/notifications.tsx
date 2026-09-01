import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDriverNotifications } from '@/hooks/driver/useDriverNotifications';
import { useDriverMarkAsRead } from '@/hooks/driver/useDriverMarkAsRead';
import { useDriverMarkAllAsRead } from '@/hooks/driver/useDriverMarkAllAsRead';
import { useDriverDeleteNotification, useDriverDeleteAllNotifications } from '@/hooks/driver/useDriverDeleteNotification';
import { DriverNotificationItem } from '@/components/driver/DriverNotificationItem';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function DriverNotificationsScreen() {
  const { isLoading, refetch } = useDriverNotifications();
  const { mutate: markAsRead } = useDriverMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useDriverMarkAllAsRead();
  const { mutate: deleteNotification } = useDriverDeleteNotification();
  const { mutate: deleteAll } = useDriverDeleteAllNotifications();
  const { notifications, unreadCount } = useDriverNotificationStore();

  const handlePress = useCallback((notification: any) => {
    if (notification.data?.orderId) {
      router.push(`/(driver)/delivery/${notification.data.orderId}` as any);
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Remove notification?', 'This will permanently delete the notification.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteNotification(id) },
    ]);
  }, [deleteNotification]);

  const handleMarkAll = useCallback(() => {
    if (unreadCount === 0) return;
    markAllAsRead();
  }, [markAllAsRead, unreadCount]);

  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) return;
    Alert.alert('Clear all?', 'Permanently delete all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => deleteAll() },
    ]);
  }, [deleteAll, notifications.length]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Premium crimson header */}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
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
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 }}>Notifications</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
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
                  width: 40,
                  height: 40,
                  borderRadius: 20,
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

        {/* Action row */}
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
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>Live</Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <DriverNotificationItem
            notification={item}
            onPress={handlePress}
            onMarkAsRead={markAsRead}
            onDelete={handleDelete}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
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
              You're all caught up! New orders and updates will appear here in real time.
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
