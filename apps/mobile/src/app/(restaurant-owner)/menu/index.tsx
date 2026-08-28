import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { menuItemService } from '@/services/menu-item/menu-item.service';
import { useDeleteMenuItem } from '@/hooks/menu-item/useDeleteMenuItem';
import { useToggleAvailability } from '@/hooks/menu-item/useToggleAvailability';
import { MenuItemCard } from '@/components/menu-item/MenuItemCard';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';
import { useCategoriesByRestaurant } from '@/hooks/category/useCategoriesByRestaurant';
import type { MenuItemsResponse } from '@food_delivery/types';
import { menuItemKeys } from '@/lib/query-keys';

const PAGE_SIZE = 10;

type StatFilter = 'all' | 'available' | 'unavailable';

export default function MenuItemsScreen() {
  const { data: restaurants, isLoading: restaurantsLoading } =
    useMyRestaurants();
  const hasMultipleRestaurants = (restaurants?.length ?? 0) > 1;

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | undefined
  >(undefined);
  // Falls back to the owner's first restaurant until they pick one
  const restaurantId = selectedRestaurantId ?? restaurants?.[0]?.id;

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [availability, setAvailability] = useState<StatFilter>('all');

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // When switching restaurant, clear category filter (categories are per-restaurant)
  useEffect(() => {
    setSelectedCategory('');
  }, [restaurantId]);

  const { data: categories } = useCategoriesByRestaurant(restaurantId, false);

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      categoryId: selectedCategory || undefined,
      isAvailable:
        availability === 'all' ? undefined : availability === 'available',
    }),
    [searchQuery, selectedCategory, availability],
  );

  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: menuItemKeys.list(restaurantId, filters),
    queryFn: ({ pageParam }) =>
      menuItemService.getByRestaurant(restaurantId!, {
        ...filters,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: !!restaurantId,
  });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // Lightweight count-only queries so the stats stay correct
  // regardless of the active filter
  const { data: availableCount } = useQuery({
    queryKey: menuItemKeys.stat(restaurantId, 'available'),
    queryFn: () =>
      menuItemService.getByRestaurant(restaurantId!, {
        isAvailable: true,
        limit: 1,
      }),
    enabled: !!restaurantId,
    select: (res: MenuItemsResponse) => res.total,
  });

  const { data: unavailableCount } = useQuery({
    queryKey: menuItemKeys.stat(restaurantId, 'unavailable'),
    queryFn: () =>
      menuItemService.getByRestaurant(restaurantId!, {
        isAvailable: false,
        limit: 1,
      }),
    enabled: !!restaurantId,
    select: (res: MenuItemsResponse) => res.total,
  });

  const totalCount = (availableCount ?? 0) + (unavailableCount ?? 0);

  const { mutate: deleteItem, isPending: isDeleting } = useDeleteMenuItem();
  const { mutate: toggleAvailability, isPending: isToggling } =
    useToggleAvailability();

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Menu Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
      ],
    );
  };

  const handleToggle = (id: string) => {
    toggleAvailability(id);
  };

  const statCards: {
    key: StatFilter;
    label: string;
    value: number;
    activeClass: string;
    textClass: string;
  }[] = [
    {
      key: 'all',
      label: 'Total Items',
      value: totalCount,
      activeClass: 'border-primary bg-primary/5',
      textClass: 'text-black',
    },
    {
      key: 'available',
      label: 'Available',
      value: availableCount ?? 0,
      activeClass: 'border-green-500 bg-green-50',
      textClass: 'text-green-500',
    },
    {
      key: 'unavailable',
      label: 'Unavailable',
      value: unavailableCount ?? 0,
      activeClass: 'border-red-500 bg-red-50',
      textClass: 'text-red-500',
    },
  ];

  if (restaurantsLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  if (!restaurantId) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="store" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">
          No Restaurant Found
        </Text>
        <Text className="mt-1 text-sm text-center text-gray-400">
          Please create a restaurant first to manage menu items.
        </Text>
        <TouchableOpacity
          className="px-6 py-3 mt-6 bg-primary rounded-xl"
          onPress={() =>
            router.push('/(restaurant-owner)/restaurant/create' as never)
          }
        >
          <Text className="font-semibold text-white">Create Restaurant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black" numberOfLines={1}>
              Menu Items
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-primary"
            onPress={() =>
              router.push({
                pathname: '/(restaurant-owner)/menu/create',
                params: restaurantId ? { restaurantId } : {},
              } as never)
            }
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text className="text-sm font-semibold text-white">Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        stickyHeaderIndices={[0]}
      >
        {/* Restaurant selector — only shown when the owner has multiple */}
      {hasMultipleRestaurants && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              gap: 8,
            }}
          >
            {restaurants!.map((r) => {
              const isActive = restaurantId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  className={`flex-row items-center px-4 py-2 border rounded-full ${
                    isActive
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setSelectedRestaurantId(r.id)}
                >
                  <Feather
                    name="shopping-bag"
                    size={14}
                    color={isActive ? '#FFF' : '#64748B'}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-medium ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`}
                    numberOfLines={1}
                  >
                    {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Search */}
        <View className="px-4 pt-4 pb-1 bg-gray-50">
          <View className="flex-row items-center h-12 px-4 bg-white border border-gray-200 rounded-xl">
            <Feather name="search" size={20} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-base text-black"
              placeholder="Search menu items..."
              placeholderTextColor="#94A3B8"
              value={searchInput}
              onChangeText={setSearchInput}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <Feather name="x-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats double as availability filters */}
        <View className="flex-row flex-wrap gap-3 px-4 py-2">
          {statCards.map((stat) => {
            const isActive = availability === stat.key;
            return (
              <TouchableOpacity
                key={stat.key}
                className={`flex-1 min-w-[96px] items-center justify-center p-3 bg-white border rounded-xl ${
                  isActive
                    ? stat.activeClass
                    : 'border-gray-100'
                }`}
                onPress={() => setAvailability(stat.key)}
              >
                <Text
                  className={`text-lg font-bold ${isActive ? stat.textClass : 'text-black'}`}
                >
                  {stat.value}
                </Text>
                <Text className="text-xs text-gray-500">{stat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category chips */}
        {categories && categories.length > 0 && (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                gap: 8,
              }}
            >
              <TouchableOpacity
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === ''
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setSelectedCategory('')}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedCategory === '' ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  All Categories
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className={`px-4 py-2 border rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      selectedCategory === cat.id
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* List */}
        <View className="px-4 pt-1">
          {items.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Feather name="menu" size={64} color="#D1D5DB" />
              <Text className="mt-4 text-lg font-medium text-gray-400">
                {searchQuery || selectedCategory || availability !== 'all'
                  ? 'No items found'
                  : 'No Menu Items'}
              </Text>
              <Text className="mt-1 text-sm text-center text-gray-400">
                {searchQuery || selectedCategory || availability !== 'all'
                  ? 'Try changing the search or filters'
                  : 'Add your first menu item'}
              </Text>
              {!searchQuery &&
                !selectedCategory &&
                availability === 'all' && (
                  <TouchableOpacity
                    className="px-6 py-3 mt-6 bg-primary rounded-xl"
                    onPress={() =>
                      router.push({
                        pathname: '/(restaurant-owner)/menu/create',
                        params: restaurantId ? { restaurantId } : {},
                      } as never)
                    }
                  >
                    <Text className="font-semibold text-white">Add Item</Text>
                  </TouchableOpacity>
                )}
            </View>
          ) : (
            <>
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onToggleAvailability={handleToggle}
                />
              ))}
              {hasNextPage && (
                <TouchableOpacity
                  className="items-center py-3 mb-3 bg-white border border-gray-200 rounded-xl"
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color="#E23744" />
                  ) : (
                    <Text className="text-sm font-semibold text-primary">
                      Load More
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
          <View className="h-6" />
        </View>
      </ScrollView>

      {/* Loading overlay for async actions */}
      {(isDeleting || isToggling) && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="#E23744" />
        </View>
      )}
    </View>
  );
}
