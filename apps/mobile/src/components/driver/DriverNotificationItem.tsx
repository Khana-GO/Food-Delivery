import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Notification } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface DriverNotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
}

const typeIconMap: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  order: 'shopping-bag',
  delivery: 'truck',
  payment: 'credit-card',
  system: 'bell',
};

const typeColorMap: Record<string, string> = {
  order: '#B5122A',
  delivery: '#2563EB',
  payment: '#16834B',
  system: '#8B5CF6',
};

export const DriverNotificationItem = ({
  notification,
  onPress,
  onMarkAsRead,
}: DriverNotificationItemProps) => {
  const icon = typeIconMap[notification.type] || 'bell';
  const color = typeColorMap[notification.type] || '#666666';

  const handlePress = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onPress) {
      onPress(notification);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        backgroundColor: notification.isRead ? Colors.white : Colors.primaryLight,
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: notification.isRead ? Colors.borderLight : Colors.primaryLight,
        ...Shadow.sm,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${color}15`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontWeight: notification.isRead ? '600' : '700', color: notification.isRead ? Colors.textSecondary : Colors.textDark, flex: 1 }} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.isRead && (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8 }} />
          )}
        </View>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 }} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 6 }}>
          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};