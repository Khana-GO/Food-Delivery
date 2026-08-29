import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileEditForm } from '@/components/res-owner/profile/ProfileEditForm';
import { useUpdateProfile } from '@/hooks/owner/user/useUpdateProfile';

export default function AdminEditProfileScreen() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  if (!user) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Edit Profile</Text>
        </View>
      </View>

      <ProfileEditForm user={user} onSubmit={updateProfile} isLoading={isPending} />
    </View>
  );
}
