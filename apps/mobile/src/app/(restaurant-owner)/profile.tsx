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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog, useResponsive, rs } from '@/components/owner/kit';
import * as ImagePicker from 'expo-image-picker';
import { useUploadProfileImage } from '@/hooks/user/useUploadProfileImage';
import { useDeleteProfileImage } from '@/hooks/user/useDeleteProfileImage';

interface Row {
  id: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  sub?: string;
  badge?: number;
  onPress: () => void;
  tint?: 'brand' | 'green' | 'slate';
}

const TINT_BG = {
  brand: 'bg-red-50',
  green: 'bg-green-50',
  slate: 'bg-slate-100',
} as const;

const TINT_FG = {
  brand: '#E23744',
  green: '#16A34A',
  slate: '#475569',
} as const;

export default function OwnerProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout, isAuthenticating } = useAuth();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteProfileImage();
  const [showLogout, setShowLogout] = useState(false);
  const { isTablet } = useResponsive();

  const handleLogout = useCallback(async () => {
    setShowLogout(false);
    try {
      await logout();
      router.replace('/auth/login');
    } catch {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, [logout]);

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
      const asset = result.assets[0];
      // asset has uri, mimeType/type, fileName – service handles both
      uploadImage(asset as any);
    }
  }, [uploadImage]);

  const handleDeleteImage = useCallback(() => {
    Alert.alert(
      'Remove Profile Image',
      'Are you sure you want to remove your profile image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteImage() },
      ]
    );
  }, [deleteImage]);

  const sections: Array<{ title: string; rows: Row[] }> = [
    {
      title: 'Business',
      rows: [
        {
          id: 'restaurants',
          icon: 'package',
          label: 'My Restaurants',
          sub: 'Manage locations & hours',
          tint: 'brand',
          onPress: () => router.push('/(restaurant-owner)/restaurant'),
        },
        {
          id: 'menu',
          icon: 'book-open',
          label: 'Menu & Categories',
          sub: 'Dishes, pricing & availability',
          tint: 'green',
          onPress: () => router.push('/(restaurant-owner)/menu'),
        },
        {
          id: 'orders',
          icon: 'shopping-bag',
          label: 'Orders',
          sub: 'Live queue & history',
          badge: 8,
          tint: 'brand',
          onPress: () => router.push('/(restaurant-owner)/orders'),
        },
      ],
    },
    {
      title: 'Insights',
      rows: [
        {
          id: 'earnings',
          icon: 'dollar-sign',
          label: 'Earnings & Payouts',
          sub: rs(45290) + ' available',
          tint: 'green',
          onPress: () => router.push('/(restaurant-owner)/earnings'),
        },
        {
          id: 'analytics',
          icon: 'bar-chart-2',
          label: 'Analytics',
          sub: 'Sales trends & top items',
          tint: 'slate',
          onPress: () => router.push('/(restaurant-owner)/analytics'),
        },
        {
          id: 'notifications',
          icon: 'bell',
          label: 'Notifications',
          badge: 2,
          tint: 'brand',
          onPress: () => router.push('/(restaurant-owner)/notifications'),
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ─── Header ─── */}
        <View style={{ paddingTop: insets.top }} className="bg-primary">
          <View className="overflow-hidden rounded-b-[32px] px-5 pb-14 pt-6">
            <View className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <View className="absolute right-0 top-16 h-24 w-24 rounded-full bg-green-400/20" />

            <View className="flex-row items-center">
              {/* Avatar — round professional */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePickImage}
                disabled={isUploading || isDeleting}
                className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-white/40 bg-white/15"
                style={{ elevation: 2 }}
              >
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="h-full w-full" style={{ borderRadius: 999 }} />
                ) : (
                  <View className="h-full w-full items-center justify-center rounded-full bg-white/10">
                    <Text className="text-2xl font-extrabold text-white">
                      {(user?.firstName?.charAt(0) || 'O').toUpperCase()}
                      {(user?.lastName?.charAt(0) || '').toUpperCase()}
                    </Text>
                  </View>
                )}
                {/* camera badge — bottom right, circular */}
                <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-white shadow-sm">
                  <Feather name="camera" size={12} color="#E23744" />
                </View>
                {(isUploading || isDeleting) && (
                  <View className="absolute inset-0 items-center justify-center rounded-full bg-black/50">
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>

              <View className="ml-4 flex-1">
                <Text className="text-lg font-extrabold tracking-tight text-white" numberOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="mt-0.5 text-xs text-white/80" numberOfLines={1}>
                  {user?.email}
                </Text>
                {user?.phone ? (
                  <Text className="mt-0.5 text-xs text-white/70" numberOfLines={1}>
                    {user.phone}
                  </Text>
                ) : null}
                <View className="mt-1.5 self-start rounded-full bg-green-400/25 px-2.5 py-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-green-50">
                    Restaurant Owner
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(restaurant-owner)/profile/edit' as never)}
                className="rounded-full bg-white/20 p-2.5"
              >
                <Feather name="edit-2" size={18} color="#FFF" />
              </TouchableOpacity>

              {user?.imageUrl ? (
                <TouchableOpacity
                  onPress={handleDeleteImage}
                  disabled={isDeleting}
                  className="p-2 ml-2 rounded-full bg-red-500/30"
                >
                  <Feather name="trash-2" size={16} color="#FFF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* ─── Stats ─── */}
        <View className="-mt-9 px-4">
          <View
            className="flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100"
            style={{ alignSelf: 'center', width: '100%', maxWidth: isTablet ? 688 : undefined }}
          >
            {[
              { value: '3', label: 'Restaurants', color: 'text-primary' },
              { value: '4.8', label: 'Avg Rating', color: 'text-green-600' },
              { value: '₹45K', label: 'Earnings', color: 'text-green-600' },
            ].map((s, i) => (
              <View key={s.label} className={`flex-1 items-center py-4 ${i > 0 ? 'border-l border-gray-50' : ''}`}>
                <Text className={`text-xl font-extrabold tracking-tight ${s.color}`}>{s.value}</Text>
                <Text className="mt-0.5 text-[11px] font-medium text-gray-400">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Sections ─── */}
        <View className="px-4" style={{ alignSelf: 'center', width: '100%', maxWidth: isTablet ? 720 : undefined }}>
          {sections.map((section) => (
            <View key={section.title} className="mt-5">
              <Text className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                {section.title}
              </Text>
              <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
                {section.rows.map((row, i) => (
                  <Pressable
                    key={row.id}
                    onPress={row.onPress}
                    className={`flex-row items-center px-4 py-3.5 active:bg-gray-50 ${
                      i !== section.rows.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <View className={`h-10 w-10 items-center justify-center rounded-xl ${TINT_BG[row.tint || 'slate']}`}>
                      <Feather name={row.icon} size={17} color={TINT_FG[row.tint || 'slate']} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-gray-900">{row.label}</Text>
                      {row.sub ? <Text className="mt-0.5 text-xs text-gray-400">{row.sub}</Text> : null}
                    </View>
                    {!!row.badge && (
                      <View className="mr-2 rounded-full bg-primary px-2 py-0.5">
                        <Text className="text-[11px] font-bold text-white">{row.badge}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={17} color="#CBD5E1" />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* ─── Logout ─── */}
          <Pressable
            onPress={() => setShowLogout(true)}
            disabled={isAuthenticating}
            className="mt-5 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-4 active:bg-red-100"
          >
            <Feather name="log-out" size={18} color="#DC2626" />
            <Text className="ml-2 text-sm font-bold text-red-600">
              {isAuthenticating ? 'Logging out…' : 'Log Out'}
            </Text>
          </Pressable>

          <Text className="mt-5 text-center text-xs text-gray-300">FoodHub Partner · v1.0.0</Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        title="Log out?"
        message="You will need to sign in again to access your restaurant dashboard."
        confirmLabel="Log Out"
        icon="log-out"
        tone="danger"
        busy={isAuthenticating}
      />
    </View>
  );
}
