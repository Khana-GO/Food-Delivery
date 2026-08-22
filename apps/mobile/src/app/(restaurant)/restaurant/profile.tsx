import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  id: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  badge?: number;
}

export default function RestaurantOwnerProfile() {
  const { user, logout, isAuthenticating } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ─── Handlers ───
  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, [logout]);

  const menuItems: MenuItem[] = [
    {
      id: '1',
      icon: 'store',
      label: 'My Restaurants',
      onPress: () => router.push('/(restaurant)/restaurant/index' as any),
    },
    {
      id: '2',
      icon: 'shopping-bag',
      label: 'My Orders',
      onPress: () => router.push('/(restaurant)/orders/index'),
    },
    {
      id: '3',
      icon: 'menu',
      label: 'My Menu',
      onPress: () => router.push('/(restaurant)/menu/index'),
    },
    {
      id: '4',
      icon: 'dollar-sign',
      label: 'Earnings',
      onPress: () => router.push('/(restaurant)/earnings'),
    },
    {
      id: '5',
      icon: 'bar-chart-2',
      label: 'Analytics',
      onPress: () => router.push('/(restaurant)/analytics'),
    },
    {
      id: '6',
      icon: 'bell',
      label: 'Notifications',
      onPress: () => router.push('/(restaurant)/notifications'),
      badge: 3,
    },
    {
      id: '7',
      icon: 'settings',
      label: 'Settings',
      onPress: () => router.push('/(restaurant)/restaurant/settings' as any),
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-6 pt-12 pb-8 bg-primary">
          <View className="items-center">
            <View className="items-center justify-center w-24 h-24 border-4 rounded-full bg-white/20 border-white/30">
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} className="w-24 h-24 rounded-full" />
              ) : (
                <Text className="text-4xl font-bold text-white">
                  {user?.firstName?.charAt(0) || 'R'}
                  {user?.lastName?.charAt(0) || ''}
                </Text>
              )}
            </View>
            <Text className="mt-3 text-xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-sm text-white/80 mt-0.5">Restaurant Owner</Text>
            <Text className="text-sm text-white/60 mt-0.5">{user?.email}</Text>
            <TouchableOpacity
              className="flex-row items-center gap-2 px-5 py-2 mt-3 rounded-full bg-white/20"
              onPress={() => router.push('/(restaurant)/restaurant/settings' as any)}
            >
              <Feather name="edit-2" size={14} color="#FFF" />
              <Text className="text-sm font-medium text-white">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 px-4 -mt-4">
          <View className="flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
            <Text className="text-2xl font-bold text-black">5</Text>
            <Text className="text-xs text-gray-500">Restaurants</Text>
          </View>
          <View className="flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
            <Text className="text-2xl font-bold text-primary">4.8</Text>
            <Text className="text-xs text-gray-500">Avg Rating</Text>
          </View>
          <View className="flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
            <Text className="text-2xl font-bold text-green-500">Rs. 45.2K</Text>
            <Text className="text-xs text-gray-500">Total Earnings</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-4 mt-4 overflow-hidden bg-white border border-gray-100 rounded-2xl">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center px-4 py-3.5 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View className="items-center justify-center rounded-full w-9 h-9 bg-primary/10">
                <Feather name={item.icon} size={18} color="#E23744" />
              </View>
              <Text className="flex-1 ml-3 text-sm font-medium text-black">
                {item.label}
              </Text>
              {item.badge && (
                <View className="bg-primary px-2 py-0.5 rounded-full mr-2">
                  <Text className="text-xs font-bold text-white">{item.badge}</Text>
                </View>
              )}
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="py-4 mx-4 mt-4 border border-red-200 bg-red-50 rounded-xl"
          onPress={() => setShowLogoutModal(true)}
          disabled={isAuthenticating}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Feather name="log-out" size={20} color="#EF4444" />
            <Text className="text-base font-semibold text-red-500">
              {isAuthenticating ? 'Logging out...' : 'Logout'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text className="mt-4 mb-6 text-xs text-center text-gray-400">Version 1.0.0</Text>
      </ScrollView>

      {/* ─── Logout Modal ─── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/50" onPress={() => setShowLogoutModal(false)}>
          <View className="items-center justify-center flex-1 px-6">
            <View className="w-full max-w-sm p-6 bg-white rounded-2xl">
              <View className="items-center mb-4">
                <View className="items-center justify-center w-16 h-16 rounded-full bg-red-50">
                  <Feather name="log-out" size={32} color="#EF4444" />
                </View>
              </View>
              <Text className="text-xl font-bold text-center text-black">Logout</Text>
              <Text className="mt-2 text-center text-gray-500">
                Are you sure you want to logout?
              </Text>
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-3 bg-gray-100 rounded-xl"
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text className="font-semibold text-center text-black">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 bg-red-500 rounded-xl"
                  onPress={handleLogout}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="font-semibold text-center text-white">Logout</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}