import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from '@/components/res-owner/owner/kit';
import * as ImagePicker from 'expo-image-picker';
import { useUploadProfileImage } from '@/hooks/owner/user/useUploadProfileImage';
import { useDeleteProfileImage } from '@/hooks/owner/user/useDeleteProfileImage';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function AdminProfile() {
  const { user, logout, isAuthenticating } = useAuth();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteProfileImage();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = useCallback(async () => {
    setShowLogout(false);
    try {
      await logout();
      router.replace('/auth/login');
    } catch {
      Alert.alert('Error', 'Failed to logout.');
    }
  }, [logout]);

  const handlePickImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.95,
      exif: false,
    });
    if (!result.canceled) uploadImage(result.assets[0] as any);
  }, [uploadImage]);

  const handleDeleteImage = useCallback(() => {
    Alert.alert('Remove Photo', 'Remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteImage() },
    ]);
  }, [deleteImage]);

  const sections: Array<{ title: string; rows: Array<{ id: string; icon: any; label: string; sub?: string; badge?: number; onPress: () => void }> }> = [
    {
      title: 'Management',
      rows: [
        { id: 'users', icon: 'users', label: 'Manage Users', sub: 'Roles, verification & deletions', onPress: () => router.push('/(admin)/(tabs)/users' as any) },
        { id: 'restaurants', icon: 'home', label: 'Manage Restaurants', sub: 'Verify & moderate venues', onPress: () => router.push('/(admin)/(tabs)/restaurants' as any) },
        { id: 'orders', icon: 'shopping-bag', label: 'Orders', sub: 'Live queue & history', onPress: () => router.push('/(admin)/(tabs)/orders' as any) },
      ],
    },
    {
      title: 'Insights',
      rows: [
        { id: 'analytics', icon: 'bar-chart-2', label: 'Analytics', sub: 'Platform insights', onPress: () => router.push('/(admin)/(tabs)/analytics' as any) },
        { id: 'notifications', icon: 'bell', label: 'Notifications', badge: unreadCount > 0 ? Math.min(unreadCount, 99) : undefined, onPress: () => router.push('/(admin)/(tabs)/notifications' as any) },
      ],
    },
  ];

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const hasImage = !!user.imageUrl;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Ultra-compact header 36/14 - avatar 64, texts smaller */}
        <View style={{ backgroundColor: Colors.primary }}>
          <View
            style={{
              paddingTop: 36,
              paddingBottom: 14,
              paddingHorizontal: 16,
              borderBottomLeftRadius: Radius['3xl'],
              borderBottomRightRadius: Radius['3xl'],
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={handlePickImage} disabled={isUploading || isDeleting} activeOpacity={0.7} style={{ position: 'relative' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...Shadow.lg,
                }}
              >
                {hasImage ? (
                  <Image source={{ uri: user.imageUrl! }} style={{ width: '100%', height: '100%', borderRadius: 32 }} />
                ) : (
                  <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.white }}>
                    {user.firstName?.charAt(0).toUpperCase()}
                    {user.lastName?.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: Colors.white,
                  borderRadius: 14,
                  padding: 5,
                  borderWidth: 2,
                  borderColor: Colors.primary,
                }}
              >
                <Feather name="camera" size={11} color={Colors.primary} />
              </View>
              {(isUploading || isDeleting) && (
                <View
                  style={{
                    position: 'absolute',
                    inset: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 32,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }}
                >
                  <ActivityIndicator size="small" color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white, marginTop: 10 }}>{user.firstName} {user.lastName}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{user.email}</Text>
            {user.phone ? <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{user.phone}</Text> : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Online</Text>
              <View
                style={{
                  marginLeft: 8,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <Text style={{ color: Colors.white, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>ADMINISTRATOR</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => router.push('/(admin)/profile/edit' as any)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: Radius.full,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.25)',
                }}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={11} color={Colors.white} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>Edit Profile</Text>
              </TouchableOpacity>
              {user.imageUrl ? (
                <TouchableOpacity onPress={handleDeleteImage} disabled={isDeleting} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }} activeOpacity={0.7}>
                  <Feather name="trash-2" size={13} color={Colors.white} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Stats cards ultra-compact padding 10 */}
        <View style={{ paddingHorizontal: 16, marginTop: -12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { value: 'Admin', label: 'Role', icon: 'shield' },
              { value: user.isVerified ? 'Verified' : 'Unverified', label: 'Status', icon: 'check-circle' },
              { value: 'Online', label: 'Presence', icon: 'activity' },
            ].map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: Colors.white,
                  borderRadius: Radius.xl,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: Colors.borderLight,
                  ...Shadow.sm,
                  alignItems: 'center',
                }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={s.icon as any} size={10} color={Colors.white} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textDark, marginTop: 6 }} numberOfLines={1}>{s.value}</Text>
                <Text style={{ fontSize: 9, color: Colors.textSecondary, marginTop: 1 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {sections.map((section) => (
            <View key={section.title} style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8, marginBottom: 8 }}>{section.title.toUpperCase()}</Text>
              <PremiumCard elevation="sm" padding={0} style={{ overflow: 'hidden' }}>
                {section.rows.map((row, i) => (
                  <Pressable
                    key={row.id}
                    onPress={row.onPress}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: i !== section.rows.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                      <Feather name={row.icon} size={15} color={Colors.primary} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>{row.label}</Text>
                      {row.sub ? <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 2 }}>{row.sub}</Text> : null}
                    </View>
                    {!!row.badge && (
                      <View style={{ marginRight: 8, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>{row.badge}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={15} color={Colors.textTertiary} />
                  </Pressable>
                ))}
              </PremiumCard>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => setShowLogout(true)}
            disabled={isAuthenticating}
            style={{
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: Colors.errorBg,
              paddingVertical: 16,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: '#FECDD3',
            }}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={18} color={Colors.error} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.error }}>{isAuthenticating ? 'Logging out…' : 'Log Out'}</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: Colors.textMuted }}>KhanaGo Admin · v1.0.0</Text>
        </View>
      </ScrollView>

      <ConfirmDialog visible={showLogout} onClose={() => setShowLogout(false)} onConfirm={handleLogout} title="Log out?" message="You will need to sign in again." confirmLabel="Log Out" icon="log-out" tone="danger" busy={isAuthenticating} />
    </View>
  );
}
