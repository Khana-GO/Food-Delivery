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
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { menuItemService } from '@/services/owner/menu-item/menu-item.service';
import { useDeleteMenuItem } from '@/hooks/owner/menu-item/useDeleteMenuItem';
import { useToggleAvailability } from '@/hooks/owner/menu-item/useToggleAvailability';
import { MenuItemCard } from '@/components/res-owner/menu-item/MenuItemCard';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import { useCategoriesByRestaurant } from '@/hooks/owner/category/useCategoriesByRestaurant';
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

  // Responsive helpers for stat bar — ensures "Unavailable" fits on 320px screens
  const { width } = useWindowDimensions();
  const isVeryCompact = width < 360;
  const isCompact = width < 380;

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
    icon: React.ComponentProps<typeof Feather>['name'];
    activeClass: string;
    inactiveClass: string;
    textClass: string;
  }[] = [
    {
      key: 'all',
      label: 'Total Items',
      value: totalCount,
      icon: 'layers',
      activeClass: 'border-[#7F1D1D] bg-[#B91C1C] shadow-md',
      inactiveClass: 'border-gray-100 bg-white shadow-sm',
      textClass: 'text-white',
    },
    {
      key: 'available',
      label: 'Available',
      value: availableCount ?? 0,
      icon: 'check-circle',
      activeClass: 'border-[#14532D] bg-[#15803D] shadow-md',
      inactiveClass: 'border-gray-100 bg-white shadow-sm',
      textClass: 'text-white',
    },
    {
      key: 'unavailable',
      label: 'Unavailable',
      value: unavailableCount ?? 0,
      icon: 'x-circle',
      activeClass: 'border-[#7F1D1D] bg-[#B91C1C] shadow-md',
      inactiveClass: 'border-gray-100 bg-white shadow-sm',
      textClass: 'text-white',
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
        <Feather name="package" size={64} color="#D1D5DB" />
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
    <View style={{ flex: 1, backgroundColor: '#F7F7F5' }}>
      {/* Premium crimson header */}
      <View style={{ backgroundColor: '#B5122A', paddingTop: isVeryCompact ? 36 : 44, paddingBottom: 14, paddingHorizontal: isVeryCompact ? 16 : 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8, minWidth: 0 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: isVeryCompact ? 32 : 36, height: isVeryCompact ? 32 : 36, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
            >
              <Feather name="arrow-left" size={isVeryCompact ? 16 : 18} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ width: isVeryCompact ? 32 : 36, height: isVeryCompact ? 32 : 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Feather name="book-open" size={isVeryCompact ? 14 : 16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{ fontSize: isVeryCompact ? 16 : 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 }}
                numberOfLines={1}
              >
                Menu Items
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' }} numberOfLines={1}>
                {totalCount} total dishes
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: isVeryCompact ? 10 : 16, paddingVertical: isVeryCompact ? 8 : 10, borderRadius: 999, gap: 6, shadowColor: '#7F0D1D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}
            onPress={() =>
              router.push({
                pathname: '/(restaurant-owner)/menu/create',
                params: restaurantId ? { restaurantId } : {},
              } as never)
            }
          >
            <Feather name="plus" size={isVeryCompact ? 14 : 16} color="#B5122A" />
            {!isVeryCompact ? <Text style={{ fontSize: 12, fontWeight: '800', color: '#B5122A' }}>Add Item</Text> : null}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Restaurant selector — only shown when the owner has multiple */}
      {hasMultipleRestaurants && (
        <View className="border-b border-gray-100 bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            {restaurants!.map((r) => {
              const isActive = restaurantId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  activeOpacity={0.85}
                  className={`flex-row items-center px-4 py-2.5 border rounded-full shadow-sm ${
                    isActive
                      ? 'bg-[#B91C1C] border-[#7F1D1D] shadow-md'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setSelectedRestaurantId(r.id)}
                >
                  <View className={`h-6 w-6 items-center justify-center rounded-full mr-2 ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <Feather
                      name="shopping-bag"
                      size={12}
                      color={isActive ? '#FFF' : '#64748B'}
                    />
                  </View>
                  <Text
                    className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}
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

      {/* Search — responsive: prevents text cut on 320-360px */}
        <View className="px-4 pt-3 pb-2 bg-gray-50">
          <View
            className={`flex-row items-center bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${
              isVeryCompact ? 'h-11 px-3' : 'h-12 px-4'
            }`}
          >
            <View className={`${isVeryCompact ? 'h-7 w-7' : 'h-8 w-8'} items-center justify-center rounded-full bg-[#FEF2F2] shrink-0`}>
              <Feather name="search" size={isVeryCompact ? 14 : 16} color="#B91C1C" />
            </View>
            <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
              className={`${isVeryCompact ? 'text-[13px]' : 'text-[15px]'} font-normal text-gray-900`}
              placeholder={isVeryCompact ? 'Search dishes...' : isCompact ? 'Search menu...' : 'Search menu items, categories...'}
              placeholderTextColor="#94A3B8"
              style={{ flex: 1, minWidth: 0, marginLeft: isVeryCompact ? 8 : 12, fontWeight: '400', paddingVertical: 0 } as any}
              value={searchInput}
              onChangeText={setSearchInput}
              returnKeyType="search"
              numberOfLines={1}
              allowFontScaling={false}
            />
            {searchInput.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchInput('')}
                className="p-1 ml-2 bg-gray-50 rounded-full shrink-0"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x-circle" size={isVeryCompact ? 16 : 18} color="#94A3B8" />
              </TouchableOpacity>
            ) : (
              <View className={`ml-2 rounded-full bg-gray-50 border border-gray-100 shrink-0 ${isVeryCompact ? 'px-2 py-0.5' : 'px-2.5 py-1'}`}>
                <Text className={`${isVeryCompact ? 'text-[10px]' : 'text-[11px]'} font-bold text-gray-500`} numberOfLines={1} allowFontScaling={false}>
                  {totalCount} items
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats double as availability filters — fully responsive, fits 320px */}
        <View className={`flex-row px-4 ${isVeryCompact ? 'gap-2 py-2' : isCompact ? 'gap-2 py-3' : 'gap-3 py-3'}`}>
          {statCards.map((stat) => {
            const isActive = availability === stat.key;
            return (
              <TouchableOpacity
                key={stat.key}
                activeOpacity={0.85}
                className={`flex-1 min-w-0 flex-row items-center border rounded-2xl overflow-hidden ${
                  isVeryCompact ? 'gap-1.5 p-2' : isCompact ? 'gap-2 p-2.5' : 'gap-3 p-3'
                } ${isActive ? stat.activeClass : stat.inactiveClass}`}
                onPress={() => setAvailability(stat.key)}
              >
                <View
                  className={`items-center justify-center rounded-xl shrink-0 ${isVeryCompact ? 'h-7 w-7' : 'h-9 w-9'} ${
                    isActive ? 'bg-white/20' : stat.key === 'available' ? 'bg-[#DCFCE7]' : stat.key === 'unavailable' ? 'bg-[#FEE2E2]' : 'bg-gray-100'
                  }`}
                >
                  <Feather
                    name={stat.icon}
                    size={isVeryCompact ? 13 : 16}
                    color={isActive ? '#FFFFFF' : stat.key === 'available' ? '#15803D' : stat.key === 'unavailable' ? '#B91C1C' : '#475569'}
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className={`font-extrabold leading-none ${isVeryCompact ? 'text-base' : 'text-lg'} ${isActive ? stat.textClass : 'text-gray-900'}`}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    allowFontScaling={false}
                    className={`font-semibold ${isVeryCompact ? 'text-[9px]' : 'text-[11px]'} ${isActive ? 'text-white/80' : 'text-gray-500'}`}
                  >
                    {stat.label}
                  </Text>
                </View>
                {isActive ? <View className="h-1.5 w-1.5 rounded-full bg-white shrink-0 ml-1" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category chips — professional segmented bar */}
        {categories && categories.length > 0 && (
          <View className="bg-white border-y border-gray-100">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                gap: 8,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                className={`px-4 py-2.5 rounded-full border shadow-sm ${
                  selectedCategory === ''
                    ? 'bg-[#B91C1C] border-[#7F1D1D] shadow-md'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setSelectedCategory('')}
              >
                <Text
                  className={`text-xs font-bold ${selectedCategory === '' ? 'text-white' : 'text-gray-700'}`}
                >
                  All Categories
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.85}
                    className={`px-4 py-2.5 border rounded-full shadow-sm flex-row items-center gap-1.5 ${
                      isActive ? 'bg-[#B91C1C] border-[#7F1D1D] shadow-md' : 'bg-white border-gray-200'
                    }`}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Feather name="tag" size={12} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                    <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
