import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDriverNotifications } from '@/hooks/driver/useDriverNotifications';
import { useMarkAsRead } from '@/hooks/owner/notification/useMarkAsRead';
import { useMarkAllAsRead } from '@/hooks/owner/notification/useMarkAllAsRead';
import { DriverNotificationItem } from '@/components/driver/DriverNotificationItem';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

export default function DriverNotificationsScreen() {
  const { isLoading, refetch } = useDriverNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { notifications, unreadCount } = useDriverNotificationStore();

  const handlePress = (notification: any) => {
    if (notification.data?.orderId) {
      router.push(`/(driver)/delivery/${notification.data.orderId}` as any);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: Colors.white, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, borderRadius: Radius.full, backgroundColor: Colors.backgroundAlt }}>
              <Feather name="arrow-left" size={22} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={{ ...Typography.titleLarge, color: Colors.textDark }}>Notifications</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => markAllAsRead()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.primaryLight }}>
              <Feather name="check-circle" size={16} color={Colors.primary} />
              <Text style={{ ...Typography.labelMedium, color: Colors.primary }}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ ...Typography.bodySmall, color: Colors.textTertiary, marginTop: 8 }}>{unreadCount} unread of {notifications.length} total</Text>
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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={{ paddingVertical: 60, alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Feather name="bell-off" size={32} color={Colors.primary} />
            </View>
            <Text style={{ ...Typography.titleMedium, color: Colors.textTertiary }}>No Notifications</Text>
            <Text style={{ ...Typography.bodyMedium, color: Colors.textMuted, marginTop: 4, textAlign: 'center' }}>You're all caught up! New notifications will appear here.</Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      />
    </View>
  );
}