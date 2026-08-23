import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  ScreenHeader,
  SearchInput,
  EmptyState,
  ConfirmDialog,
  ContentWidth,
  useResponsive,
} from '@/components/owner/kit';

interface Category {
  id: string;
  name: string;
  itemCount: number;
  isActive: boolean;
}

const INITIAL: Category[] = [
  { id: '1', name: 'Appetizers', itemCount: 12, isActive: true },
  { id: '2', name: 'Main Course', itemCount: 18, isActive: true },
  { id: '3', name: 'Beverages', itemCount: 8, isActive: false },
  { id: '4', name: 'Desserts', itemCount: 10, isActive: true },
];

export default function CategoriesScreen() {
  const { isTablet } = useResponsive();
  const [categories, setCategories] = useState(INITIAL);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const filtered = useMemo(
    () =>
      categories.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase())),
    [categories, search]
  );

  const toggleStatus = (id: string) =>
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    Alert.alert('Deleted', 'The category was removed.');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Categories"
        subtitle={`${categories.length} groups · ${categories.filter((c) => c.isActive).length} active`}
        right={
          <Pressable
            onPress={() => router.push('/(restaurant-owner)/categories/create')}
            className="flex-row items-center rounded-full bg-green-600 px-4 py-2.5 active:bg-green-700"
          >
            <Feather name="plus" size={15} color="#FFFFFF" />
            <Text className="ml-1 text-xs font-bold text-white">New</Text>
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12, ...ContentWidth(isTablet ? 720 : 9999) }}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories…" />

        {filtered.length === 0 ? (
          <EmptyState
            icon="grid"
            title="No categories"
            message={
              search
                ? `Nothing matches “${search}”.`
                : 'Group your dishes into categories so customers can browse easily.'
            }
            actionLabel="Create Category"
            onAction={() => router.push('/(restaurant-owner)/categories/create')}
          />
        ) : (
          filtered.map((cat) => (
            <View
              key={cat.id}
              className="flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100"
            >
              {/* icon tile */}
              <View
                className={`h-12 w-12 items-center justify-center rounded-xl ${
                  cat.isActive ? 'bg-green-50' : 'bg-slate-100'
                }`}
              >
                <Feather name="grid" size={19} color={cat.isActive ? '#16A34A' : '#94A3B8'} />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-gray-900">{cat.name}</Text>
                <Text className="mt-0.5 text-xs text-gray-400">{cat.itemCount} items</Text>
                <View className="mt-1.5 flex-row items-center gap-1">
                  <View
                    className={`h-1.5 w-1.5 rounded-full ${
                      cat.isActive ? 'bg-green-500' : 'bg-red-400'
                    }`}
                  />
                  <Text
                    className={`text-[11px] font-semibold ${
                      cat.isActive ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {cat.isActive ? 'Visible to customers' : 'Hidden'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => toggleStatus(cat.id)}
                  className={`rounded-lg px-2.5 py-1.5 active:opacity-80 ${
                    cat.isActive ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      cat.isActive ? 'text-red-500' : 'text-green-600'
                    }`}
                  >
                    {cat.isActive ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/(restaurant-owner)/categories/${cat.id}/edit` as never)}
                  className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100 active:bg-slate-200"
                >
                  <Feather name="edit-2" size={14} color="#475569" />
                </Pressable>
                <Pressable
                  onPress={() => setDeleteTarget(cat)}
                  className="h-9 w-9 items-center justify-center rounded-lg bg-red-50 active:bg-red-100"
                >
                  <Feather name="trash-2" size={14} color="#DC2626" />
                </Pressable>
              </View>
            </View>
          ))
        )}
        <View className="h-1" />
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        message={`“${deleteTarget?.name}” will be removed. Items in it will become uncategorised.`}
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
      />
    </View>
  );
}
