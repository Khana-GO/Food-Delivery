import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  useUploadProfileImage,
  useDeleteProfileImage,
} from '@/hooks/user';
import { useDriverEarnings } from '@/hooks/driver/useDriverEarnings';
import { useDriverOrdersHistory } from '@/hooks/driver/useDriverOrdersHistory';
import { DriverProfileHeader } from '@/components/driver/DriverProfileHeader';
import { DriverStatsCard } from '@/components/driver/DriverStatsCard';
import { ProfileMenuItem } from '@/components/customer/ProfileMenuItem';
import * as ImagePicker from 'expo-image-picker';

export default function DriverProfile() {
  const { user, logout, isAuthenticating } = useAuth();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteProfileImage();
  const { data: earnings } = useDriverEarnings();
  const { data: history } = useDriverOrdersHistory();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleEditProfile = useCallback(() => {
    router.push('/(driver)/profile/edit' as any);
  }, []);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  }, [uploadImage]);

  const handleDeleteImage = useCallback(() => {
    Alert.alert('Remove Profile Image', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteImage() },
    ]);
  }, [deleteImage]);

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  }, [logout]);

  const menuItems = [
    { icon: 'truck' as const, label: 'My Deliveries', onPress: () => router.push('/(driver)/delivery-history' as any) },
    { icon: 'dollar-sign' as const, label: 'Earnings', onPress: () => router.push('/(driver)/(tabs)/earnings' as any) },
    { icon: 'bell' as const, label: 'Notifications', onPress: () => router.push('/(driver)/(tabs)/notifications' as any), badge: 3 },
    { icon: 'settings' as const, label: 'Settings', onPress: () => router.push('/(driver)/settings' as any) },
  ];

  if (!user) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <DriverProfileHeader
          user={user}
          onEditPress={handleEditProfile}
          onImagePress={handlePickImage}
          isUploading={isUploading || isDeleting}
        />

        <DriverStatsCard
          totalDeliveries={history?.length || 0}
          totalEarnings={earnings?.total || 0}
          rating={4.8}
          todayEarnings={earnings?.today || 0}
        />

        <View className="mx-4 mt-4 overflow-hidden bg-white border border-gray-100 rounded-2xl">
          {menuItems.map((item) => (
            <ProfileMenuItem key={item.label} {...item} />
          ))}
        </View>

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

        <Text className="mt-4 mb-6 text-xs text-center text-gray-400">KhanaGo Driver v1.0.0</Text>
      </ScrollView>

      {/* Logout Modal */}
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
                <TouchableOpacity className="flex-1 py-3 bg-gray-100 rounded-xl" onPress={() => setShowLogoutModal(false)}>
                  <Text className="font-semibold text-center text-black">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 py-3 bg-red-500 rounded-xl" onPress={handleLogout} disabled={isAuthenticating}>
                  {isAuthenticating ? <ActivityIndicator size="small" color="#FFF" /> : <Text className="font-semibold text-center text-white">Logout</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}