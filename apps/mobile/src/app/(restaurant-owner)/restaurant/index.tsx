import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';
import {
  SearchInput,
  EmptyState,
  ContentWidth,
  useResponsive,
} from '@/components/owner/kit';

export default function RestaurantsListScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const { data: restaurants, isLoading, refetch } = useMyRestaurants();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => restaurants?.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase())) ?? [],
    [restaurants, search]
  );

  const openCount = restaurants?.filter((r) => r.isOpen).length ?? 0;
  const verifiedCount = restaurants?.filter((r) => r.isVerified).length ?? 0;

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* ─── Header ─── */}
      <View className="bg-white px-4 pb-3 pt-3">
        <View style={{ maxWidth: isTablet ? 688 : undefined, alignSelf: 'center', width: '100%' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-extrabold tracking-tight text-gray-900">My Restaurants</Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                {openCount} open · {verifiedCount} verified
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(restaurant-owner)/restaurant/create')}
              className="h-11 flex-row items-center rounded-full bg-green-600 px-4 active:bg-green-700"
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text className="ml-1 text-sm font-bold text-white">Add</Text>
            </Pressable>
          </View>

          {/* mini stats */}
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1 rounded-xl bg-red-50 p-3">
              <Text className="text-lg font-extrabold text-primary">{restaurants?.length ?? 0}</Text>
              <Text className="text-[11px] font-medium text-red-400">Total stores</Text>
            </View>
            <View className="flex-1 rounded-xl bg-green-50 p-3">
              <Text className="text-lg font-extrabold text-green-600">{openCount}</Text>
              <Text className="text-[11px] font-medium text-green-500">Open now</Text>
            </View>
          </View>

          <View className="mt-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search restaurants…" />
          </View>
        </View>
      </View>

      {/* ─── List ─── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? { gap: 12 } : undefined}
        contentContainerStyle={{ padding: 16, gap: 12, ...ContentWidth(isTablet ? 960 : 9999) }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="package"
              title={search ? 'No matches found' : 'No restaurants yet'}
              message={
                search
                  ? `Nothing matches “${search}”.`
                  : 'Create your first restaurant and start selling on FoodHub.'
              }
              actionLabel={search ? undefined : 'Create Restaurant'}
              onAction={search ? undefined : () => router.push('/(restaurant-owner)/restaurant/create')}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(restaurant-owner)/restaurant/${item.id}` as never)}
            className={`rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100 active:bg-gray-50 ${
              isTablet ? 'flex-1' : ''
            }`}
          >
            {/* cover strip */}
            <View className="h-20 overflow-hidden rounded-t-2xl">
              {item.coverImageUrl ? (
                <Image source={{ uri: item.coverImageUrl }} className="h-full w-full" contentFit="cover" />
              ) : (
                <View className="h-full w-full items-center justify-center bg-green-50">
                  <Feather name="image" size={22} color="#BBF7D0" />
                </View>
              )}
            </View>

            <View className="-mt-7 flex-row items-end justify-between px-4">
              {/* logo */}
              <View className="h-14 w-14 overflow-hidden rounded-2xl border-4 border-white bg-red-50">
                {item.logoUrl ? (
                  <Image source={{ uri: item.logoUrl }} className="h-full w-full" contentFit="cover" />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    <Text className="text-lg font-extrabold text-primary">
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* status badge */}
              <View
                className={`mb-1 flex-row items-center gap-1 rounded-full px-2 py-1 ${
                  item.isOpen ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <View className={`h-1.5 w-1.5 rounded-full ${item.isOpen ? 'bg-green-500' : 'bg-red-400'}`} />
                <Text
                  className={`text-[10px] font-bold ${item.isOpen ? 'text-green-600' : 'text-red-500'}`}
                >
                  {item.isOpen ? 'OPEN' : 'CLOSED'}
                </Text>
              </View>
            </View>

            <View className="px-4 pb-4 pt-2">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-sm font-bold text-gray-900" numberOfLines={1}>
                  {item.name}
                </Text>
                <View className="ml-2 flex-row items-center gap-1">
                  <Feather name="star" size={12} color="#F59E0B" />
                  <Text className="text-xs font-bold text-gray-700">
                    {item.averageRating ? Number(item.averageRating).toFixed(1) : 'New'}
                  </Text>
                </View>
              </View>
              <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                {item.cuisineType} · {item.address}
              </Text>

              <View className="mt-3 flex-row items-center justify-between border-t border-dashed border-gray-100 pt-3">
                <View className="flex-row items-center gap-1.5">
                  <Feather name="clock" size={12} color="#94A3B8" />
                  <Text className="text-[11px] font-medium text-gray-400">
                    {item.openingTime || '--:--'} – {item.closingTime || '--:--'}
                  </Text>
                </View>
                {item.isVerified && (
                  <View className="flex-row items-center gap-1">
                    <Feather name="shield" size={12} color="#16A34A" />
                    <Text className="text-[11px] font-semibold text-green-600">Verified</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={15} color="#CBD5E1" />
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
