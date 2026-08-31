import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { User } from '@food_delivery/types';

interface DriverProfileHeaderProps {
  user: User;
  onEditPress: () => void;
  onImagePress: () => void;
  isUploading?: boolean;
}

export const DriverProfileHeader = ({
  user,
  onEditPress,
  onImagePress,
  isUploading,
}: DriverProfileHeaderProps) => {
  const hasImage = !!user.imageUrl;

  return (
    <View className="px-6 pt-12 pb-8 bg-primary">
      <View className="items-center">
        {/* Avatar */}
        <TouchableOpacity
          className="relative"
          onPress={onImagePress}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          <View className="items-center justify-center w-24 h-24 border-4 rounded-full bg-white/20 border-white/30">
            {hasImage ? (
              <Image source={{ uri: user.imageUrl! }} className="w-full h-full rounded-full" />
            ) : (
              <Text className="text-4xl font-bold text-white">
                {user.firstName?.charAt(0).toUpperCase()}
                {user.lastName?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border-2 border-primary">
            <Feather name="camera" size={16} color="#E23744" />
          </View>
          {isUploading && (
            <View className="absolute inset-0 items-center justify-center rounded-full bg-black/50">
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Name */}
        <Text className="mt-3 text-xl font-bold text-white">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-sm text-white/80 mt-0.5">{user.email}</Text>

        {/* Edit Button */}
        <TouchableOpacity
          className="flex-row items-center gap-2 px-5 py-2 mt-3 rounded-full bg-white/20"
          onPress={onEditPress}
        >
          <Feather name="edit-2" size={14} color="#FFF" />
          <Text className="text-sm font-medium text-white">Edit Profile</Text>
        </TouchableOpacity>

        {/* Status Badge */}
        <View className="flex-row items-center gap-2 mt-3">
          <View className="w-2 h-2 bg-green-400 rounded-full" />
          <Text className="text-xs font-medium text-white">Online</Text>
        </View>
      </View>
    </View>
  );
};