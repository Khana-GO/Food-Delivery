import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { User } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

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
    <View style={{ backgroundColor: Colors.primary }}>
      <View style={{ paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={onImagePress}
            disabled={isUploading}
            activeOpacity={0.7}
            style={{ position: 'relative' }}
          >
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.3)',
              ...Shadow.lg,
            }}>
              {hasImage ? (
                <Image source={{ uri: user.imageUrl! }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
              ) : (
                <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.white }}>
                  {user.firstName?.charAt(0).toUpperCase()}
                  {user.lastName?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 8,
              borderWidth: 2,
              borderColor: Colors.primary,
            }}>
              <Feather name="camera" size={14} color={Colors.primary} />
            </View>
            {isUploading && (
              <View style={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 40,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, marginTop: 12 }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{user.email}</Text>

          <TouchableOpacity
            onPress={onEditPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: Radius.full,
              backgroundColor: 'rgba(255,255,255,0.2)',
              marginTop: 14,
            }}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={14} color={Colors.white} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.white }}>Edit Profile</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Online</Text>
          </View>
        </View>
      </View>
    </View>
  );
};