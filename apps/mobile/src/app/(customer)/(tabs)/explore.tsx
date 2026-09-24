import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { RestaurantCard } from '@/components/customer/RestaurantCard';
import { CategoryChip } from '@/components/customer/CategoryChip';
import { DishSearchCard } from '@/components/customer/DishSearchCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useDashboard } from '@/hooks/customer/useDashboard';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { useAddFavorite } from '@/hooks/customer/useAddFavorite';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { useSearchHistory } from '@/hooks/customer/useSearchHistory';
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
  type SearchSuggestion,
  type UnifiedSearchResponse,
} from '@/services/customer/search.service';

const FILTERS = ['Fast Delivery', 'Top Rated', 'Free Delivery'];
type SearchTab = 'all' | 'dishes' | 'restaurants';

const EMPTY_RESULTS: UnifiedSearchResponse = {
  query: '',
  restaurants: [],
  dishes: [],
  counts: { restaurants: 0, dishes: 0 },
  didYouMean: [],
  suggestions: [],
};

const isAborted = (error: any) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'AbortError';

export default function Explore() {
  const params = useLocalSearchParams<{ q?: string; categoryId?: string; focus?: string }>();
  const [q, setQ] = useState(params.q || '');
  const [debouncedQ, setDebouncedQ] = useState(params.q?.trim() || '');
  const [results, setResults] = useState<UnifiedSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [cat, setCat] = useState<string | null>(params.categoryId || null);
  const [isFocused, setIsFocused] = useState(false);

  // Suggestions state
  const [liveSuggestions, setLiveSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const inFlight = useRef<AbortController | null>(null);
  const suggestInFlight = useRef<AbortController | null>(null);

  const { recentSearches, addSearch, removeSearch, clearHistory, popularSearches } = useSearchHistory();

  useEffect(() => {
    if (params.q !== undefined && params.q !== q) {
      setQ(params.q);
      setDebouncedQ(params.q.trim());
    }
    if (params.categoryId !== undefined && params.categoryId !== cat) {
      setCat(params.categoryId || null);
    }
    if (params.focus === 'true') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [params.q, params.categoryId, params.focus]);

  const { refetch, isRefetching } = useDashboard();
  const { popularRestaurants, recommendations, categories, sections, isLoading } = useDashboardStore();
  const { favoriteIds } = useFavoritesStore();
  const { mutate: addFav } = useAddFavorite() as any;
  const { mutate: remFav } = useRemoveFavorite() as any;

  // Caller location from default saved address
  const { data: addresses } = useAddresses();
  const origin = useMemo(() => {
    const list = (addresses as any[]) || [];
    const preferred = list.find((a) => a?.isDefault) || list[0];
    const lat = Number(preferred?.latitude);
    const lng = Number(preferred?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return { lat, lng };
  }, [addresses]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [q]);

  // Unified search execution
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
        limit: 40,
        lat: origin?.lat,
        lng: origin?.lng,
        signal: controller.signal,
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResults(data);
          addSearch(debouncedQ);
        }
      })
      .catch((error) => {
        if (isAborted(error)) return;
        if (!controller.signal.aborted) setResults(EMPTY_RESULTS);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQ, origin?.lat, origin?.lng, addSearch]);

  // Live suggestions query
  useEffect(() => {
    suggestInFlight.current?.abort();

    const trimmed = q.trim();
    if (!isFocused || trimmed.length === 0) {
      setLiveSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const controller = new AbortController();
    suggestInFlight.current = controller;
    setIsSuggesting(true);

    const timer = setTimeout(() => {
      searchService
        .suggestions(trimmed, 8, controller.signal)
        .then((sugs) => {
          if (!controller.signal.aborted) {
            setLiveSuggestions(sugs);
          }
        })
        .catch((err) => {
          if (!isAborted(err) && !controller.signal.aborted) {
            setLiveSuggestions([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSuggesting(false);
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, isFocused]);

  // Default discovery feed
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

  const allRestaurants = useMemo(
    () => (results ? results.restaurants : feed),
    [results, feed],
  );

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

  const filteredRestaurants = useMemo(() => {
    return allRestaurants.filter((r) => {
      if (!results && debouncedQ && !restaurantMatchesQuery(r as any, debouncedQ)) {
        return false;
      }

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
  }, [allRestaurants, results, debouncedQ, cat, catNameLower, selectedFilters]);

  const dishResults = useMemo(() => {
    const dishes: DishSearchResult[] = results?.dishes || [];
    if (!cat || !catNameLower) return dishes;
    return dishes.filter((d) => matchesCategoryName(d.categoryName, catNameLower));
  }, [results, cat, catNameLower]);

  const toggleFavorite = useCallback(
    (id: string) => {
      if (favoriteIds.has(id)) remFav(id);
      else addFav(id);
    },
    [favoriteIds, addFav, remFav]
  );

  const handleSelectQuery = useCallback((queryText: string) => {
    setQ(queryText);
    setDebouncedQ(queryText.trim());
    addSearch(queryText);
    setIsFocused(false);
    Keyboard.dismiss();
  }, [addSearch]);

  const handleSelectSuggestion = useCallback((sug: SearchSuggestion) => {
    if (sug.type === 'restaurant' && sug.id) {
      addSearch(sug.label);
      router.push(`/(customer)/restaurant/${sug.id}` as any);
      return;
    }
    handleSelectQuery(sug.label);
  }, [addSearch, handleSelectQuery]);

  const clearAllFilters = useCallback(() => {
    setQ('');
    setDebouncedQ('');
    setResults(null);
    setCat(null);
    setSelectedFilters(new Set());
    setActiveTab('all');
  }, []);

  const clearSearch = useCallback(() => {
    inFlight.current?.abort();
    suggestInFlight.current?.abort();
    setQ('');
    setDebouncedQ('');
    setResults(null);
    setLiveSuggestions([]);
    setIsSearching(false);
    setActiveTab('all');
  }, []);

  const hasSearchQuery = debouncedQ.length >= MIN_SEARCH_LENGTH;
  const noMatches =
    hasSearchQuery &&
    !isLoading &&
    !isSearching &&
    filteredRestaurants.length === 0 &&
    dishResults.length === 0;

  const didYouMean = results?.didYouMean?.[0];
  const suggestionChips = (results?.suggestions || [])
    .map((s) => s.label)
    .filter((label) => label && label.toLowerCase() !== (results?.query || '').toLowerCase())
    .slice(0, 6);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'map-pin';
      case 'dish':
        return 'disc';
      case 'category':
        return 'tag';
      default:
        return 'trending-up';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* ─── Header & Search Bar ─── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Discover dishes & restaurants in Butwal</Text>

          <View style={[styles.search, isFocused && styles.searchFocused]}>
            <Feather name="search" size={18} color={isFocused ? Colors.primary : '#94A3B8'} />
            <TextInput
              ref={inputRef}
              selectionColor="rgba(15,23,42,0.16)"
              cursorColor="#334155"
              value={q}
              onChangeText={setQ}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // Short timeout to allow click on suggestion items
                setTimeout(() => setIsFocused(false), 200);
              }}
              placeholder="Search dishes, restaurants, cuisines..."
              placeholderTextColor="#94A3B8"
              style={styles.input}
              allowFontScaling={false}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (q.trim()) {
                  handleSelectQuery(q.trim());
                }
              }}
            />
            {isSearching || isSuggesting ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : q.length ? (
              <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter Pills */}
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

      {/* ─── Live Typeahead Suggestions Dropdown Overlay ─── */}
      {isFocused && liveSuggestions.length > 0 ? (
        <View style={styles.suggestionsDropdown}>
          {liveSuggestions.map((sug, idx) => (
            <TouchableOpacity
              key={`${sug.label}-${idx}`}
              activeOpacity={0.7}
              onPress={() => handleSelectSuggestion(sug)}
              style={styles.suggestionRow}
            >
              <View style={styles.suggestionIconWrap}>
                <Feather name={getSuggestionIcon(sug.type) as any} size={14} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.suggestionLabel}>
                  {sug.label}
                </Text>
                {sug.restaurantName ? (
                  <Text numberOfLines={1} style={styles.suggestionSub}>
                    in {sug.restaurantName}
                  </Text>
                ) : null}
              </View>
              <Feather name="arrow-up-left" size={14} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* ─── Category Scroll Bar (when not searching or in All mode) ─── */}
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

      {/* ─── Search Segmented Tabs (All / Dishes / Restaurants) ─── */}
      {results && (results.counts.dishes > 0 || results.counts.restaurants > 0) ? (
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('all')}
            style={[styles.segmentBtn, activeTab === 'all' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, activeTab === 'all' && styles.segmentTextActive]}>
              All ({results.counts.dishes + results.counts.restaurants})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('dishes')}
            style={[styles.segmentBtn, activeTab === 'dishes' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, activeTab === 'dishes' && styles.segmentTextActive]}>
              Dishes ({dishResults.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('restaurants')}
            style={[styles.segmentBtn, activeTab === 'restaurants' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, activeTab === 'restaurants' && styles.segmentTextActive]}>
              Restaurants ({filteredRestaurants.length})
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ─── Main Content ─── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, paddingBottom: 32, gap: 10 }}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={() => refetch()} tintColor={Colors.primary} />}
      >
        {/* Loading skeleton */}
        {(isLoading && !allRestaurants.length) || isSearching ? (
          <CardSkeleton count={4} variant="list" />
        ) : null}

        {/* ─── Recent Searches & Trending Cravings (When idle or box empty) ─── */}
        {!hasSearchQuery && !isSearching ? (
          <View style={{ marginBottom: 6 }}>
            {recentSearches.length > 0 ? (
              <View style={styles.historySection}>
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="clock" size={14} color={Colors.textSecondary} />
                    <Text style={styles.historySectionTitle}>Recent Searches</Text>
                  </View>
                  <TouchableOpacity onPress={clearHistory} hitSlop={6}>
                    <Text style={styles.clearHistoryText}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipsWrap}>
                  {recentSearches.map((term) => (
                    <View key={term} style={styles.recentChip}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleSelectQuery(term)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      >
                        <Text style={styles.recentChipText}>{term}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeSearch(term)}
                        hitSlop={6}
                        style={{ marginLeft: 6 }}
                      >
                        <Feather name="x" size={12} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Trending Cravings */}
            <View style={[styles.historySection, { marginTop: recentSearches.length ? 12 : 4 }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="trending-up" size={14} color={Colors.primary} />
                  <Text style={styles.historySectionTitle}>Trending in Butwal</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {popularSearches.map((craving) => (
                  <TouchableOpacity
                    key={craving}
                    activeOpacity={0.8}
                    onPress={() => handleSelectQuery(craving)}
                    style={styles.trendingChip}
                  >
                    <Text style={{ fontSize: 13 }}>{getCategoryIcon(craving)}</Text>
                    <Text style={styles.trendingChipText}>{craving}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        ) : null}

        {/* ─── Mode 1: ALL (Dishes Preview + Restaurants) ─── */}
        {!isSearching && hasSearchQuery && activeTab === 'all' ? (
          <>
            {/* Dishes Carousel */}
            {dishResults.length > 0 ? (
              <View style={{ paddingTop: 4, marginBottom: 6 }}>
                <View style={styles.resultsHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.resultsHeaderTitle}>Dishes</Text>
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeCountText}>{dishResults.length}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setActiveTab('dishes')}
                    style={styles.seeAllBtn}
                  >
                    <Text style={styles.seeAllText}>See all ({dishResults.length})</Text>
                    <Feather name="chevron-right" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }} bounces={false}>
                  {dishResults.slice(0, 10).map((item) => (
                    <DishSearchCard key={item.id} item={item} variant="card" />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Restaurants Section */}
            {filteredRestaurants.length > 0 ? (
              <View style={{ paddingTop: 10 }}>
                <View style={styles.resultsHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.resultsHeaderTitle}>Restaurants</Text>
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeCountText}>{filteredRestaurants.length}</Text>
                    </View>
                  </View>
                </View>
                {filteredRestaurants.map((r) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r as any}
                    isFavorite={favoriteIds.has(r.id)}
                    onToggleFavorite={toggleFavorite}
                    variant="list"
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        {/* ─── Mode 2: DISHES ONLY (Rich Vertical Cards with Quick Add) ─── */}
        {!isSearching && hasSearchQuery && activeTab === 'dishes' ? (
          <View style={{ gap: 10 }}>
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsHeaderTitle}>
                {dishResults.length} {dishResults.length === 1 ? 'Dish' : 'Dishes'} for “{debouncedQ}”
              </Text>
            </View>
            {dishResults.map((item) => (
              <DishSearchCard key={item.id} item={item} variant="row" />
            ))}
          </View>
        ) : null}

        {/* ─── Mode 3: RESTAURANTS ONLY ─── */}
        {!isSearching && hasSearchQuery && activeTab === 'restaurants' ? (
          <View style={{ gap: 10 }}>
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsHeaderTitle}>
                {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'} for “{debouncedQ}”
              </Text>
            </View>
            {filteredRestaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r as any}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={toggleFavorite}
                variant="list"
              />
            ))}
          </View>
        ) : null}

        {/* ─── Discovery Feed when no search query active ─── */}
        {!hasSearchQuery && !isSearching ? (
          <View style={{ gap: 10 }}>
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsHeaderTitle}>
                {catMeta ? `${catMeta.name} Places` : 'All Restaurants Near You'}
              </Text>
              <Text style={styles.feedCountText}>{filteredRestaurants.length} places</Text>
            </View>
            {filteredRestaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r as any}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={toggleFavorite}
                variant="list"
              />
            ))}
          </View>
        ) : null}

        {/* ─── Empty State ─── */}
        {noMatches ? (
          <View style={{ paddingVertical: 12 }}>
            <EmptyState
              icon="search"
              title="No matches found"
              description={
                didYouMean
                  ? `No exact results for “${debouncedQ}”. Did you mean “${didYouMean}”?`
                  : `No dishes or restaurants found for “${debouncedQ}”. Try searching for momo, pizza, biryani or another cuisine.`
              }
              actionLabel="Clear search"
              onAction={clearAllFilters}
            />

            {didYouMean ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectQuery(didYouMean)}
                style={styles.didYouMeanBanner}
              >
                <Feather name="corner-down-right" size={14} color={Colors.primary} />
                <Text style={styles.didYouMeanText}>
                  Search instead for <Text style={{ fontWeight: '800' }}>“{didYouMean}”</Text>
                </Text>
              </TouchableOpacity>
            ) : null}

            {suggestionChips.length > 0 ? (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10 }}>
                  Popular right now
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} bounces={false}>
                  {suggestionChips.map((label) => (
                    <CategoryChip
                      key={label}
                      label={label}
                      icon={getCategoryIcon(label)}
                      isSelected={false}
                      onPress={() => handleSelectQuery(label)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius['3xl'],
    borderBottomRightRadius: Radius['3xl'],
    ...Shadow.primaryLg,
  },
  title: { fontSize: 19, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '500' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 10,
    ...Shadow.sm,
  },
  searchFocused: {
    borderColor: '#FED7AA',
  },
  input: { flex: 1, fontSize: 14, color: Colors.textDark, paddingVertical: 0 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterActive: { backgroundColor: Colors.white, borderColor: Colors.white },
  filterText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  filterTextActive: { color: Colors.primary },

  // Live suggestions dropdown
  suggestionsDropdown: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: Radius.xl,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.md,
    zIndex: 999,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  suggestionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  suggestionSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },

  // Segmented control tabs
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
    marginTop: 10,
    padding: 3,
    borderRadius: Radius.lg,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadow.sm,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },

  // Headers & Rows
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  resultsHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  badgeCount: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  feedCountText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600',
  },

  // Recent Searches & Trending
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historySectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  clearHistoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  recentChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 6,
  },
  trendingChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },

  didYouMeanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: Radius.lg,
    marginTop: 12,
  },
  didYouMeanText: {
    fontSize: 13,
    color: Colors.primary,
  },
});
