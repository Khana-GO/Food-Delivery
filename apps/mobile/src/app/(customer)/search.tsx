import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FilterModal, FilterOptions } from '../../components/ui/FilterModal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

const RECENT_SEARCHES = ['BBQ Burger', 'KFC Bucket', 'Vegan Salads', 'Pizza Hut', 'Sweets'];

const POPULAR_TAGS = [
  { label: '🔥 Offers & Deals', query: 'Deals', isDiscount: true },
  { label: '🥗 Healthy', query: 'Healthy' },
  { label: '🍔 Burgers', query: 'Burgers' },
  { label: '🍕 Pizza', query: 'Pizza' },
  { label: '⚡ Under 30 min', query: 'Fast' },
];

const SEARCH_DATABASE = [
  {
    id: '1',
    name: 'Harvey\'s',
    cuisineCategory: 'burgers',
    cuisine: 'Burgers, American',
    rating: 4.6,
    prepTime: '15-20 min',
    prepMinutes: 18,
    distance: '2.1 mi',
    distanceMiles: 2.1,
    minOrder: '$10.00',
    deliveryFee: '$1.99',
    dietary: ['veg', 'halal'],
    price: '$$ ',
    discountOffer: '20% OFF (Code SAVE20)',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Harvey%27s_logo.svg/200px-Harvey%27s_logo.svg.png',
  },
  {
    id: '2',
    name: 'KFC',
    cuisineCategory: 'fastfood',
    cuisine: 'Fried Chicken, Fast Food',
    rating: 4.4,
    prepTime: '20-25 min',
    prepMinutes: 22,
    distance: '1.3 mi',
    distanceMiles: 1.3,
    minOrder: '$12.00',
    deliveryFee: '$2.49',
    dietary: ['halal'],
    price: '$ ',
    discountOffer: null,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/200px-KFC_logo.svg.png',
  },
  {
    id: '3',
    name: 'Green & Fresh Salads',
    cuisineCategory: 'salads',
    cuisine: 'Salads, Bowls, Healthy',
    rating: 4.8,
    prepTime: '10-15 min',
    prepMinutes: 12,
    distance: '0.8 mi',
    distanceMiles: 0.8,
    minOrder: '$8.00',
    deliveryFee: 'Free',
    dietary: ['veg', 'vegan', 'gf'],
    price: '$$ ',
    discountOffer: 'Free Delivery on $15+',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Pizza Hut Express',
    cuisineCategory: 'pizza',
    cuisine: 'Pizza, Italian',
    rating: 4.3,
    prepTime: '25-35 min',
    prepMinutes: 30,
    distance: '3.4 mi',
    distanceMiles: 3.4,
    minOrder: '$15.00',
    deliveryFee: '$3.49',
    dietary: ['veg'],
    price: '$$$ ',
    discountOffer: 'Buy 1 Get 1 Free',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop',
    logo: 'https://upload.wikimedia.org/wikipedia/sco/d/d2/Pizza_Hut_logo.svg',
  },
];

