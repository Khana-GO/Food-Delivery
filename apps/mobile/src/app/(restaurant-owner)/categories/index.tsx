import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAllOwnerCategories } from '@/hooks/category/useAllOwnerCategories';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';
import { useDeleteCategory } from '@/hooks/category/useDeleteCategory';
import { CategoryCard } from '@/components/category/CategoryCard';
import type { Category } from '@food_delivery/types';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  SearchInput,
  EmptyState,
  ConfirmDialog,
  LoadingScreen,
  ContentWidth,
  useResponsive,
} from '@/components/owner/kit';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useAllOwnerCategories(true);
  const { data: restaurants } = useMyRestaurants();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const restaurantMap = useMemo(() => {
    const m = new Map<string, string>();
    restaurants?.forEach((r) => m.set(r.id, r.name));
    return m;
  }, [restaurants]);

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const errorMessage = isError
    ? getApiErrorMessage(
        error,
        "Couldn't load your categories. Check your connection and try again.",
      )
    : null;

  const filtered = useMemo(
    () =>
      categories?.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase()),
      ) ?? [],
    [categories, search],
  );

  const withItemsCount = categories?.filter((c) => (c.itemCount ?? 0) > 0).length ?? 0;
  const emptyCount = (categories?.length ?? 0) - withItemsCount;

  const handleEdit = (category: Category) =>
    router.push(`/(restaurant-owner)/categories/${category.id}/edit` as never);

  const handleCreate = () => router.push('/(restaurant-owner)/categories/create');

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  if (isLoading && !categories) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* ─── Header ─── */}
      <View className="bg-white px-4 pb-3 pt-3">
        <View style={{ maxWidth: isTablet ? 688 : undefined, alignSelf: 'center', width: '100%' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-extrabold tracking-tight text-gray-900">Categories</Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                Organise your menu into sections
              </Text>
            </View>
            <Pressable
              onPress={handleCreate}
              className="h-11 flex-row items-center rounded-full bg-green-600 px-4 active:bg-green-700"
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text className="ml-1 text-sm font-bold text-white">Add</Text>
            </Pressable>
          </View>

          {/* mini stats */}
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1 rounded-xl bg-red-50 p-3">
              <Text className="text-lg font-extrabold text-primary">{categories?.length ?? 0}</Text>
              <Text className="text-[11px] font-medium text-red-400">Total categories</Text>
            </View>
            <View className="flex-1 rounded-xl bg-green-50 p-3">
              <Text className="text-lg font-extrabold text-green-600">{withItemsCount}</Text>
              <Text className="text-[11px] font-medium text-green-500">With items</Text>
            </View>
            <View className="flex-1 rounded-xl bg-slate-100 p-3">
              <Text className="text-lg font-extrabold text-slate-600">{Math.max(emptyCount, 0)}</Text>
              <Text className="text-[11px] font-medium text-slate-400">Empty</Text>
            </View>
          </View>

          <View className="mt-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search categories…" />
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
        ListHeaderComponent={
          isError ? (
            <View className="mb-3 flex-row items-center rounded-2xl border border-red-200 bg-red-50 p-4">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                <Feather name="alert-circle" size={16} color="#DC2626" />
              </View>
              <Text className="ml-3 flex-1 text-xs leading-4 text-red-600">
                {errorMessage}
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => refetch()}
                className="ml-2 rounded-full bg-red-500 px-3 py-1.5 active:bg-red-600"
              >
                <Text className="text-[11px] font-bold text-white">Retry</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading || isError ? null : (
            <EmptyState
              icon="grid"
              title={search ? 'No matches found' : 'No categories yet'}
              message={
                search
                  ? `Nothing matches “${search}”.`
                  : 'Group your dishes into sections like Appetizers, Mains and Drinks.'
              }
              actionLabel={search ? undefined : 'Create Category'}
              onAction={search ? undefined : handleCreate}
            />
          )
        }
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            restaurantName={restaurantMap.get(item.restaurantId)}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        )}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        busy={isDeleting}
        title="Delete category?"
        message={`“${deleteTarget?.name}” will be permanently removed.`}
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
      />
    </View>
  );
}
