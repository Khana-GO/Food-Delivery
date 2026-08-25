import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenHeader, EmptyState, ContentWidth, useResponsive } from '@/components/owner/kit';

type NotifType = 'order' | 'restaurant' | 'menu' | 'system';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotifType;
}

const TYPE_META: Record<
  NotifType,
  { icon: React.ComponentProps<typeof Feather>['name']; chip: string; color: string }
> = {
  order: { icon: 'shopping-bag', chip: 'bg-red-50', color: '#E23744' },
  restaurant: { icon: 'package', chip: 'bg-green-50', color: '#16A34A' },
  menu: { icon: 'book-open', chip: 'bg-slate-100', color: '#475569' },
  system: { icon: 'bell', chip: 'bg-amber-50', color: '#D97706' },
};

const INITIAL: Notification[] = [
  {
    id: '1',
    title: 'New Order #124',
    message: 'You have a new order from Anish Sharma. Tap to review and accept.',
    time: '2 min ago',
    read: false,
    type: 'order',
  },
  {
    id: '2',
    title: 'Restaurant Verified',
    message: 'Your restaurant “Spice Garden” has been verified and is now live.',
    time: '1 hr ago',
    read: false,
    type: 'restaurant',
  },
  {
    id: '3',
    title: 'Menu Item Approved',
    message: 'Your item “Chicken Momo” passed review and is visible to customers.',
    time: '3 hrs ago',
    read: true,
    type: 'menu',
  },
  {
    id: '4',
    title: 'Payment Received',
    message: 'Rs. 450 has been credited to your balance for Order #122.',
    time: '5 hrs ago',
    read: true,
    type: 'system',
  },
];

export default function NotificationsScreen() {
  const { isTablet } = useResponsive();
  const [items, setItems] = useState(INITIAL);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Notifications"
        back={false}
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        right={
          unread > 0 ? (
            <Pressable onPress={markAll} className="rounded-full border border-green-200 bg-green-50 px-3.5 py-2 active:bg-green-100">
              <Text className="text-xs font-bold text-green-700">Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, ...ContentWidth(isTablet ? 720 : 9999), paddingBottom: 24 }}
        ListEmptyComponent={
          <EmptyState icon="bell-off" title="No notifications" message="Order updates will show up here." />
        }
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <Pressable
              onPress={() => markRead(item.id)}
              className={`flex-row items-start rounded-2xl border p-4 active:opacity-90 ${
                item.read ? 'border-gray-100 bg-white' : 'border-green-200 bg-green-50/70'
              }`}
            >
              <View className={`h-11 w-11 items-center justify-center rounded-xl ${meta.chip}`}>
                <Feather name={meta.icon} size={18} color={meta.color} />
              </View>
              <View className="ml-3 flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className={`flex-1 pr-2 text-sm ${item.read ? 'font-semibold text-gray-700' : 'font-bold text-gray-900'}`}>
                    {item.title}
                  </Text>
                  {!item.read && <View className="h-2 w-2 rounded-full bg-primary" />}
                </View>
                <Text className={`mt-0.5 text-xs leading-4 ${item.read ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.message}
                </Text>
                <View className="mt-1.5 flex-row items-center gap-1">
                  <Feather name="clock" size={10} color="#94A3B8" />
                  <Text className="text-[11px] font-medium text-gray-400">{item.time}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
