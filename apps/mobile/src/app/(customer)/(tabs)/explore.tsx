import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { RestaurantCard } from '@/components/customer/RestaurantCard';
import { CategoryChip } from '@/components/customer/CategoryChip';
import { CardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useDashboard } from '@/hooks/customer/useDashboard';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { useAddFavorite } from '@/hooks/customer/useAddFavorite';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { getCategoryIcon } from '@/utils/categoryIcons';
import {
  matchesCategoryName,
  restaurantMatchesQuery,
} from '@/utils/searchText';
import {
  MIN_SEARCH_LENGTH,
  searchService,
  type DishSearchResult,
  type UnifiedSearchResponse,
} from '@/services/customer/search.service';

const FILTERS = ['Fast Delivery', 'Top Rated', 'Free Delivery'];

const EMPTY_RESULTS: UnifiedSearchResponse = {
  query: '',
  restaurants: [],
  dishes: [],
  counts: { restaurants: 0, dishes: 0 },
  didYouMean: [],
  suggestions: [],
};

/** True for an intentionally aborted request (typing fast / screen left). */
const isAborted = (error: any) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'AbortError';

export default function Explore() {
  const params = useLocalSearchParams<{ q?: string; categoryId?: string }>();
  const [q, setQ] = useState(params.q || '');
  const [debouncedQ, setDebouncedQ] = useState(params.q?.trim() || '');
  const [results, setResults] = useState<UnifiedSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [cat, setCat] = useState<string | null>(params.categoryId || null);

  // Only the latest search request may write state — older ones are aborted.
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    if (params.q !== undefined && params.q !== q) {
      setQ(params.q);
      setDebouncedQ(params.q.trim());
    }
    if (params.categoryId !== undefined && params.categoryId !== cat) {
      setCat(params.categoryId || null);
    }
  }, [params.q, params.categoryId]);

  const { refetch, isRefetching } = useDashboard();
  const { popularRestaurants, recommendations, categories, sections, isLoading } = useDashboardStore();
  const { favoriteIds } = useFavoritesStore();
  const { mutate: addFav } = useAddFavorite() as any;
  const { mutate: remFav } = useRemoveFavorite() as any;

  // ─── Caller location from the default saved address ───
  // Uses data the app already has, so no extra permission prompt is triggered.
  const { data: addresses } = useAddresses();
  const origin = useMemo(() => {
    const list = (addresses as any[]) || [];
    const preferred = list.find((a) => a?.isDefault) || list[0];
    const lat = Number(preferred?.latitude);
    const lng = Number(preferred?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return { lat, lng };
  }, [addresses]);

  // Debounce search input to eliminate typing stutter/lag
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [q]);

  // ─── Unified search: restaurants + dishes in one cancellable request ───
  useEffect(() => {
    inFlight.current?.abort();

    if (debouncedQ.length < MIN_SEARCH_LENGTH) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    inFlight.current = controller;
    setIsSearching(true);

    searchService
      .search({
        q: debouncedQ,
        limit: 24,
        lat: origin?.lat,
        lng: origin?.lng,
        signal: controller.signal,
      })
      .then((data) => {
        if (!controller.signal.aborted) setResults(data);
      })
      .catch((error) => {
        if (isAborted(error)) return;
        if (!controller.signal.aborted) setResults(EMPTY_RESULTS);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQ, origin?.lat, origin?.lng]);

  // ─── Default discovery feed ───
  // Built from the API's data-driven rows in priority order (near you, trending,
  // top rated, fast delivery, cafes, budget, recently added), then personalised
  // and popular picks. Deduped so a restaurant never appears twice.
  const feed = useMemo(() => {
    const ordered: any[] = [];
    const seen = new Set<string>();
    const push = (list?: any[]) => {
      for (const item of list || []) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        ordered.push(item);
      }
    };
    push((sections || []).flatMap((s) => s.restaurants));
    push(recommendations);
    push(popularRestaurants);
    return ordered;
  }, [sections, recommendations, popularRestaurants]);

  const all = useMemo(
    () => (results ? results.restaurants : feed),
    [results, feed],
  );

  // Selected category meta
  const catMeta = useMemo(() => categories.find((c) => c.id === cat), [categories, cat]);
  const catNameLower = catMeta?.name.toLowerCase().trim() || null;

  const toggleFilter = useCallback((f: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    return all.filter((r) => {
      // Local match only when the API did not answer (query below the minimum
      // length): typo/plural/synonym tolerant, same rules as the backend.
      if (!results && debouncedQ && !restaurantMatchesQuery(r as any, debouncedQ)) {
        return false;
      }

      // Category filter match
      if (cat && catNameLower) {
        const hasCategory = (r.categories || []).some((c: any) => {
          if (c.id === cat) return true;
          return matchesCategoryName(c.name, catNameLower);
        });
        const cuisineMatch = matchesCategoryName(r.cuisineType, catNameLower);
        const nameMatch =
          matchesCategoryName(r.name, catNameLower) ||
          matchesCategoryName(r.description, catNameLower);
        if (!hasCategory && !cuisineMatch && !nameMatch) return false;
      }

      // Multi-select filters
      for (const f of selectedFilters) {
        if (f === 'Fast Delivery' && (r.estimatedDeliveryTime ?? 99) > 30) return false;
        if (f === 'Top Rated') {
          const rating = Number(r.averageRating ?? 0) || 0;
          if (rating < 3.5) return false;
        }
        if (f === 'Free Delivery' && Number(r.deliveryFee ?? 1) !== 0) return false;
      }

      return true;
    });
  }, [all, results, debouncedQ, cat, catNameLower, selectedFilters]);

  // Dish results respect the same category chip as the restaurant list.
  const dishResults = useMemo(() => {
    const dishes: DishSearchResult[] = results?.dishes || [];
    if (!cat || !catNameLower) return dishes;
    return dishes.filter((d) => matchesCategoryName(d.categoryName, catNameLower));
  }, [results, cat, catNameLower]);

  const toggle = useCallback(
    (id: string) => {
      if (favoriteIds.has(id)) remFav(id);
      else addFav(id);
    },
    [favoriteIds, addFav, remFav]
  );

  const clearAllFilters = useCallback(() => {
    setQ('');
    setDebouncedQ('');
    setResults(null);
    setCat(null);
    setSelectedFilters(new Set());
  }, []);

  const clearSearch = useCallback(() => {
    inFlight.current?.abort();
    setQ('');
    setDebouncedQ('');
    setResults(null);
    setIsSearching(false);
  }, []);

  const noMatches =
    !isLoading && !isSearching && filtered.length === 0 && dishResults.length === 0;
  const didYouMean = results?.didYouMean?.[0];
  const suggestionChips = (results?.suggestions || [])
    .map((s) => s.label)
    .filter((label) => label && label.toLowerCase() !== (results?.query || '').toLowerCase())
    .slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Find your next favourite meal in Butwal</Text>
          <View style={styles.search}>
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput
              selectionColor="rgba(15,23,42,0.16)"
              cursorColor="#334155"
              value={q}
              onChangeText={setQ}
              placeholder="Search restaurants, cafes, cuisines..."
              placeholderTextColor="#94A3B8"
              style={styles.input}
              allowFontScaling={false}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : q.length ? (
              <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }} bounces={false}>
            {FILTERS.map((f) => (
              <TouchableOpacity key={f} onPress={() => toggleFilter(f)} style={[styles.filterPill, selectedFilters.has(f) && styles.filterActive]}>
                <Text style={[styles.filterText, selectedFilters.has(f) && styles.filterTextActive]}>{f}</Text>
                {selectedFilters.has(f) ? <Feather name="check" size={12} color={Colors.primary} /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>

      {categories.length ? (
        <View style={{ paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} bounces={false}>
            <CategoryChip
              label="All"
              icon="🍽️"
              isSelected={cat === null}
              onPress={() => setCat(null)}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.name}
                icon={getCategoryIcon(c.name)}
                isSelected={cat === c.id}
                onPress={() => setCat(cat === c.id ? null : c.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, paddingBottom: 24, gap: 8 }}
        removeClippedSubviews={true}
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={() => refetch()} tintColor={Colors.primary} />}
      >
        {(isLoading && !all.length) || isSearching ? <CardSkeleton count={4} variant="list" /> : null}

        {/* ─── Dish results: go straight to the dish, or into its restaurant ─── */}
        {!isSearching && dishResults.length > 0 ? (
          <View style={{ paddingTop: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 }}>
                Dishes for “{results?.query}”
              </Text>
              <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: '#FECACA' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.primary }}>{dishResults.length} items</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }} bounces={false}>
              {dishResults.slice(0, 12).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/(customer)/menu/${item.id}` as any)}
                  style={{
                    width: 172,
                    backgroundColor: '#FFFFFF',
                    borderRadius: Radius.xl,
                    overflow: 'hidden',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: '#E2E8F0',
                    ...Shadow.sm,
                  }}
                >
                  <View style={{ height: 132, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} cachePolicy="memory-disk" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7Rj~qofM{WB' }} />
                    ) : (
                      <Text style={{ fontSize: 30 }}>{getCategoryIcon(item.categoryName || item.name)}</Text>
                    )}
                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primaryDark }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>Rs. {item.price}</Text>
                    </View>
                    {!item.restaurantIsOpen ? (
                      <View style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textSecondary }}>Closed</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ padding: 12, paddingBottom: 10 }}>
                    <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 }}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => router.push(`/(customer)/restaurant/${item.restaurantId}` as any)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                    >
                      <Feather name="map-pin" size={10} color={Colors.textTertiary} />
                      <Text numberOfLines={1} style={{ flex: 1, fontSize: 11, color: Colors.textSecondary, fontWeight: '500' }}>
                        {item.restaurantName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* ─── Restaurant results ─── */}
        {!isSearching && filtered.length > 0 ? (
          results && results.query ? (
            <View style={{ paddingTop: 12, paddingHorizontal: 2, marginBottom: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 }}>
                Restaurants for “{results.query}”
              </Text>
            </View>
          ) : null
        ) : null}

        {noMatches ? (
          <View>
            <EmptyState
              icon="search"
              title="No matches found"
              description={
                debouncedQ
                  ? didYouMean
                    ? `No exact results for “${debouncedQ}”. Did you mean “${didYouMean}”?`
                    : `No results for “${debouncedQ}”. Try another dish, cuisine or restaurant name.`
                  : 'Try adjusting filters or search terms.'
              }
              actionLabel="Clear filters"
              onAction={clearAllFilters}
            />
            {suggestionChips.length > 0 ? (
              <View style={{ marginTop: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10, paddingHorizontal: 2 }}>
                  {debouncedQ ? 'Try searching for' : 'Popular right now'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} bounces={false}>
                  {didYouMean ? (
                    <CategoryChip
                      label={didYouMean}
                      icon={getCategoryIcon(didYouMean)}
                      isSelected={false}
                      onPress={() => setQ(didYouMean)}
                    />
                  ) : null}
                  {suggestionChips
                    .filter((label) => label.toLowerCase() !== (didYouMean || '').toLowerCase())
                    .map((label) => (
                      <CategoryChip
                        key={label}
                        label={label}
                        icon={getCategoryIcon(label)}
                        isSelected={false}
                        onPress={() => setQ(label)}
                      />
                    ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}

        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r as any} isFavorite={favoriteIds.has(r.id)} onToggleFavorite={toggle} variant="list" />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'], ...Shadow.primaryLg },
  title: { fontSize: 19, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 10,
    ...Shadow.sm,
  },
  input: { flex: 1, fontSize: 13, color: Colors.textDark, paddingVertical: 0 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  filterActive: { backgroundColor: Colors.white, borderColor: Colors.white },
  filterText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  filterTextActive: { color: Colors.primary },
});
