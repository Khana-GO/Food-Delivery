import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  ScreenHeader,
  InfoRow,
  PrimaryButton,
  LoadingScreen,
  ConfirmDialog,
  ContentWidth,
  useResponsive,
  rs,
  Toggle,
} from '@/components/res-owner/owner/kit';
import { toast } from '@/components/ui/toast';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import {
  useToggleOpenStatus,
  useUpdateImage,
  useDeleteImage,
  useDeleteRestaurant,
} from '@/hooks/owner/restaurant/useRestaurantMutations';

type PhotoTarget = 'logo' | 'cover';

// ─── Small circular action used over the cover image ───
function CoverAction({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center gap-1.5 rounded-full bg-black/45 px-3 py-2 active:bg-black/60"
    >
      <Feather name={icon} size={13} color="#FFFFFF" />
      {label ? <Text className="text-[11px] font-bold text-white">{label}</Text> : null}
    </Pressable>
  );
}

export default function RestaurantManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTablet } = useResponsive();
  const { data: restaurants, isLoading, refetch } = useMyRestaurants();

  const { mutateAsync:  toggleOpen, isPending: isToggling } = useToggleOpenStatus();
  const { mutateAsync: updateImage, isPending: isUploading } = useUpdateImage();
  const { mutateAsync: deleteImage, isPending: isDeletingPhoto } = useDeleteImage();
  const { mutateAsync: deleteRestaurant, isPending: isDeleting } = useDeleteRestaurant();

  const [confirmPhoto, setConfirmPhoto] = useState<PhotoTarget | null>(null);
  const [showDeleteRestaurant, setShowDeleteRestaurant] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<PhotoTarget | null>(null);

  const restaurant = restaurants?.find((r) => r.id === id);

  // ─── Pick & upload a photo ───
  const pickAndUpload = useCallback(
    async (target: PhotoTarget) => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.error('Please allow access to your photo library.', 'Permission required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: target === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !restaurant) return;

      const asset = result.assets[0];
      try {
        setUploadingTarget(target);
        await updateImage({
          id: restaurant.id,
          type: target,
          image: {
            uri: asset.uri,
            mimeType: asset.mimeType,
            fileName: asset.fileName ?? undefined,
          },
        });
      } catch {
        // Failure toast is raised by the mutation hook.
      } finally {
        setUploadingTarget(null);
      }
    },
    [restaurant, updateImage],
  );

  // ─── Remove an existing photo ───
  const handleRemovePhoto = useCallback(async () => {
    if (!confirmPhoto || !restaurant) return;
    try {
      await deleteImage({ id: restaurant.id, type: confirmPhoto });
    } catch {
      // Error surfaced through the store.
    } finally {
      setConfirmPhoto(null);
    }
  }, [confirmPhoto, restaurant, deleteImage]);

  // ─── Soft delete restaurant ───
  const handleDeleteRestaurant = useCallback(async () => {
    if (!restaurant) return;
    setShowDeleteRestaurant(false);
    try {
      await deleteRestaurant(restaurant.id);
      router.replace('/(restaurant-owner)/restaurant');
    } catch {
      // Error surfaced through the store.
    }
  }, [restaurant, deleteRestaurant]);

  if (isLoading) return <LoadingScreen />;

  if (!restaurant) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Restaurant" />
        <View className="items-center justify-center flex-1 px-8">
          <Feather name="alert-circle" size={44} color="#CBD5E1" />
          <Text className="mt-4 text-base font-bold text-gray-800">Restaurant not found</Text>
          <Text className="mt-1 text-sm text-center text-gray-400">
            It may have been removed or you don't have access.
          </Text>
          <Pressable onPress={() => refetch()} className="px-6 py-3 mt-6 rounded-full bg-primary">
            <Text className="text-sm font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const busyPhoto = isUploading || isDeletingPhoto;
  const isOpen = restaurant.isOpen;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={restaurant.name} subtitle={`Manage · ${restaurant.cuisineType}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ padding: 16 }, ContentWidth(isTablet ? 720 : 9999)]}
      >
        {/* ─── Cover photo ─── */}
        <View className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl shadow-gray-100">
          <View className="w-full h-44 bg-green-600/90">
            {restaurant.coverImageUrl ? (
              <Image source={{ uri: restaurant.coverImageUrl }} className="w-full h-full" contentFit="cover" />
            ) : (
              <>
                <View className="absolute rounded-full -right-8 -top-12 h-36 w-36 bg-white/15" />
                <View className="absolute w-16 h-16 rounded-full right-16 top-8 bg-white/10" />
              </>
            )}

            {/* cover actions */}
            <View className="absolute flex-row gap-2 right-3 top-3">
              <CoverAction
                icon={restaurant.coverImageUrl ? 'refresh-cw' : 'plus'}
                label={restaurant.coverImageUrl ? 'Change' : 'Add cover'}
                onPress={() => pickAndUpload('cover')}
                disabled={busyPhoto}
              />
              {restaurant.coverImageUrl ? (
                <CoverAction icon="trash-2" onPress={() => setConfirmPhoto('cover')} disabled={busyPhoto} />
              ) : null}
            </View>

            {!restaurant.coverImageUrl ? (
              <View className="items-center justify-center flex-1">
                <Feather name="image" size={26} color="rgba(255,255,255,0.85)" />
                <Text className="mt-2 text-xs font-semibold text-white/90">
                  A cover photo makes your store stand out
                </Text>
              </View>
            ) : null}

            {/* upload progress overlay */}
            {uploadingTarget === 'cover' ? (
              <View className="absolute inset-0 items-center justify-center bg-black/45">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="mt-2 text-xs font-bold text-white">Uploading cover…</Text>
              </View>
            ) : null}
          </View>

          {/* ─── Brand row: logo + name/status ─── */}
          <View className="flex-row items-end px-5 -mt-9">
            <Pressable
              onPress={() => pickAndUpload('logo')}
              disabled={busyPhoto}
              className="h-[72px] w-[72px] overflow-hidden rounded-2xl border-4 border-white bg-red-50 active:opacity-80"
            >
              {restaurant.logoUrl ? (
                <Image source={{ uri: restaurant.logoUrl }} className="w-full h-full" contentFit="cover" />
              ) : (
                <View className="items-center justify-center w-full h-full">
                  <Text className="text-2xl font-extrabold text-primary">
                    {restaurant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {uploadingTarget === 'logo' ? (
                <View className="absolute inset-0 items-center justify-center bg-black/45">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : (
                /* camera badge */
                <View className="absolute top-0 right-0 items-center justify-center p-1 rounded-bl-xl bg-black/50">
                  <Feather name="camera" size={11} color="#FFFFFF" />
                </View>
              )}
            </Pressable>

            {/* open / closed switch */}
            <View
              className={`mb-0.5 ml-auto flex-row items-center gap-2 self-end rounded-full px-3 py-1.5 ${
                isOpen ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <Feather name={isOpen ? 'zap' : 'moon'} size={13} color={isOpen ? '#16A34A' : '#DC2626'} />
              <Text className={`text-[11px] font-bold ${isOpen ? 'text-green-700' : 'text-red-500'}`}>
                {isToggling ? 'Updating…' : isOpen ? 'Accepting orders' : 'Paused'}
              </Text>
              <Toggle
                checked={isOpen}
                loading={isToggling}
                onChange={() => toggleOpen(restaurant.id)}
              />
            </View>
          </View>

          <View className="px-5 pt-3 pb-5">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-lg font-extrabold tracking-tight text-gray-900">
                {restaurant.name}
              </Text>
              <View className="flex-row items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
                <Feather name="star" size={12} color="#F59E0B" />
                <Text className="text-xs font-extrabold text-amber-600">
                  {restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New'}
                </Text>
              </View>
            </View>

            <View className="mt-1.5 flex-row flex-wrap items-center gap-x-3 gap-y-1">
              <View className="flex-row items-center gap-1">
                <Feather name="tag" size={12} color="#94A3B8" />
                <Text className="text-xs text-gray-500">{restaurant.cuisineType}</Text>
              </View>
              {restaurant.isVerified && (
                <View className="flex-row items-center gap-1">
                  <Feather name="shield" size={12} color="#16A34A" />
                  <Text className="text-xs font-semibold text-green-600">Verified</Text>
                </View>
              )}
              <View className="flex-row items-center gap-1">
                <Feather name="clock" size={12} color="#94A3B8" />
                <Text className="text-xs text-gray-500">
                  {restaurant.openingTime?.slice(0, 5) || '--:--'} –{' '}
                  {restaurant.closingTime?.slice(0, 5) || '--:--'}
                </Text>
              </View>
            </View>

            {/* logo helper line */}
            <Text className="mt-3 text-[11px] leading-4 text-gray-400">
              Tap the logo or cover to {restaurant.logoUrl || restaurant.coverImageUrl ? 'change them.' : 'add your photos.'}{' '}
              Photos upload instantly and replace the old ones.
            </Text>
          </View>
        </View>

        {/* ─── Photo manager ─── */}
        <View className="mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl shadow-gray-100">
          <Text className="mb-1 px-4 pt-4 text-[13px] font-bold uppercase tracking-wide text-gray-400">
            Branding
          </Text>
          {[
            {
              key: 'logo' as PhotoTarget,
              icon: 'image' as const,
              label: 'Logo',
              sub: restaurant.logoUrl ? 'Uploaded · square works best' : 'Not added yet',
              exists: Boolean(restaurant.logoUrl),
            },
            {
              key: 'cover' as PhotoTarget,
              icon: 'layout' as const,
              label: 'Cover photo',
              sub: restaurant.coverImageUrl ? 'Uploaded · wide banner' : 'Not added yet',
              exists: Boolean(restaurant.coverImageUrl),
            },
          ].map((row, i, arr) => (
            <View
              key={row.key}
              className={`flex-row items-center px-4 py-3.5 ${i !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
                <View className="items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-xl">
                  {(row.key === 'logo' ? restaurant.logoUrl : restaurant.coverImageUrl) ? (
                    <Image
                      source={{ uri: (row.key === 'logo' ? restaurant.logoUrl : restaurant.coverImageUrl)! }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <Feather name={row.icon} size={17} color="#94A3B8" />
                  )}
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-gray-900">{row.label}</Text>
                  <Text className="mt-0.5 text-xs text-gray-400">{row.sub}</Text>
                </View>
                <Pressable
                  onPress={() => pickAndUpload(row.key)}
                  disabled={busyPhoto}
                  className="rounded-full border border-gray-200 px-3.5 py-1.5 active:bg-gray-50"
                >
                  <Text className="text-xs font-bold text-gray-700">
                    {uploadingTarget === row.key ? 'Uploading…' : row.exists ? 'Replace' : 'Upload'}
                  </Text>
                </Pressable>
                {row.exists ? (
                  <Pressable
                    onPress={() => setConfirmPhoto(row.key)}
                    disabled={busyPhoto}
                    hitSlop={8}
                    className="items-center justify-center ml-2 rounded-full h-9 w-9 bg-red-50 active:bg-red-100"
                  >
                    <Feather name="trash-2" size={15} color="#DC2626" />
                  </Pressable>
                ) : null}
            </View>
          ))}
        </View>

        {/* ─── Store details ─── */}
        <View className="p-4 mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl shadow-gray-100">
          <Text className="mb-1 text-[13px] font-bold uppercase tracking-wide text-gray-400">Store details</Text>
          <InfoRow
            icon="map-pin"
            label="Address"
            value={`${restaurant.address}${restaurant.wardNumber ? ` · Ward ${restaurant.wardNumber}` : ''}`}
          />
          <InfoRow icon="phone" label="Phone" value={restaurant.phone || '—'} />
          <InfoRow icon="mail" label="Email" value={restaurant.email || '—'} />
          <InfoRow icon="truck" label="Delivery fee" value={rs(Number(restaurant.deliveryFee))} />
          <InfoRow icon="shopping-cart" label="Min order" value={rs(Number(restaurant.minimumOrderAmount))} />
          <InfoRow
            icon="clock"
            label="Avg prep"
            value={restaurant.estimatedDeliveryTime ? `${restaurant.estimatedDeliveryTime} min` : '—'}
            last
          />
        </View>

        {/* ─── Actions ─── */}
        <View className="gap-3 mt-5 mb-2">
          <PrimaryButton
            label="Edit Details"
            variant="green"
            icon="edit-2"
            onPress={() => router.push(`/(restaurant-owner)/restaurant/${restaurant.id}/edit` as never)}
          />
          <PrimaryButton
            label="View Full Menu"
            variant="outline"
            icon="book-open"
            onPress={() => router.push('/(restaurant-owner)/menu')}
          />
        </View>

        {/* ─── Danger zone ─── */}
        <Pressable
          onPress={() => setShowDeleteRestaurant(true)}
          disabled={isDeleting}
          className="flex-row items-center justify-center py-4 mt-4 mb-8 border border-red-200 rounded-2xl bg-red-50 active:bg-red-100"
        >
          <Feather name="trash-2" size={16} color="#DC2626" />
          <Text className="ml-2 text-sm font-bold text-red-600">Remove This Restaurant</Text>
        </Pressable>
        <Text className="-mt-5 mb-8 px-8 text-center text-[11px] leading-4 text-gray-400">
          Your store will be hidden from customers. Contact support if you ever want it back.
        </Text>
      </ScrollView>

      {/* ─── Confirmations ─── */}
      <ConfirmDialog
        visible={confirmPhoto !== null}
        onClose={() => setConfirmPhoto(null)}
        onConfirm={handleRemovePhoto}
        title={`Delete ${confirmPhoto === 'logo' ? 'logo' : 'cover photo'}?`}
        message={
          confirmPhoto === 'cover'
            ? 'Your store will fall back to the default banner until you upload a new one.'
            : 'Your initials will show instead until you upload a new one.'
        }
        confirmLabel="Delete Photo"
        busy={isDeletingPhoto}
      />

      <ConfirmDialog
        visible={showDeleteRestaurant}
        onClose={() => setShowDeleteRestaurant(false)}
        onConfirm={handleDeleteRestaurant}
        title="Remove this restaurant?"
        message={`${restaurant.name} will be hidden from FoodHub. Your menus stay saved in case you return.`}
        confirmLabel="Remove"
        busy={isDeleting}
      />
    </View>
  );
}
