import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAdminRestaurants } from '@/hooks/admin/useAdminRestaurants';
import { useDeletedRestaurants } from '@/hooks/admin/useDeletedRestaurants';
import { useAdminRestaurantStats } from '@/hooks/admin/useAdminRestaurantStats';
import { RestaurantCard } from '@/components/admin/restaurants/RestaurantCard';

const CUISINES = ['All', 'Nepali', 'Newari', 'Thakali', 'Indian', 'Chinese', 'Tibetan', 'Italian', 'Fast Food', 'Continental', 'Street Food', 'Bakeries', 'Desserts', 'Drinks'];

export default function AdminRestaurantsScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState<string | undefined>();
  const [status, setStatus] = useState<'all' | 'active' | 'deleted'>('all');
  const [verified, setVerified] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => setPage(1), [cuisine, verified, status]);

  const filters = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      cuisineType: cuisine,
      isVerified: verified,
      isActive: status === 'active' ? true : status === 'deleted' ? undefined : undefined,
    }),
    [page, limit, search, cuisine, verified, status]
  );

  const isDeletedTab = status === 'deleted';

  //  Fix: Hooks must be called unconditionally (Rules of Hooks)
  const activeQuery = useAdminRestaurants(filters as any, { enabled: !isDeletedTab });
  const deletedQuery = useDeletedRestaurants(filters as any, { enabled: isDeletedTab });
  const query = isDeletedTab ? deletedQuery : activeQuery;
  const { data, isLoading, isFetching, refetch } = query as any;

  const { data: stats } = useAdminRestaurantStats();

  const restaurants = data?.data || [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleLoadMore = () => {
    if (!isFetching && page < totalPages) setPage((p) => p + 1);
  };

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-black text-[#0F172A]">Restaurants</Text>
            <Text className="mt-1 text-xs text-gray-500">
              {stats ? `${stats.total} total • ${stats.active} active • ${stats.verified} verified` : `${total} restaurants`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/restaurants/create' as any)}
            className="w-10 h-10 rounded-full bg-[#0F172A] items-center justify-center"
          >
            <Feather name="plus" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {[
            { label: 'Total', value: stats?.total ?? total, color: '#0F172A', bg: '#F8FAFC' },
            { label: 'Active', value: stats?.active ?? 0, color: '#16A34A', bg: '#ECFDF5' },
            { label: 'Verified', value: stats?.verified ?? 0, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Open', value: stats?.open ?? 0, color: '#0E9F6E', bg: '#ECFDF5' },
            { label: 'Deleted', value: stats?.deleted ?? 0, color: '#DC2626', bg: '#FEF2F2' },
          ].map((s) => (
            <View key={s.label} className="px-4 py-2.5 rounded-2xl border border-gray-100 min-w-[84px]" style={{ backgroundColor: s.bg }}>
              <Text className="text-[15px] font-black" style={{ color: s.color }}>{s.value}</Text>
              <Text className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{s.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Search */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center h-12 px-4 bg-white border border-gray-200 rounded-2xl">
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 text-sm text-[#0F172A]"
            placeholder="Search name, address, slug…"
            placeholderTextColor="#94A3B8"
            value={searchInput}
            onChangeText={setSearchInput}
            autoCapitalize="none"
          />
          {searchInput.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchInput('')}>
              <Feather name="x-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status tabs */}
      <View className="flex-row gap-2 px-4 pt-3">
        {(['all', 'active', 'deleted'] as const).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setStatus(v)}
            className={`px-4 py-2 rounded-full border ${status === v ? 'bg-[#0F172A] border-[#0F172A]' : 'bg-white border-gray-200'}`}
          >
            <Text className={`text-xs font-black ${status === v ? 'text-white' : 'text-gray-600'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => { setSearchInput(''); setCuisine(undefined); setVerified(undefined); setStatus('all'); }} className="px-3 py-2 ml-auto">
          <Text className="text-xs font-black text-primary">Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="px-4 pt-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {CUISINES.map((c) => {
            const active = (c === 'All' && !cuisine) || cuisine === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCuisine(c === 'All' ? undefined : c)}
                className={`px-3.5 py-1.5 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-600'}`}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="flex-row gap-2 mt-2.5">
          {[
            { label: 'All', value: undefined },
            { label: 'Verified', value: true },
            { label: 'Pending', value: false },
          ].map((o) => (
            <TouchableOpacity
              key={String(o.label)}
              onPress={() => setVerified(o.value as any)}
              className={`px-3.5 py-1.5 rounded-full border ${verified === o.value ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-bold ${verified === o.value ? 'text-white' : 'text-gray-600'}`}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List – single loading only */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} tintColor="#0F172A" />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const close = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (close) handleLoadMore();
        }}
        scrollEventThrottle={200}
      >
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#0F172A" />
            <Text className="mt-3 text-sm text-gray-400">Loading restaurants…</Text>
          </View>
        ) : restaurants.length === 0 ? (
          <View className="items-center py-16">
            <View className="items-center justify-center w-20 h-20 bg-gray-100 rounded-full">
              <Feather name="search" size={28} color="#94A3B8" />
            </View>
            <Text className="mt-4 text-base font-black text-gray-700">No restaurants found</Text>
            <Text className="px-8 mt-1 text-sm text-center text-gray-400">{search ? 'Try a different term or clear filters' : 'No restaurants match the current filters'}</Text>
            {(search || cuisine || verified !== undefined) && (
              <TouchableOpacity onPress={() => { setSearchInput(''); setCuisine(undefined); setVerified(undefined); }} className="mt-4 px-5 py-2.5 bg-white border border-gray-200 rounded-full">
                <Text className="text-sm font-black text-[#0F172A]">Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {restaurants.map((r: any) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
            {page < totalPages && (
              <TouchableOpacity
                onPress={handleLoadMore}
                disabled={isFetching}
                className="items-center py-3.5 mb-2 bg-white border border-gray-200 rounded-2xl"
              >
                {isFetching ? <ActivityIndicator size="small" color="#0F172A" /> : <Text className="text-sm font-black text-[#0F172A]">Load more • {total - restaurants.length} left</Text>}
              </TouchableOpacity>
            )}
            <View className="items-center py-3">
              <Text className="text-[11px] text-gray-400 font-medium">Page {page} of {totalPages} • {total} restaurants</Text>
            </View>
          </>
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
