import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useNotifications, useMarkNotificationRead, useDeleteNotification } from '@/api/notifications';

const TABS = ['All', 'Orders', 'Offers', 'System'];

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const { data: notifications = [], isLoading, isError, refetch, isFetching } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const handleMarkAllRead = () => {
    notifications.forEach((n: any) => {
      if (!n.isRead) markAsRead(n.id);
    });
  };

  const filtered = activeTab === 'All' 
    ? notifications 
    : notifications.filter((n: any) => n.type === activeTab.toLowerCase() || (activeTab === 'Orders' && n.type === 'order'));

  const getEmoji = (type: string) => {
    switch (type) {
      case 'order': return '🥡';
      case 'promotion':
      case 'offer': return '🏷️';
      case 'payment': return '💳';
      case 'system':
      default: return '🔔';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-orange-100';
      case 'promotion':
      case 'offer': return 'bg-amber-100';
      case 'payment': return 'bg-red-100';
      case 'system':
      default: return 'bg-slate-100';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-extrabold text-slate-800">Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text className="text-primary text-sm font-bold">Mark all read</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 pb-3 border-b border-slate-200">
        <View className="flex-row bg-slate-50 rounded-lg p-1 border border-slate-200">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 items-center py-2 rounded-md ${activeTab === tab ? 'bg-primary' : 'bg-transparent'}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-10">
        <TouchableOpacity 
          className="flex-row items-center justify-center bg-white rounded-full py-2.5 mb-4 border border-slate-200 border-dashed gap-2"
          onPress={() => refetch()}
        >
          <Text className="text-sm">🔄</Text>
          <Text className="text-sm font-medium text-slate-500">{isFetching ? 'Refreshing...' : 'Pull to refresh'}</Text>
        </TouchableOpacity>

        {isError && (
          <Text className="text-red-500 text-center font-bold mb-4">Failed to load notifications.</Text>
        )}

        {filtered.map((item: any) => (
          <TouchableOpacity 
            key={item.id} 
            className={`flex-row bg-white rounded-2xl p-4 mb-3 shadow-sm border ${!item.isRead ? 'border-primary/20 bg-orange-50/30' : 'border-slate-100'}`}
            onPress={() => !item.isRead && markAsRead(item.id)}
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${getBgColor(item.type)}`}>
              <Text className="text-2xl">{getEmoji(item.type)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-800 mb-1">{item.title}</Text>
              <Text className="text-xs text-slate-500 leading-5 mb-2">{item.message}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-[10px] text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <TouchableOpacity onPress={() => deleteNotification(item.id)} className="bg-slate-100 px-2 py-1 rounded">
                  <Text className="text-[10px] text-red-500 font-bold">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {!item.isRead && <View className="w-2 h-2 rounded-full bg-primary absolute top-4 right-4" />}
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && !isError && (
          <View className="items-center p-8 mt-5 bg-white rounded-2xl border border-slate-200 border-dashed">
            <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-4">
              <Text className="text-3xl">🔕</Text>
            </View>
            <Text className="text-base font-bold text-slate-800 mb-2">You're all caught up!</Text>
            <Text className="text-xs text-slate-500 text-center leading-5">
              No new notifications right now. Check back later for order updates, offers, and alerts.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
