import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAdminRestaurants } from '@/hooks/admin/restaurant/useAdminRestaurants';
import { useDeletedRestaurants } from '@/hooks/admin/restaurant/useDeletedRestaurants';
import { useAdminRestaurantStats } from '@/hooks/admin/restaurant/useAdminRestaurantStats';
import { RestaurantCard } from '@/components/admin/restaurants/RestaurantCard';
import { Colors, Radius, Shadow } from '@/constants/theme';

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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} tintColor={Colors.primary} colors={[Colors.primary]} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const close = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (close) handleLoadMore();
        }}
        scrollEventThrottle={200}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Ultra-compact header 36/12 */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: 36,
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.25)',
                }}
              >
                <Feather name="home" size={14} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>Restaurants</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '600', marginTop: 1 }} numberOfLines={1}>
                  {stats ? `${stats.total} total • ${stats.active} active • ${stats.verified} verified` : `${total} restaurants`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/restaurants/create' as any)}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm }}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search ultra-compact */}
          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.14)',
              borderRadius: Radius.xl,
              paddingHorizontal: 10,
              height: 40,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Feather name="search" size={14} color={Colors.white} />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 12, color: Colors.white }}
              placeholder="Search name, address, slug…"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchInput}
              onChangeText={setSearchInput}
              autoCapitalize="none"
            />
            {searchInput.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <Feather name="x-circle" size={16} color={Colors.white} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Stats pills ultra-compact padding 8 */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {[
              { label: 'Total', value: stats?.total ?? total },
              { label: 'Active', value: stats?.active ?? 0 },
              { label: 'Verified', value: stats?.verified ?? 0 },
            ].map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  borderRadius: Radius.xl,
                  padding: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>{s.value}</Text>
                <Text style={{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5, marginTop: 2 }}>{s.label.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {/* Status tabs ultra-compact */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, alignItems: 'center' }}>
            {(['all', 'active', 'deleted'] as const).map((v) => {
              const active = status === v;
              return (
                <TouchableOpacity
                  key={v}
                  onPress={() => setStatus(v)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: Radius.full,
                    backgroundColor: active ? Colors.white : 'rgba(255,255,255,0.18)',
                    borderWidth: 1,
                    borderColor: active ? Colors.white : 'rgba(255,255,255,0.25)',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: active ? Colors.primary : Colors.white }}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={() => { setSearchInput(''); setCuisine(undefined); setVerified(undefined); setStatus('all'); }} style={{ marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white }}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters ultra-compact */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 16 }}>
            {CUISINES.map((c) => {
              const active = (c === 'All' && !cuisine) || cuisine === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCuisine(c === 'All' ? undefined : c)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: Radius.full,
                    backgroundColor: active ? Colors.primary : Colors.white,
                    borderWidth: 1,
                    borderColor: active ? Colors.primary : Colors.borderLight,
                    ...Shadow.sm,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: active ? Colors.white : Colors.textSecondary }}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            {[
              { label: 'All', value: undefined },
              { label: 'Verified', value: true },
              { label: 'Pending', value: false },
            ].map((o) => (
              <TouchableOpacity
                key={String(o.label)}
                onPress={() => setVerified(o.value as any)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: Radius.full,
                  backgroundColor: verified === o.value ? Colors.primary : Colors.white,
                  borderWidth: 1,
                  borderColor: verified === o.value ? Colors.primary : Colors.borderLight,
                  ...Shadow.sm,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: verified === o.value ? Colors.white : Colors.textSecondary }}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 12, fontSize: 13, color: Colors.textTertiary }}>Loading restaurants…</Text>
            </View>
          ) : restaurants.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48, backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm, marginTop: 8 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                <Feather name="search" size={28} color={Colors.primary} />
              </View>
              <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '700', color: Colors.textDark }}>No restaurants found</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24 }}>{search ? 'Try a different term or clear filters' : 'No restaurants match the current filters'}</Text>
              {(search || cuisine || verified !== undefined) && (
                <TouchableOpacity onPress={() => { setSearchInput(''); setCuisine(undefined); setVerified(undefined); }} style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.primary }} activeOpacity={0.7}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {restaurants.map((r: any) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
              {page < totalPages && (
                <TouchableOpacity onPress={handleLoadMore} disabled={isFetching} style={{ alignItems: 'center', paddingVertical: 12, marginTop: 8, backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }} activeOpacity={0.7}>
                  {isFetching ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Load more • {total - restaurants.length} left</Text>}
                </TouchableOpacity>
              )}
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ fontSize: 11, color: Colors.textTertiary }}>Page {page} of {totalPages} • {total} restaurants</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
