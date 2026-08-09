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
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
  color?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function DriverProfile() {
  const { user, logout, isAuthenticating } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

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

  const handleEditProfile = useCallback(() => {
    router.push('/(driver)/settings' as any);
  }, []);

  const handleDeliveryHistory = useCallback(() => {
    router.push('/(driver)/delivery-history' as any);
  }, []);

  const handleEarnings = useCallback(() => {
    router.push('/(driver)/(tabs)/earnings' as any);
  }, []);

  const handleNotifications = useCallback(() => {
    router.push('/(driver)/notifications' as any);
  }, []);

  const handleActiveDelivery = useCallback(() => {
    router.push('/(driver)/(tabs)/active' as any);
  }, []);

  const handleVehicleDetails = useCallback(() => {
    Alert.alert('Coming Soon', 'Vehicle details will be available soon.');
  }, []);

  // ─── Menu Items ───
  const menuItems: MenuItem[] = [
    {
      id: '1',
      icon: 'truck',
      label: 'Active Delivery',
      onPress: handleActiveDelivery,
    },
    {
      id: '2',
      icon: 'clock',
      label: 'Delivery History',
      onPress: handleDeliveryHistory,
      badge: 12,
    },
    {
      id: '3',
      icon: 'dollar-sign',
      label: 'My Earnings',
      onPress: handleEarnings,
    },
    {
      id: '4',
      icon: 'bell',
      label: 'Notifications',
      onPress: handleNotifications,
      badge: 3,
    },
    {
      id: '5',
      icon: 'car',
      label: 'Vehicle Details',
      onPress: handleVehicleDetails,
    },
    {
      id: '6',
      icon: 'settings',
      label: 'Settings',
      onPress: handleEditProfile,
    },
  ];

  // ─── Render ───
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-primary px-6 pt-12 pb-8">
          <View className="items-center">
            {/* Avatar */}
            <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white/30">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Text className="text-4xl font-bold text-white">
                  {user?.firstName?.charAt(0) || 'D'}
                  {user?.lastName?.charAt(0) || ''}
                </Text>
              )}
            </View>

            {/* Name & Email */}
            <Text className="text-xl font-bold text-white mt-3">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-sm text-white/80 mt-0.5">{user?.email}</Text>

            {/* Status Badges */}
            <View className="flex-row items-center gap-3 mt-3">
              <View className="flex-row items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                <View className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                <Text className="text-white text-xs font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                <View className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-gray-400'}`} />
                <Text className="text-white text-xs font-medium">
                  {isAvailable ? 'Available' : 'Busy'}
                </Text>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-white/20 px-5 py-2 rounded-full mt-3"
              onPress={handleEditProfile}
            >
              <Feather name="edit-2" size={14} color="#FFF" />
              <Text className="text-white text-sm font-medium">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row px-4 -mt-4 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-black">47</Text>
            <Text className="text-xs text-gray-500">Total Deliveries</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-primary">4.9</Text>
            <Text className="text-xs text-gray-500">Rating</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-green-500">Rs. 12.4K</Text>
            <Text className="text-xs text-gray-500">Total Earnings</Text>
          </View>
        </View>

        {/* Status Toggle Section */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-sm font-bold text-black mb-3">Status Settings</Text>
          <View className="flex-row items-center justify-between py-2 border-b border-gray-50">
            <View>
              <Text className="text-sm text-black font-medium">Online Status</Text>
              <Text className="text-xs text-gray-500">Show yourself available for deliveries</Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={isOnline ? '#FFF' : '#F3F4F6'}
            />
          </View>
          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="text-sm text-black font-medium">Accepting Orders</Text>
              <Text className="text-xs text-gray-500">Receive new delivery requests</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={isAvailable ? '#FFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-2xl mx-4 mt-4 border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center px-4 py-3.5 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Feather name={item.icon} size={18} color="#E23744" />
              </View>
              <Text className="flex-1 ml-3 text-sm font-medium text-black">
                {item.label}
              </Text>
              {item.badge && (
                <View className="bg-primary px-2 py-0.5 rounded-full mr-2">
                  <Text className="text-white text-xs font-bold">{item.badge}</Text>
                </View>
              )}
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="mx-4 mt-4 bg-red-50 py-4 rounded-xl border border-red-200"
          onPress={() => setShowLogoutModal(true)}
          disabled={isAuthenticating}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Feather name="log-out" size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold text-base">
              {isAuthenticating ? 'Logging out...' : 'Logout'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* App Version */}
        <Text className="text-center text-xs text-gray-400 mt-4 mb-6">Version 1.0.0</Text>
      </ScrollView>

      {/* ─── Logout Confirmation Modal ─── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowLogoutModal(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-white rounded-2xl w-full max-w-sm p-6">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
                  <Feather name="log-out" size={32} color="#EF4444" />
                </View>
              </View>
              <Text className="text-xl font-bold text-black text-center">Logout</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to logout?
              </Text>
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-gray-100"
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text className="text-black font-semibold text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-red-500"
                  onPress={handleLogout}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="text-white font-semibold text-center">Logout</Text>
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