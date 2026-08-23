import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  ScreenHeader,
  InfoRow,
  StatCard,
  PrimaryButton,
  LoadingScreen,
  ContentWidth,
  useResponsive,
  rs,
} from '@/components/owner/kit';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTablet } = useResponsive();
  const { data: restaurants, isLoading, refetch } = useMyRestaurants();
  const [isOpenOverride, setIsOpenOverride] = useState<boolean | null>(null);

  const restaurant = restaurants?.find((r) => r.id === id);

  if (isLoading) return <LoadingScreen />;

  if (!restaurant) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Restaurant" />
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="alert-circle" size={44} color="#CBD5E1" />
          <Text className="mt-4 text-base font-bold text-gray-800">Restaurant not found</Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            It may have been removed or you don't have access.
          </Text>
          <Pressable onPress={() => refetch()} className="mt-6 rounded-full bg-primary px-6 py-3">
            <Text className="text-sm font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isOpen = isOpenOverride ?? restaurant.isOpen;
  const toggleOpen = (value: boolean) => setIsOpenOverride(value);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={restaurant.name} subtitle={`Manage · ${restaurant.cuisineType}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ padding: 16 }, ContentWidth(isTablet ? 720 : 9999)]}
      >
        {/* ─── Hero card ─── */}
        <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
          <View className="h-28 w-full bg-green-600/90">
            {restaurant.coverImageUrl ? (
              <Image source={{ uri: restaurant.coverImageUrl }} className="h-full w-full" contentFit="cover" />
            ) : (
              <>
                <View className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/15" />
                <View className="absolute right-14 top-6 h-14 w-14 rounded-full bg-white/10" />
              </>
            )}
          </View>

          <View className="-mt-8 flex-row items-end justify-between px-5">
            <View className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-red-50">
              {restaurant.logoUrl ? (
                <Image source={{ uri: restaurant.logoUrl }} className="h-full w-full" contentFit="cover" />
              ) : (
                <View className="h-full w-full items-center justify-center">
                  <Text className="text-2xl font-extrabold text-primary">
                    {restaurant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* open / closed switch */}
            <View
              className={`mb-1 flex-row items-center gap-1.5 rounded-full px-3 py-2 ${
                isOpen ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <Feather name={isOpen ? 'zap' : 'moon'} size={13} color={isOpen ? '#16A34A' : '#DC2626'} />
              <Text className={`text-[11px] font-bold ${isOpen ? 'text-green-700' : 'text-red-500'}`}>
                {isOpen ? 'Accepting orders' : 'Paused'}
              </Text>
              <Switch
                value={isOpen}
                onValueChange={toggleOpen}
                trackColor={{ false: '#FECACA', true: '#BBF7D0' }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scale: 0.72 }] }}
              />
            </View>
          </View>

          <View className="px-5 pb-5 pt-3">
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
                  <Feather name="shield-check" size={12} color="#16A34A" />
                  <Text className="text-xs font-semibold text-green-600">Verified</Text>
                </View>
              )}
              <View className="flex-row items-center gap-1">
                <Feather name="clock" size={12} color="#94A3B8" />
                <Text className="text-xs text-gray-500">
                  {restaurant.openingTime || '--:--'} – {restaurant.closingTime || '--:--'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Today snapshot ─── */}
        <View className="mt-4 flex-row flex-wrap gap-3">
          <View style={{ width: isTablet ? undefined : '47.5%', flexGrow: 1 }} className="min-w-[150px] grow">
            <StatCard icon="shopping-bag" label="Orders today" value={18} tone="brand" trend="+12%" />
          </View>
          <View style={{ width: isTablet ? undefined : '47.5%', flexGrow: 1 }} className="min-w-[150px] grow">
            <StatCard icon="dollar-sign" label="Sales today" value={rs(9840)} tone="green" trend="+8%" />
          </View>
        </View>

        {/* ─── Store details ─── */}
        <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100">
          <Text className="mb-1 text-[13px] font-bold uppercase tracking-wide text-gray-400">Store details</Text>
          <InfoRow
            icon="map-pin"
            label="Address"
            value={`${restaurant.address}${restaurant.wardNumber ? ` · Ward ${restaurant.wardNumber}` : ''}`}
          />
          <InfoRow icon="phone" label="Phone" value={restaurant.phone || '—'} />
          <InfoRow icon="mail" label="Email" value={restaurant.email || '—'} />
          <InfoRow icon="truck" label="Delivery fee" value={rs(restaurant.deliveryFee)} />
          <InfoRow icon="shopping-cart" label="Min order" value={rs(restaurant.minimumOrderAmount)} />
          <InfoRow
            icon="clock"
            label="Avg prep"
            value={restaurant.estimatedDeliveryTime ? `${restaurant.estimatedDeliveryTime} min` : '—'}
            last
          />
        </View>

        {/* ─── Actions ─── */}
        <View className="mb-8 mt-5 gap-3">
          <PrimaryButton
            label="Edit Restaurant Details"
            variant="green"
            icon="edit-2"
            onPress={() => router.push('/(restaurant-owner)/restaurant/create' as never)}
          />
          <PrimaryButton
            label="View Full Menu"
            variant="outline"
            icon="book-open"
            onPress={() => router.push('/(restaurant-owner)/menu')}
          />
        </View>
      </ScrollView>
    </View>
  );
}