const DEFAULT_FILTERS: FilterOptions = {
  sortBy: 'popularity',
  cuisines: [],
  dietary: [],
  priceRange: [],
  maxDeliveryTime: null,
  minRating: null,
  onlyDiscounts: false,
};

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const initialCategory = params.category as string;

  const [query, setQuery] = useState(initialCategory || '');
  const [recentList, setRecentList] = useState<string[]>(RECENT_SEARCHES);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    ...DEFAULT_FILTERS,
    cuisines: initialCategory ? [initialCategory.toLowerCase()] : [],
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeFilterCount =
    (filters.sortBy !== 'popularity' ? 1 : 0) +
    (filters.cuisines?.length || 0) +
    filters.dietary.length +
    filters.priceRange.length +
    (filters.maxDeliveryTime ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.onlyDiscounts ? 1 : 0);

  const filteredResults = useMemo(() => {
    return SEARCH_DATABASE.filter((item) => {
      // Query match
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.cuisine.toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) return false;

      // Cuisine category filter
      if (filters.cuisines && filters.cuisines.length > 0) {
        const matchesCuisine = filters.cuisines.some((c) =>
          item.cuisineCategory.toLowerCase().includes(c.toLowerCase()) ||
          item.cuisine.toLowerCase().includes(c.toLowerCase())
        );
        if (!matchesCuisine) return false;
      }

      // Dietary filter match
      if (filters.dietary.length > 0) {
        const hasDietary = filters.dietary.every((d) => item.dietary.includes(d));
        if (!hasDietary) return false;
      }

      // Discounts only filter
      if (filters.onlyDiscounts && !item.discountOffer) return false;

      // Rating filter
      if (filters.minRating && item.rating < filters.minRating) return false;

      // Delivery time limit
      if (filters.maxDeliveryTime && item.prepMinutes > filters.maxDeliveryTime) return false;

      // Price filter
      if (filters.priceRange.length > 0 && !filters.priceRange.includes(item.price)) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'fastest') return a.prepMinutes - b.prepMinutes;
      if (filters.sortBy === 'distance') return a.distanceMiles - b.distanceMiles;
      if (filters.sortBy === 'price_low') return a.price.length - b.price.length;
      return 0;
    });
  }, [query, filters]);

  const handleSearchSubmit = (text: string) => {
    setQuery(text);
    if (text.trim() && !recentList.includes(text.trim())) {
      setRecentList([text.trim(), ...recentList.slice(0, 4)]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#1E293B" />
            </TouchableOpacity>

            <Text style={styles.title}>Search &amp; Explore</Text>

            <TouchableOpacity
              style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
              onPress={() => setFilterModalOpen(true)}
            >
              <Ionicons
                name="options"
                size={18}
                color={activeFilterCount > 0 ? '#FFFFFF' : '#F472B6'}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilterCount > 0 && styles.filterTextActive,
                ]}
              >
                Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes, restaurants, or cuisines..."
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setLoading(true);
                setTimeout(() => setLoading(false), 150);
              }}
              onSubmitEditing={() => handleSearchSubmit(query)}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Popular Tag Chips */}
          <View style={{ height: 44 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularTagsScroll}
            >
              {POPULAR_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.label}
                  style={[styles.tagChip, tag.isDiscount && styles.tagChipDiscount]}
                  onPress={() => {
                    if (tag.isDiscount) {
                      setFilters({ ...filters, onlyDiscounts: !filters.onlyDiscounts });
                    } else {
                      handleSearchSubmit(tag.query);
                    }
                  }}
                >
                  <Text style={[styles.tagText, tag.isDiscount && styles.tagTextDiscount]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38BDF8" />
            }
          >
            {/* If query empty & no active filter, show recent searches */}
            {!query && activeFilterCount === 0 ? (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>Recent Searches</Text>
                  {recentList.length > 0 && (
                    <TouchableOpacity onPress={() => setRecentList([])}>
                      <Text style={styles.clearAll}>CLEAR ALL</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {recentList.length === 0 ? (
                  <Text style={styles.emptySearchText}>No recent searches</Text>
                ) : (
                  recentList.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.recentRow}
                      onPress={() => handleSearchSubmit(item)}
                    >
                      <Ionicons name="time-outline" size={18} color="#94A3B8" />
                      <Text style={styles.recentItemText}>{item}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#CBD5E1" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : null}

            {/* Results Section */}
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeaderRow}>
                <Text style={styles.resultsHeader}>
                  {query || activeFilterCount > 0
                    ? `Results (${filteredResults.length})`
                    : 'Popular Restaurants'}
                </Text>
                <Text style={styles.resultsSortTag}>
                  Sorted by: {filters.sortBy.toUpperCase()}
                </Text>
              </View>

              {loading ? (
                <View style={{ gap: 16 }}>
                  <SkeletonLoader height={150} borderRadius={16} />
                  <SkeletonLoader height={150} borderRadius={16} />
                </View>
              ) : filteredResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={56} color="#CBD5E1" />
                  <Text style={styles.noResultsTitle}>No restaurants found</Text>
                  <Text style={styles.noResultsSub}>Try adjusting your search query or active filters</Text>
                  <TouchableOpacity
                    style={styles.resetFilterBtn}
                    onPress={() => {
                      setQuery('');
                      setFilters(DEFAULT_FILTERS);
                    }}
                  >
                    <Text style={styles.resetFilterText}>Clear All Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.restaurantCard}
                    onPress={() => router.push('/restaurant' as any)}
                    activeOpacity={0.85}
                  >
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: item.image }} style={styles.cardImage} />

                      {/* Offer Discount Badge Overlay */}
                      {item.discountOffer && (
                        <View style={styles.offerBadge}>
                          <Text style={styles.offerBadgeText}>🔥 {item.discountOffer}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.restaurantName}>{item.name}</Text>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                      </View>

                      <Text style={styles.cuisineText}>{item.cuisine}</Text>

                      {/* Metadata Row: Prep Time, Distance, Min Order, Delivery Fee */}
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={13} color="#64748B" />
                          <Text style={styles.metaText}>{item.prepTime}</Text>
                        </View>
                        <Text style={styles.metaDot}>•</Text>
                        <View style={styles.metaItem}>
                          <Ionicons name="navigate-outline" size={13} color="#64748B" />
                          <Text style={styles.metaText}>{item.distance}</Text>
                        </View>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>Min: {item.minOrder}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.deliveryFeeText}>{item.deliveryFee}</Text>
                      </View>

                      {/* Dietary Badges */}
                      {item.dietary.length > 0 && (
                        <View style={styles.dietaryRow}>
                          {item.dietary.includes('veg') && (
                            <View style={[styles.dietTag, { backgroundColor: '#DCFCE7' }]}>
                              <Text style={[styles.dietTagText, { color: '#166534' }]}>🥗 Veg</Text>
                            </View>
                          )}
                          {item.dietary.includes('vegan') && (
                            <View style={[styles.dietTag, { backgroundColor: '#F0FDF4' }]}>
                              <Text style={[styles.dietTagText, { color: '#15803D' }]}>🌱 Vegan</Text>
                            </View>
                          )}
                          {item.dietary.includes('gf') && (
                            <View style={[styles.dietTag, { backgroundColor: '#FEF3C7' }]}>
                              <Text style={[styles.dietTagText, { color: '#92400E' }]}>🌾 Gluten-Free</Text>
                            </View>
                          )}
                          {item.dietary.includes('halal') && (
                            <View style={[styles.dietTag, { backgroundColor: '#F0F9FF' }]}>
                              <Text style={[styles.dietTagText, { color: '#0284C7' }]}>🌙 Halal</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}

              {/* End of list pagination footer indicator */}
              {filteredResults.length > 0 && (
                <View style={styles.pagingFooter}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#94A3B8" />
                  <Text style={styles.pagingFooterText}>Showing all matching restaurants</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Filter Modal Sheet */}
          <FilterModal
            visible={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            filters={filters}
            onApply={(updated) => setFilters(updated)}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', flex: 1 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: '#38BDF8',
  },
  filterText: { fontSize: 13, fontWeight: '700', color: '#F472B6' },
  filterTextActive: { color: '#FFFFFF' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },

  popularTagsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  tagChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagChipDiscount: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  tagText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  tagTextDiscount: { color: '#92400E', fontWeight: '700' },

  recentSection: { paddingHorizontal: 16, paddingTop: 16 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  clearAll: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  emptySearchText: { fontSize: 13, color: '#94A3B8', marginVertical: 8 },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  recentItemText: { fontSize: 14, fontWeight: '500', color: '#1E293B' },

  resultsSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsHeader: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  resultsSortTag: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 140 },
  offerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  offerBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  cardContent: { padding: 14 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restaurantName: { fontSize: 17, fontWeight: '800', color: '#1E293B', flex: 1, marginRight: 8 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#92400E' },
  cuisineText: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748B' },
  metaDot: { color: '#CBD5E1' },
  deliveryFeeText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },

  dietaryRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  dietTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dietTagText: { fontSize: 11, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  noResultsTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  noResultsSub: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  resetFilterBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  resetFilterText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },

  pagingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  pagingFooterText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
});
