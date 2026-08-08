import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const { user, logout } = useAuth();

  // ─── State ───
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || 'Admin',
    lastName: user?.lastName || 'User',
    email: user?.email || 'admin@example.com',
    phone: '+1 (555) 123-4567',
  });

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    restaurantApprovals: true,
    driverVerifications: true,
    systemUpdates: false,
  });

  // ─── Handlers ───
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  // ─── Render ───
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Settings</Text>
          </View>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              isEditing ? 'bg-primary' : 'bg-gray-100'
            }`}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isLoading}
          >
            <Text className={isEditing ? 'text-white font-semibold' : 'text-black font-semibold'}>
              {isEditing ? (isLoading ? 'Saving...' : 'Save') : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
          <Text className="text-sm font-bold text-black mb-4">Admin Profile</Text>

          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
              <Text className="text-2xl font-bold text-white">
                {form.firstName.charAt(0)}{form.lastName.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-black">
                {form.firstName} {form.lastName}
              </Text>
              <Text className="text-sm text-gray-500">Administrator</Text>
            </View>
            <TouchableOpacity>
              <Feather name="camera" size={20} color="#E23744" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            <View>
              <Text className="text-xs text-gray-500 mb-1">First Name</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-200 rounded-lg px-3 py-2 text-base text-black bg-white"
                  value={form.firstName}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, firstName: text }))}
                />
              ) : (
                <Text className="text-base text-black">{form.firstName}</Text>
              )}
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Last Name</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-200 rounded-lg px-3 py-2 text-base text-black bg-white"
                  value={form.lastName}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, lastName: text }))}
                />
              ) : (
                <Text className="text-base text-black">{form.lastName}</Text>
              )}
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Email</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-200 rounded-lg px-3 py-2 text-base text-black bg-white"
                  value={form.email}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text className="text-base text-black">{form.email}</Text>
              )}
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Phone</Text>
              {isEditing ? (
                <TextInput
                  className="border border-gray-200 rounded-lg px-3 py-2 text-base text-black bg-white"
                  value={form.phone}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="text-base text-black">{form.phone}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Notification Preferences */}
        <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
          <Text className="text-sm font-bold text-black mb-4">Notification Preferences</Text>

          <View className="flex-row items-center justify-between py-2 border-b border-gray-50">
            <View>
              <Text className="text-sm text-black font-medium">Order Alerts</Text>
              <Text className="text-xs text-gray-500">New order notifications</Text>
            </View>
            <Switch
              value={notifications.orderAlerts}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, orderAlerts: value }))
              }
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={notifications.orderAlerts ? '#FFF' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-gray-50">
            <View>
              <Text className="text-sm text-black font-medium">Restaurant Approvals</Text>
              <Text className="text-xs text-gray-500">New restaurant registration alerts</Text>
            </View>
            <Switch
              value={notifications.restaurantApprovals}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, restaurantApprovals: value }))
              }
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={notifications.restaurantApprovals ? '#FFF' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-gray-50">
            <View>
              <Text className="text-sm text-black font-medium">Driver Verifications</Text>
              <Text className="text-xs text-gray-500">Driver verification requests</Text>
            </View>
            <Switch
              value={notifications.driverVerifications}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, driverVerifications: value }))
              }
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={notifications.driverVerifications ? '#FFF' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="text-sm text-black font-medium">System Updates</Text>
              <Text className="text-xs text-gray-500">Platform maintenance & updates</Text>
            </View>
            <Switch
              value={notifications.systemUpdates}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, systemUpdates: value }))
              }
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={notifications.systemUpdates ? '#FFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
          <Text className="text-sm font-bold text-black mb-4">Quick Actions</Text>

          <TouchableOpacity className="flex-row items-center gap-3 py-3 border-b border-gray-50">
            <Feather name="lock" size={20} color="#94A3B8" />
            <Text className="text-sm text-black">Change Password</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" className="ml-auto" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-3 py-3 border-b border-gray-50">
            <Feather name="bell" size={20} color="#94A3B8" />
            <Text className="text-sm text-black">Notification Settings</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" className="ml-auto" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-3 py-3">
            <Feather name="shield" size={20} color="#94A3B8" />
            <Text className="text-sm text-black">Privacy & Security</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" className="ml-auto" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-50 py-4 rounded-xl mt-6 mb-8 border border-red-200"
          onPress={handleLogout}
        >
          <Text className="text-red-500 text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}