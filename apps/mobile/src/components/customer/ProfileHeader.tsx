import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { User } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface Props {
  user: User;
  onEditPress: () => void;
  onImagePress: () => void;
  onDeleteImage?: () => void;
  isUploading?: boolean;
}

export const ProfileHeader = ({ user, onEditPress, onImagePress, onDeleteImage, isUploading }: Props) => {
  const hasImage = !!user.imageUrl;
  return (
    <View style={styles.wrap}>
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

        <View style={styles.actions}>
          <TouchableOpacity onPress={onEditPress} activeOpacity={0.85} style={styles.editBtn}>
            <Feather name="edit-2" size={13} color={Colors.primary} />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
          {hasImage && onDeleteImage ? (
            <TouchableOpacity onPress={onDeleteImage} activeOpacity={0.85} style={styles.removeBtn}>
              <Feather name="trash-2" size={13} color="#EF4444" />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  inner: { alignItems: 'center' },
  avatarTouch: { position: 'relative' },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    ...Shadow.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  uploadOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  name: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginTop: 14, letterSpacing: -0.3 },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  phone: { fontSize: 12, color: Colors.textTertiary, marginTop: 2, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  editText: { fontSize: 12, fontWeight: '700', color: Colors.primary, letterSpacing: 0.2 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removeText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
});
