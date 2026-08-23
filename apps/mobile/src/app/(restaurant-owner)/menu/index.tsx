import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FilterChip,
  SearchInput,
  EmptyState,
  ConfirmDialog,
  ContentWidth,
  useResponsive,
  rs,
} from '@/components/owner/kit';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    name: 'Chicken Momo',
    description: 'Steamed chicken dumplings with spicy sesame chutney',
    price: 299,
    category: 'Appetizers',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Garlic Naan',
    description: 'Fresh baked naan brushed with garlic butter',
    price: 99,
    category: 'Breads',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Chicken Biryani',
    description: 'Fragrant spiced rice layered with tender chicken',
    price: 449,
    category: 'Main Course',
    isAvailable: false,
  },
  {
    id: '4',
    name: 'Mango Lassi',
    description: 'Sweet creamy mango yogurt drink',
    price: 159,
    category: 'Beverages',
    isAvailable: true,
  },
];

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const categories = useMemo(() => ['All', ...new Set(items.map((i) => i.category))], [items]);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
        const matchesCategory = category === 'All' || i.category === category;
        return matchesSearch && matchesCategory;
      }),
    [items, search, category]
  );

  const availableCount = items.filter((i) => i.isAvailable).length;

  const toggleAvailability = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i)));

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
    Alert.alert('Deleted', 'The menu item was removed.');
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* ─── Header ─── */}
      <View className="bg-white px-4 pb-3 pt-3">
        <View style={{ maxWidth: isTablet ? 688 : undefined, alignSelf: 'center', width: '100%' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-extrabold tracking-tight text-gray-900">Menu</Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                {availableCount} of {items.length} dishes available
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => router.push('/(restaurant-owner)/categories')}
                className="h-11 w-11 items-center justify-center rounded-full border border-gray-200 active:bg-gray-50"
              >
                <Feather name="grid" size={18} color="#475569" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(restaurant-owner)/menu/create')}
                className="h-11 flex-row items-center rounded-full bg-green-600 px-4 active:bg-green-700"
              >
                <Feather name="plus" size={16} color="#FFFFFF" />
                <Text className="ml-1 text-sm font-bold text-white">Add</Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search your menu…" />
          </View>
        </View>

        {/* ─── Category chips ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ alignSelf: 'center', paddingHorizontal: 16 }}
        >
          {categories.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      {/* ─── Items ─── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12, ...ContentWidth(isTablet ? 960 : 9999) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="book-open"
            title="No menu items"
            message={
              search || category !== 'All'
                ? 'Nothing matches this filter.'
                : 'Add your first dish and it will appear here.'
            }
            actionLabel="Add Menu Item"
            onAction={() => router.push('/(restaurant-owner)/menu/create')}
          />
        ) : (
          filtered.map((item) => (
            <View
              key={item.id}
              className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm shadow-gray-100"
            >
              <View className="flex-row">
                {/* thumb */}
                <View className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} className="h-full w-full" resizeMode="cover" />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-green-50">
                      <Feather name="image" size={22} color="#86EFAC" />
                    </View>
                  )}
                </View>

                {/* info */}
                <View className="ml-3 flex-1">
                  <View className="flex-row items-start justify-between">
                    <Text className="flex-1 pr-2 text-[15px] font-bold text-gray-900" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-[15px] font-extrabold text-green-600">{rs(item.price)}</Text>
                  </View>
                  <Text className="mt-0.5 text-xs leading-4 text-gray-400" numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View className="mt-1.5 flex-row items-center gap-2">
                    <View className="rounded-md bg-slate-100 px-2 py-0.5">
                      <Text className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {item.category}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.isAvailable ? 'bg-green-500' : 'bg-red-400'
                        }`}
                      />
                      <Text
                        className={`text-[11px] font-semibold ${
                          item.isAvailable ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {item.isAvailable ? 'In stock' : 'Sold out'}
                      </Text>
                    </View>
                  </View>

                  {/* actions */}
                  <View className="mt-2 flex-row items-center gap-2">
                    <Pressable
                      onPress={() => toggleAvailability(item.id)}
                      className={`rounded-lg px-2.5 py-1.5 active:opacity-80 ${
                        item.isAvailable ? 'bg-red-50' : 'bg-green-50'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          item.isAvailable ? 'text-red-500' : 'text-green-600'
                        }`}
                      >
                        {item.isAvailable ? 'Mark sold out' : 'Restock'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push(`/(restaurant-owner)/menu/${item.id}/edit` as never)}
                      className="rounded-lg bg-slate-100 px-2.5 py-1.5 active:bg-slate-200"
                    >
                      <Text className="text-[11px] font-bold text-slate-600">Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setDeleteTarget(item)}
                      className="rounded-lg bg-red-50 px-2 py-1.5 active:bg-red-100"
                    >
                      <Feather name="trash-2" size={13} color="#DC2626" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-1" />
      </ScrollView>

      {/* floating add button (mobile) */}
      {!isTablet && (
        <Pressable
          onPress={() => router.push('/(restaurant-owner)/menu/create')}
          className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-90"
          style={{ elevation: 8, shadowColor: '#E23744', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete menu item?"
        message={`“${deleteTarget?.name}” will be permanently removed from your menu.`}
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
      />
    </View>
  );
}
