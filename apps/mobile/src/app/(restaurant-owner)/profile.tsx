import React, { useCallback, useState, useMemo } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { useUploadProfileImage } from '@/hooks/owner/user/useUploadProfileImage';
import { useDeleteProfileImage } from '@/hooks/owner/user/useDeleteProfileImage';
import { useUnreadCount } from '@/hooks/owner/notification/useUnreadCount';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import { useRestaurantOrders } from '@/hooks/owner/orders/useRestaurantOrders';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

export default function OwnerProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout, isAuthenticating } = useAuth();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteProfileImage();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const [showLogout, setShowLogout] = useState(false);
  const { data: restaurants } = useMyRestaurants();
  const { data: ordersData } = useRestaurantOrders();
  const raw: any[] = (ordersData as any)?.data ?? (ordersData as any) ?? [];

  const earnings = useMemo(() => {
    const delivered = raw.filter((o: any) => (o.orderStatus || o.status)?.toUpperCase() === 'DELIVERED');
    return delivered.reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);
  }, [raw]);

  const avgRating = useMemo(() => {
    if (!restaurants?.length) return null;
    const ratings = restaurants.filter((r) => r.averageRating).map((r) => Number(r.averageRating));
    if (!ratings.length) return null;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  }, [restaurants]);

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
      quality: 0.95,
      exif: false,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
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

  const sections: Array<{ title: string; rows: Array<{ id: string; icon: any; label: string; sub?: string; badge?: number; onPress: () => void }> }> = [
    {
      title: 'Business',
      rows: [
        { id: 'restaurants', icon: 'package', label: 'My Stores', sub: `${restaurants?.length ?? 0} locations • Manage hours & status`, onPress: () => router.push('/(restaurant-owner)/restaurant' as any) },
        { id: 'menu', icon: 'book-open', label: 'Menu & Categories', sub: 'Dishes, pricing & availability', onPress: () => router.push('/(restaurant-owner)/menu' as any) },
        { id: 'orders', icon: 'shopping-bag', label: 'Orders', sub: `${raw.length} total • Live queue & history`, onPress: () => router.push('/(restaurant-owner)/orders' as any) },
      ],
    },
    {
      title: 'Insights',
      rows: [
        { id: 'earnings', icon: 'dollar-sign', label: 'Earnings', sub: `${rs(earnings)} available • delivered only`, onPress: () => router.push('/(restaurant-owner)/earnings' as any) },
        { id: 'analytics', icon: 'bar-chart-2', label: 'Analytics', sub: 'Sales trends & top items', onPress: () => router.push('/(restaurant-owner)/analytics' as any) },
        { id: 'notifications', icon: 'bell', label: 'Notifications', badge: unreadCount > 0 ? Math.min(unreadCount, 99) : undefined, onPress: () => router.push('/(restaurant-owner)/notifications' as any) },
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
        {/* Premium crimson header */}
        <View style={{ backgroundColor: Colors.primary }}>
          <View style={{ paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'], alignItems: 'center' }}>
            <TouchableOpacity onPress={handlePickImage} disabled={isUploading || isDeleting} activeOpacity={0.7} style={{ position: 'relative' }}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...Shadow.lg,
                  overflow: 'hidden',
                }}
              >
                {hasImage ? <Image source={{ uri: user.imageUrl! }} style={{ width: '100%', height: '100%', borderRadius: 38 }} /> : <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.white }}>{(user.firstName?.charAt(0).toUpperCase() || 'O') + (user.lastName?.charAt(0).toUpperCase() || '')}</Text>}
              </View>
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.white, borderRadius: 14, padding: 5, borderWidth: 2, borderColor: Colors.primary }}>
                <Feather name="camera" size={12} color={Colors.primary} />
              </View>
              {(isUploading || isDeleting) && (
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 38, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <ActivityIndicator size="small" color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.white, marginTop: 12 }} numberOfLines={1}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }} numberOfLines={1}>
              {user.email}
            </Text>
            {user.phone ? <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{user.phone}</Text> : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Online</Text>
              <View style={{ marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                <Text style={{ color: Colors.white, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>RESTAURANT OWNER</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/(restaurant-owner)/profile/edit' as any)}
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={12} color={Colors.white} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>Edit Profile</Text>
              </TouchableOpacity>
              {user.imageUrl ? (
                <TouchableOpacity onPress={handleDeleteImage} disabled={isDeleting} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }} activeOpacity={0.7}>
                  <Feather name="trash-2" size={13} color={Colors.white} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Real stats */}
        <View style={{ paddingHorizontal: 16, marginTop: -12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { value: `${restaurants?.length ?? 0}`, label: 'Restaurants', icon: 'package' as const },
              { value: avgRating ?? '—', label: 'Avg Rating', icon: 'star' as const },
              { value: rs(earnings).replace('Rs. ', 'Rs '), label: 'Earnings', icon: 'dollar-sign' as const },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm, alignItems: 'center' }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                  <Feather name={s.icon} size={11} color={Colors.primary} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, marginTop: 6 }} numberOfLines={1}>{s.value}</Text>
                <Text style={{ fontSize: 9, color: Colors.textSecondary, marginTop: 1 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {sections.map((section) => (
            <View key={section.title} style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8, marginBottom: 8 }}>{section.title.toUpperCase()}</Text>
              <PremiumCard elevation="sm" padding={0} style={{ overflow: 'hidden' }}>
                {section.rows.map((row, i) => (
                  <Pressable key={row.id} onPress={row.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: i !== section.rows.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
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
            style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.errorBg, paddingVertical: 16, borderRadius: Radius.xl, borderWidth: 1, borderColor: '#FECDD3' }}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={18} color={Colors.error} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.error }}>{isAuthenticating ? 'Logging out…' : 'Log Out'}</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: Colors.textMuted }}>KhanaGo • v1.0.0</Text>
        </View>
      </ScrollView>

      {showLogout ? (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: Colors.white, borderRadius: Radius['2xl'], padding: 20, width: '100%', maxWidth: 340, ...Shadow.lg, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.errorBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
              <Feather name="log-out" size={24} color={Colors.error} />
            </View>
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '800', color: Colors.textDark }}>Log out?</Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 }}>You will need to sign in again to access your restaurant dashboard.</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' }}>
              <TouchableOpacity onPress={() => setShowLogout(false)} style={{ flex: 1, backgroundColor: Colors.backgroundAlt, paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={{ flex: 1, backgroundColor: Colors.error, paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center' }}>
                {isAuthenticating ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>Log Out</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
