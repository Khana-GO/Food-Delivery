import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Modal, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadProfileImage, useDeleteProfileImage } from '@/hooks/user';
import { ProfileHeader } from '@/components/customer/ProfileHeader';
import { ProfileMenuItem } from '@/components/customer/ProfileMenuItem';
import PremiumCard from '@/components/ui/PremiumCard';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useCartStore } from '@/stores/customer/cartStore';
import { useOrders } from '@/hooks/customer/useOrders';
import { useFavorites } from '@/hooks/customer/useFavorites';
import { useOrderStore } from '@/stores/customer/orderStore';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import * as ImagePicker from 'expo-image-picker';

function RealStatsRow() {
  const { orders } = useOrderStore();
  const { favoriteIds } = useFavoritesStore();
  // trigger fetches (cached)
  useOrders();
  useFavorites();
  const ordersCount = orders.length;
  const favCount = favoriteIds.size;
  // rating could be derived from orders or keep 4.8 if no data; use 4.8 as placeholder when no reviews API
  const rating = '4.8';
  return (
    <View style={styles.statsRow}>
      <PremiumCard style={styles.statCard as any}>
        <Text style={styles.statValue}>{ordersCount}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </PremiumCard>
      <PremiumCard style={styles.statCard as any}>
        <Text style={[styles.statValue, { color: Colors.primary }]}>{rating}</Text>
        <Text style={styles.statLabel}>Rating</Text>
      </PremiumCard>
      <PremiumCard style={styles.statCard as any}>
        <Text style={[styles.statValue, { color: '#15803D' }]}>{favCount}</Text>
        <Text style={styles.statLabel}>Favorites</Text>
      </PremiumCard>
    </View>
  );
}

export default function CustomerProfile() {
  const { user, logout, isAuthenticating } = useAuth();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteProfileImage();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleEditProfile = useCallback(() => router.push('/(customer)/profile/edit' as any), []);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.95,
      exif: false,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) uploadImage(result.assets[0]);
  }, [uploadImage]);

  const handleDeleteImage = useCallback(() => {
    Alert.alert('Remove Photo', 'Remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteImage() },
    ]);
  }, [deleteImage]);

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, [logout]);

  const { totalItems: profileCartCount } = useCartStore();
  const menuItems = [
    { icon: 'shopping-cart' as const, label: 'My Cart', badge: profileCartCount || undefined, onPress: () => router.push('/(customer)/cart' as any) },
    { icon: 'shopping-bag' as const, label: 'My Orders', onPress: () => router.push('/(customer)/(tabs)/orders' as any) },
    { icon: 'heart' as const, label: 'Favorites', onPress: () => router.push('/(customer)/(tabs)/favorites' as any) },
    { icon: 'map-pin' as const, label: 'Saved Addresses', onPress: () => router.push('/(customer)/addresses' as any) },
    { icon: 'credit-card' as const, label: 'Payment Methods', onPress: () => router.push('/(customer)/payment' as any) },
    { icon: 'bell' as const, label: 'Notifications', badge: 2, onPress: () => router.push('/(customer)/notifications' as any) },
    { icon: 'settings' as const, label: 'Settings', onPress: () => router.push('/(customer)/settings' as any) },
  ];

  if (!user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
          <ProfileHeader
            user={user}
            onEditPress={handleEditProfile}
            onImagePress={handlePickImage}
            onDeleteImage={handleDeleteImage}
            isUploading={isUploading || isDeleting}
          />
        </SafeAreaView>

        <AnimatedPage delay={30} slide>
          {/* Stats — real data */}
          <RealStatsRow />

          {/* Menu */}
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <PremiumCard style={{ padding: 0, overflow: 'hidden' } as any}>
              {menuItems.map((item) => (
                <ProfileMenuItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onPress={item.onPress}
                  badge={(item as any).badge}
                />
              ))}
            </PremiumCard>

            <TouchableOpacity
              onPress={() => setShowLogoutModal(true)}
              disabled={!!isAuthenticating}
              activeOpacity={0.85}
              style={styles.logoutBtn}
            >
              <Feather name="log-out" size={16} color="#EF4444" />
              <Text style={styles.logoutText}>{isAuthenticating ? 'Logging out...' : 'Logout'}</Text>
            </TouchableOpacity>

            <Text style={styles.version}>KhanaGo v1.0.0 • Fresh · Reliable · Premium</Text>
          </View>
        </AnimatedPage>
      </ScrollView>

      <Modal visible={showLogoutModal} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowLogoutModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIcon}>
              <Feather name="log-out" size={26} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Logout?</Text>
            <Text style={styles.modalDesc}>Are you sure you want to logout? You’ll need to sign in again.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)} activeOpacity={0.8} style={[styles.modalBtn, styles.modalCancel]}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} disabled={!!isAuthenticating} activeOpacity={0.85} style={[styles.modalBtn, styles.modalConfirm]}>
                {isAuthenticating ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.modalConfirmText}>Logout</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 12 },
  loadingText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 } as any,
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  version: { textAlign: 'center', fontSize: 11, color: Colors.textTertiary, marginTop: 14, fontWeight: '500' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 22,
    alignItems: 'center',
    ...Shadow.xl,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginTop: 12 },
  modalDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  modalBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: Radius.full },
  modalCancel: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  modalCancelText: { fontWeight: '700', color: Colors.textDark, fontSize: 14 },
  modalConfirm: { backgroundColor: '#EF4444' },
  modalConfirmText: { fontWeight: '700', color: '#FFFFFF', fontSize: 14 },
});
