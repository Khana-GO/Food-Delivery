import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Notification } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface DriverNotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeIconMap: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  order: 'shopping-bag',
  delivery: 'truck',
  payment: 'credit-card',
  system: 'bell',
};

const typeColorMap: Record<string, string> = {
  order: Colors.primary,
  delivery: '#2563EB',
  payment: '#16834B',
  system: '#8B5CF6',
};

const typeBgMap: Record<string, string> = {
  order: Colors.primaryBg,
  delivery: '#EFF6FF',
  payment: '#E8F8F0',
  system: '#F5F3FF',
};

export const DriverNotificationItem = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
}: DriverNotificationItemProps) => {
  const icon = typeIconMap[notification.type] || 'bell';
  const color = typeColorMap[notification.type] || Colors.primary;
  const bg = typeBgMap[notification.type] || Colors.primaryBg;

  const handlePress = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onPress) {
      onPress(notification);
    }
  };

  return (
    <View
      style={{
        backgroundColor: notification.isRead ? Colors.white : '#FFF7F7',
        marginBottom: 10,
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: notification.isRead ? Colors.borderLight : '#FECDD3',
        ...Shadow.sm,
        flexDirection: 'row',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}
    >
      {!notification.isRead && (
        <View style={{ width: 3, backgroundColor: Colors.primary, alignSelf: 'stretch' }} />
      )}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          padding: 14,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: `${color}18`,
          }}
        >
          <Feather name={icon} size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: notification.isRead ? '600' : '700',
                color: notification.isRead ? Colors.textSecondary : Colors.textDark,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary }} />
            )}
          </View>
          <Text
            style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 }}
            numberOfLines={2}
          >
            {notification.body}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Feather name="clock" size={11} color={Colors.textTertiary} />
            <Text style={{ fontSize: 11, color: Colors.textTertiary, fontWeight: '500' }}>
              {new Date(notification.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}{' '}
              •{' '}
              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {!notification.isRead && (
              <View
                style={{
                  marginLeft: 6,
                  backgroundColor: Colors.primaryBg,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: Radius.full,
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 }}>NEW</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(notification.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: Colors.backgroundAlt,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
            marginRight: 12,
            borderWidth: 1,
            borderColor: Colors.borderLight,
          }}
          activeOpacity={0.7}
        >
          <Feather name="x" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};
