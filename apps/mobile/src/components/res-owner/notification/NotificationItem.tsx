import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Notification } from '@food_delivery/types';

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeIconMap: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  order: 'shopping-bag',
  restaurant: 'store',
  profile: 'user',
  system: 'bell',
};

const typeColorMap: Record<string, string> = {
  order: '#E23744',
  restaurant: '#16A34A',
  profile: '#8B5CF6',
  system: '#F59E0B',
};

export const NotificationItem = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) => {
  const icon = typeIconMap[notification.type] || 'bell';
  const color = typeColorMap[notification.type] || '#94A3B8';

  const handlePress = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onPress) {
      onPress(notification);
    }
  };

  return (
    <Pressable
      className={`px-4 py-3.5 border-b border-gray-50 ${!notification.isRead ? 'bg-primary/5' : ''}`}
      onPress={handlePress}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="items-center justify-center w-10 h-10 rounded-full"
          style={{ backgroundColor: `${color}15` }}
        >
          <Feather name={icon} size={18} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`text-sm font-semibold ${!notification.isRead ? 'text-black' : 'text-gray-600'}`}>
              {notification.title}
            </Text>
            <View className="flex-row items-center gap-2">
              {!notification.isRead && (
                <View className="w-2 h-2 rounded-full bg-primary" />
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(notification.id)}
                  className="p-1"
                >
                  <Feather name="x" size={14} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text className={`text-xs ${!notification.isRead ? 'text-gray-600' : 'text-gray-400'} mt-0.5`}>
            {notification.body}
          </Text>
          <Text className="mt-1 text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};