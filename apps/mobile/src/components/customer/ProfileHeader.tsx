import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { User } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { ProfileActionsMenu } from '@/components/ui/ProfileActionsMenu';

interface Props {
  user: User;
  onEditPress: () => void;
  onImagePress: () => void;
  onDeleteImage?: () => void;
  isUploading?: boolean;
}

export const ProfileHeader = ({ user, onEditPress, onImagePress, onDeleteImage, isUploading }: Props) => {
  const hasImage = !!user.imageUrl;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 12 }]}>
      <View style={styles.inner}>
        {/* Avatar */}
        <TouchableOpacity onPress={onImagePress} disabled={!!isUploading} activeOpacity={0.85} style={styles.avatarTouch}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              {hasImage ? (
                <Image source={{ uri: user.imageUrl! }} style={styles.avatarImg} contentFit="cover" transition={200} cachePolicy="memory-disk" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7Rj~qofM{WB' }} />
              ) : (
                <Text style={styles.avatarInitials}>
                  {user.firstName?.charAt(0).toUpperCase()}
                  {user.lastName?.charAt(0).toUpperCase()}
                </Text>
              )}
              {isUploading ? (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.cameraBadge}>
            <Feather name="camera" size={14} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <Text style={styles.name} numberOfLines={1}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
        {user.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
      </View>

      <ProfileActionsMenu
        onEdit={onEditPress}
        onRemovePhoto={onDeleteImage}
        canRemovePhoto={hasImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.primary,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: Radius['3xl'],
    borderBottomRightRadius: Radius['3xl'],
  },
  inner: { alignItems: 'center' },
  avatarTouch: { position: 'relative' },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Shadow.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitials: { fontSize: 24, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  uploadOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  name: { fontSize: 17, fontWeight: '800', color: Colors.white, marginTop: 10, letterSpacing: -0.3 },
  email: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontWeight: '500' },
  phone: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1, fontWeight: '500' },
});
