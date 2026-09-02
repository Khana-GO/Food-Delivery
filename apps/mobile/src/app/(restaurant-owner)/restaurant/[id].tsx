import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import {
  useToggleOpenStatus,
  useUpdateImage,
  useDeleteImage,
  useDeleteRestaurant,
} from '@/hooks/owner/restaurant/useRestaurantMutations';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';
import { toast } from '@/components/ui/toast';

type PhotoTarget = 'logo' | 'cover';

function CoverAction({ icon, label, onPress, disabled }: { icon: React.ComponentProps<typeof Feather>['name']; label?: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
      <Feather name={icon} size={12} color={Colors.white} />
      {label ? <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

export default function RestaurantManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: restaurants, isLoading, refetch } = useMyRestaurants();
  const { mutateAsync: toggleOpen, isPending: isToggling } = useToggleOpenStatus();
  const { mutateAsync: updateImage, isPending: isUploading } = useUpdateImage();
  const { mutateAsync: deleteImage, isPending: isDeletingPhoto } = useDeleteImage();
  const { mutateAsync: deleteRestaurant, isPending: isDeleting } = useDeleteRestaurant();

  const [confirmPhoto, setConfirmPhoto] = useState<PhotoTarget | null>(null);
  const [showDeleteRestaurant, setShowDeleteRestaurant] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<PhotoTarget | null>(null);

  const restaurant = restaurants?.find((r) => r.id === id);

  const pickAndUpload = useCallback(
    async (target: PhotoTarget) => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.error('Please allow access to your photo library.', 'Permission required');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.92,
        exif: false,
        selectionLimit: 1,
      });
      if (result.canceled || !restaurant) return;
      const asset = result.assets[0];
      try {
        setUploadingTarget(target);
        await updateImage({
          id: restaurant.id,
          type: target,
          image: { uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName ?? undefined },
        });
      } catch {
      } finally {
        setUploadingTarget(null);
      }
    },
    [restaurant, updateImage]
  );

  const handleRemovePhoto = useCallback(async () => {
    if (!confirmPhoto || !restaurant) return;
    try {
      await deleteImage({ id: restaurant.id, type: confirmPhoto });
    } catch {
    } finally {
      setConfirmPhoto(null);
    }
  }, [confirmPhoto, restaurant, deleteImage]);

  const handleDeleteRestaurant = useCallback(async () => {
    if (!restaurant) return;
    setShowDeleteRestaurant(false);
    try {
      await deleteRestaurant(restaurant.id);
      router.replace('/(restaurant-owner)/restaurant' as any);
    } catch {}
  }, [restaurant, deleteRestaurant]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ backgroundColor: Colors.primary, paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Feather name="arrow-left" size={18} color={Colors.white} />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }}>Restaurant</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Feather name="alert-circle" size={36} color={Colors.textMuted} />
            <Text style={{ marginTop: 10, fontSize: 14, fontWeight: '700', color: Colors.textDark }}>Restaurant not found</Text>
            <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 14, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>Retry</Text>
            </TouchableOpacity>
          </PremiumCard>
        </View>
      </View>
    );
  }

  const busyPhoto = isUploading || isDeletingPhoto;
  const isOpen = restaurant.isOpen;
  const rsFmt = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: Colors.primary, paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }} activeOpacity={0.7}>
            <Feather name="arrow-left" size={18} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }} numberOfLines={1}>{restaurant.name}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 }} numberOfLines={1}>{restaurant.cuisineType} • Manage store</Text>
          </View>
          <View style={{ backgroundColor: isOpen ? Colors.successBg : '#FEE2E2', paddingHorizontal: 8, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: isOpen ? '#BBF7D0' : '#FECACA', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isOpen ? Colors.success : Colors.error }} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: isOpen ? Colors.success : Colors.error }}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}>
        {/* Cover premium */}
        <PremiumCard elevation="md" padding={0} style={{ overflow: 'hidden' }}>
          <View style={{ height: 180, backgroundColor: Colors.backgroundAlt }}>
            {restaurant.coverImageUrl ? (
              <Image source={{ uri: restaurant.coverImageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={250} />
            ) : (
              <View style={{ flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ position: 'absolute', top: 20, right: 60, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <Feather name="image" size={28} color="rgba(255,255,255,0.9)" />
                <Text style={{ marginTop: 8, fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Cover photo makes your store stand out</Text>
              </View>
            )}
            <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 8 }}>
              <CoverAction icon={restaurant.coverImageUrl ? 'refresh-cw' : 'plus'} label={restaurant.coverImageUrl ? 'Change' : 'Add cover'} onPress={() => pickAndUpload('cover')} disabled={busyPhoto} />
              {restaurant.coverImageUrl ? <CoverAction icon="trash-2" onPress={() => setConfirmPhoto('cover')} disabled={busyPhoto} /> : null}
            </View>
            {uploadingTarget === 'cover' ? (
              <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={Colors.white} />
                <Text style={{ marginTop: 8, fontSize: 12, fontWeight: '700', color: Colors.white }}>Uploading cover…</Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, marginTop: -28 }}>
            <Pressable onPress={() => pickAndUpload('logo')} disabled={busyPhoto} style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: Colors.white, borderWidth: 3, borderColor: Colors.white, ...Shadow.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {restaurant.logoUrl ? (
                <Image source={{ uri: restaurant.logoUrl }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
              ) : (
                <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.primary }}>{restaurant.name.charAt(0).toUpperCase()}</Text>
              )}
              {uploadingTarget === 'logo' ? (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color={Colors.white} />
                </View>
              ) : (
                <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderBottomLeftRadius: 10 }}>
                  <Feather name="camera" size={11} color={Colors.white} />
                </View>
              )}
            </Pressable>

            <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: isOpen ? Colors.successBg : '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: isOpen ? '#BBF7D0' : '#FECACA', marginBottom: 4 }}>
              <Feather name={isOpen ? 'zap' : 'moon'} size={13} color={isOpen ? Colors.success : Colors.error} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: isOpen ? Colors.success : Colors.error }}>{isToggling ? 'Updating…' : isOpen ? 'Accepting orders' : 'Paused'}</Text>
              <View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: isOpen ? Colors.success : Colors.textTertiary, padding: 2, justifyContent: 'center' }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white, alignSelf: isOpen ? 'flex-end' : 'flex-start', ...Shadow.sm }} />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => !isToggling && (toggleOpen(restaurant.id) as any)}
            activeOpacity={0.7}
            style={{ marginLeft: 'auto', marginRight: 16, marginTop: -8, width: 48 }}
          >
            {/* invisible tap area for toggle */}
          </TouchableOpacity>

          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ flex: 1, fontSize: 16, fontWeight: '800', color: Colors.textDark }}>{restaurant.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.ratingGoldLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Feather name="star" size={12} color={Colors.ratingGold} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark }}>{restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Feather name="tag" size={12} color={Colors.textTertiary} />
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{restaurant.cuisineType}</Text>
              </View>
              {restaurant.isVerified ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successBg, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: '#BBF7D0' }}>
                  <Feather name="shield" size={11} color={Colors.success} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.success }}>Verified</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Feather name="clock" size={12} color={Colors.textTertiary} />
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{restaurant.openingTime?.slice(0, 5) || '--:--'} – {restaurant.closingTime?.slice(0, 5) || '--:--'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toggleOpen(restaurant.id)}
            disabled={isToggling}
            style={{ marginHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: isOpen ? Colors.success : Colors.error, paddingVertical: 12, borderRadius: Radius.full, ...Shadow.sm }}
            activeOpacity={0.8}
          >
            {isToggling ? <ActivityIndicator size="small" color={Colors.white} /> : <Feather name={isOpen ? 'pause-circle' : 'play-circle'} size={16} color={Colors.white} />}
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>{isOpen ? 'Pause Orders' : 'Open for Orders'}</Text>
          </TouchableOpacity>
        </PremiumCard>

        {/* Branding manager */}
        <PremiumCard elevation="sm" padding={0} style={{ overflow: 'hidden' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.7, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>BRANDING</Text>
          {[
            { key: 'logo' as PhotoTarget, label: 'Logo', sub: restaurant.logoUrl ? 'Uploaded • square works best' : 'Not added yet', exists: Boolean(restaurant.logoUrl), icon: 'image' as const },
            { key: 'cover' as PhotoTarget, label: 'Cover photo', sub: restaurant.coverImageUrl ? 'Uploaded • wide banner' : 'Not added yet', exists: Boolean(restaurant.coverImageUrl), icon: 'layout' as const },
          ].map((row, i, arr) => (
            <View key={row.key} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i === 0 ? 1 : 0, borderBottomWidth: i !== arr.length - 1 ? 1 : 0, borderColor: Colors.borderLight }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: row.key === 'logo' ? Colors.white : Colors.backgroundAlt, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                {(row.key === 'logo' ? restaurant.logoUrl : restaurant.coverImageUrl) ? (
                  <Image source={{ uri: (row.key === 'logo' ? restaurant.logoUrl : restaurant.coverImageUrl)! }} style={{ width: '100%', height: '100%' }} contentFit={row.key === 'logo' ? 'contain' : 'cover'} />
                ) : (
                  <Feather name={row.icon} size={16} color={Colors.textTertiary} />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>{row.label}</Text>
                <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 1 }}>{row.sub}</Text>
              </View>
              <TouchableOpacity onPress={() => pickAndUpload(row.key)} disabled={busyPhoto} style={{ borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full }} activeOpacity={0.7}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textDark }}>{uploadingTarget === row.key ? 'Uploading…' : row.exists ? 'Replace' : 'Upload'}</Text>
              </TouchableOpacity>
              {row.exists ? (
                <TouchableOpacity onPress={() => setConfirmPhoto(row.key)} disabled={busyPhoto} style={{ marginLeft: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.errorBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                  <Feather name="trash-2" size={14} color={Colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </PremiumCard>

        {/* Store details */}
        <PremiumCard elevation="sm" padding={16}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.7, marginBottom: 10 }}>STORE DETAILS</Text>
          {[
            { icon: 'map-pin' as const, label: 'Address', value: `${restaurant.address}${restaurant.wardNumber ? ` · Ward ${restaurant.wardNumber}` : ''}` },
            { icon: 'phone' as const, label: 'Phone', value: restaurant.phone || '—' },
            { icon: 'mail' as const, label: 'Email', value: restaurant.email || '—' },
            { icon: 'truck' as const, label: 'Delivery fee', value: rsFmt(Number(restaurant.deliveryFee)) },
            { icon: 'shopping-cart' as const, label: 'Min order', value: rsFmt(Number(restaurant.minimumOrderAmount)) },
            { icon: 'clock' as const, label: 'Avg prep', value: restaurant.estimatedDeliveryTime ? `${restaurant.estimatedDeliveryTime} min` : '—' },
          ].map((row, idx) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx !== 5 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={row.icon} size={14} color={Colors.textSecondary} />
              </View>
              <Text style={{ marginLeft: 10, fontSize: 12, color: Colors.textTertiary, width: 90 }}>{row.label}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textDark, textAlign: 'right' }} numberOfLines={2}>{row.value}</Text>
            </View>
          ))}
        </PremiumCard>

        {/* Actions */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity onPress={() => router.push(`/(restaurant-owner)/restaurant/${restaurant.id}/edit` as any)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.full, ...Shadow.primary }} activeOpacity={0.8}>
            <Feather name="edit-2" size={16} color={Colors.white} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>Edit Details</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(restaurant-owner)/menu' as any)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.white, paddingVertical: 14, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border }}>
            <Feather name="book-open" size={16} color={Colors.textDark} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>View Full Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Danger */}
        <TouchableOpacity onPress={() => setShowDeleteRestaurant(true)} disabled={!!isDeleting} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.errorBg, paddingVertical: 14, borderRadius: Radius.xl, borderWidth: 1, borderColor: '#FECDD3' }} activeOpacity={0.7}>
          {isDeleting ? <ActivityIndicator size="small" color={Colors.error} /> : <Feather name="trash-2" size={16} color={Colors.error} />}
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.error }}>Remove This Restaurant</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 11, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: 16, lineHeight: 16 }}>Your store will be hidden from customers. Contact support if you ever want it back.</Text>
      </ScrollView>

      {/* Confirm dialogs custom */}
      {confirmPhoto ? (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: Colors.white, borderRadius: Radius['2xl'], padding: 20, width: '100%', maxWidth: 340, ...Shadow.lg }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.errorBg, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
              <Feather name="trash-2" size={22} color={Colors.error} />
            </View>
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '800', color: Colors.textDark, textAlign: 'center' }}>Delete {confirmPhoto === 'logo' ? 'logo' : 'cover photo'}?</Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 }}>{confirmPhoto === 'cover' ? 'Your store will fall back to the default banner until you upload a new one.' : 'Your initials will show instead until you upload a new one.'}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setConfirmPhoto(null)} style={{ flex: 1, backgroundColor: Colors.backgroundAlt, paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRemovePhoto} style={{ flex: 1, backgroundColor: Colors.error, paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {showDeleteRestaurant ? (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: Colors.white, borderRadius: Radius['2xl'], padding: 20, width: '100%', maxWidth: 340, ...Shadow.lg }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.errorBg, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
              <Feather name="alert-triangle" size={22} color={Colors.error} />
            </View>
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '800', color: Colors.textDark, textAlign: 'center' }}>Remove this restaurant?</Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 }}>{restaurant.name} will be hidden from FoodHub.</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setShowDeleteRestaurant(false)} style={{ flex: 1, backgroundColor: Colors.backgroundAlt, paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteRestaurant} style={{ flex: 1, backgroundColor: Colors.error, paddingVertical: 12, borderRadius: Radius.full, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
