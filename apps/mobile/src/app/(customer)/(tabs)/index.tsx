import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Animated, useWindowDimensions, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { RestaurantCard } from '@/components/customer/RestaurantCard';
import { CategoryChip } from '@/components/customer/CategoryChip';
import EmptyState from '@/components/ui/EmptyState';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useDashboard } from '@/hooks/customer/useDashboard';
import { useFavorites } from '@/hooks/customer/useFavorites';
import { useAddFavorite } from '@/hooks/customer/useAddFavorite';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { useCartStore } from '@/stores/customer/cartStore';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchFocus = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isVeryCompact = width < 360;

  const { refetch: refetchDashboard, isRefetching: isDashboardRefetching } = useDashboard();
  const { refetch: refetchFavorites, isRefetching: isFavoritesRefetching } = useFavorites();
  const { mutate: addFavorite, isPending: isAddingFavorite } = useAddFavorite();
  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useRemoveFavorite();
  const { popularRestaurants, recommendations, recentlyOrdered, categories, featuredMenuItems, isLoading } = useDashboardStore();
  const { favoriteIds } = useFavoritesStore();
  const { totalItems: cartCount } = useCartStore();
  const isRefreshing = isDashboardRefetching || isFavoritesRefetching;

  const handleRefresh = useCallback(() => {
    refetchDashboard();
    refetchFavorites();
  }, [refetchDashboard, refetchFavorites]);

  const handleToggleFavorite = useCallback(
    (restaurantId: string) => {
      if (isAddingFavorite || isRemovingFavorite) return;
      if (favoriteIds.has(restaurantId)) removeFavorite(restaurantId);
      else addFavorite(restaurantId);
    },
    [favoriteIds, addFavorite, removeFavorite, isAddingFavorite, isRemovingFavorite]
  );

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // ─── Global filtering helpers ───
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory)?.name.toLowerCase().trim() || null;
  }, [selectedCategory, categories]);

  const q = searchQuery.trim().toLowerCase();
  const matchesSearch = useCallback(
    (r: any) => {
      if (!q) return true;
      return (
        r.name?.toLowerCase().includes(q) ||
        r.cuisineType?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    },
    [q]
  );

  const menuItemMatchesCat = useCallback(
    (item: any) => {
      if (!selectedCategory) return true;
      // direct id match
      if (item.categoryId === selectedCategory) return true;
      // fallback by name
      const catName = categories.find((c) => c.id === item.categoryId)?.name.toLowerCase().trim();
      return catName === selectedCategoryName;
    },
    [selectedCategory, selectedCategoryName, categories]
  );

  const menuItemMatchesSearch = useCallback(
    (item: any) => {
      if (!q) return true;
      return (
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.restaurantName?.toLowerCase().includes(q)
      );
    },
    [q]
  );

  // Build set of restaurantIds that have at least one menu item in selected category (for restaurant filtering)
  const restaurantIdsWithSelectedCategory = useMemo(() => {
    if (!selectedCategoryName) return null;
    const set = new Set<string>();
    for (const item of featuredMenuItems || []) {
      if (menuItemMatchesCat(item)) set.add(item.restaurantId);
    }
    return set;
  }, [selectedCategoryName, featuredMenuItems, menuItemMatchesCat]);

  const restaurantMatchesCategory = useCallback(
    (restaurant: any) => {
      if (!selectedCategory) return true;
      if (!restaurantIdsWithSelectedCategory) return true;
      // If featured list has no restaurant for this category, don't hide all – show all but indicate filter active
      if (restaurantIdsWithSelectedCategory.size === 0) return true;
      return restaurantIdsWithSelectedCategory.has(restaurant.id);
    },
    [selectedCategory, restaurantIdsWithSelectedCategory]
  );

  const filteredPopular = useMemo(() => {
    return popularRestaurants.filter((r: any) => matchesSearch(r) && restaurantMatchesCategory(r));
  }, [popularRestaurants, matchesSearch, restaurantMatchesCategory]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r: any) => matchesSearch(r) && restaurantMatchesCategory(r));
  }, [recommendations, matchesSearch, restaurantMatchesCategory]);

  const filteredRecently = useMemo(() => {
    return recentlyOrdered.filter((r: any) => matchesSearch(r) && restaurantMatchesCategory(r));
  }, [recentlyOrdered, matchesSearch, restaurantMatchesCategory]);

  const filteredMenus = useMemo(() => {
    return (featuredMenuItems || []).filter((m: any) => menuItemMatchesCat(m) && menuItemMatchesSearch(m));
  }, [featuredMenuItems, menuItemMatchesCat, menuItemMatchesSearch]);

  const activeFilterLabel = selectedCategoryName
    ? categories.find((c) => c.id === selectedCategory)?.name
    : null;

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  if (isLoading && !popularRestaurants.length) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={styles.headerShimmer}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.firstName || 'Customer'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.iconSkeleton} />
              <View style={styles.iconSkeleton} />
            </View>
          </View>
        </View>
        <PageSkeleton />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Header — premium with subtle gradient + profile */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerInner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/profile' as any)} activeOpacity={0.85} style={styles.avatarWrap}>
                  {user?.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.avatarImg} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                  ) : (
                    <Text style={styles.avatarText}>{(user?.firstName?.charAt(0) || 'C').toUpperCase()}</Text>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.greeting}>{getGreeting()},</Text>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.firstName || 'Customer'}
                  </Text>
                  <Text style={styles.subtle} numberOfLines={1}>
                    What are you craving today?
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
                <TouchableOpacity onPress={() => router.push('/(customer)/notifications' as any)} activeOpacity={0.8} style={styles.headerIcon}>
                  <Feather name="bell" size={18} color={Colors.white} />
                  <View style={styles.dot} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(customer)/cart' as any)} activeOpacity={0.8} style={styles.headerIcon}>
                  <Feather name="shopping-cart" size={18} color={Colors.white} />
                  {cartCount > 0 ? (
                    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: Colors.white, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1, borderColor: Colors.primary }}>
                      <Text style={{ color: Colors.primary, fontSize: 10, fontWeight: '700' }}>{cartCount}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(customer)/chatbot' as any)}
                  activeOpacity={0.8}
                  style={styles.headerIcon}
                >
                  <Feather name="message-circle" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search — responsive */}
            <Animated.View
              style={[
                styles.searchWrap,
                isVeryCompact && ({ height: 44, paddingHorizontal: 12 } as any),
                { borderColor: searchFocus.interpolate({ inputRange: [0, 1], outputRange: ['#E2E8F0', Colors.primary] }) } as any,
              ]}
            >
              <Feather name="search" size={isVeryCompact ? 16 : 18} color="#94A3B8" />
              <TextInput
                style={[styles.searchInput, isVeryCompact && ({ fontSize: 13 } as any)]}
                placeholder={isVeryCompact ? 'Search...' : 'Search restaurants, dishes…'}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => Animated.timing(searchFocus, { toValue: 1, duration: 160, useNativeDriver: false }).start()}
                onBlur={() => Animated.timing(searchFocus, { toValue: 0, duration: 160, useNativeDriver: false }).start()}
                allowFontScaling={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x-circle" size={isVeryCompact ? 16 : 18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </Animated.View>

            {/* Active filter pill */}
            {activeFilterLabel || q ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {activeFilterLabel ? (
                  <View style={styles.activeFilterPill}>
                    <Feather name="filter" size={12} color="#FFF" />
                    <Text style={styles.activeFilterText}>{activeFilterLabel}</Text>
                    <TouchableOpacity onPress={() => setSelectedCategory(null)} hitSlop={6} style={styles.activeFilterX}>
                      <Feather name="x" size={12} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ) : null}
                {q ? (
                  <View style={styles.activeFilterPillLight}>
                    <Feather name="search" size={12} color={Colors.textDark} />
                    <Text style={styles.activeFilterTextLight}>"{q}"</Text>
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={6}>
                      <Feather name="x" size={12} color={Colors.textDark} />
                    </TouchableOpacity>
                  </View>
                ) : null}
                <TouchableOpacity onPress={clearFilters} style={styles.clearFilterBtn}>
                  <Text style={styles.clearFilterText}>Clear all</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </SafeAreaView>
        </View>

        <AnimatedPage delay={40} slide>
          {/* ─── Categories – sticky filter ─── */}
          {categories.length > 0 ? (
            <View style={{ paddingVertical: 14 }}>
              <View style={{ paddingHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Browse by category</Text>
                <Text style={{ fontSize: 11, color: Colors.textTertiary }}>{categories.length} categories</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} bounces={false}>
                <CategoryChip
                  label="All"
                  isSelected={selectedCategory === null}
                  onPress={() => setSelectedCategory(null)}
                />
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.name}
                    isSelected={selectedCategory === category.id}
                    onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* ─── Promo banner ─── */}
          <View style={{ paddingHorizontal: 16, marginTop: 2, marginBottom: 6 }}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} snapToInterval={width - 32 + 12} decelerationRate="fast">
              <View style={[styles.promoCard, { width: width - 32, backgroundColor: Colors.primary }]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.6 }}>LIMITED TIME</Text>
                  </View>
                  <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 }}>Free delivery on Rs.500+</Text>
                  <Text style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Hot meals from verified kitchens — no extra fee</Text>
                  <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/explore' as any)} style={{ marginTop: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.primary }}>Order now →</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <Text style={{ fontSize: 34 }}>🍱</Text>
                </View>
              </View>

              <View style={[styles.promoCard, { width: width - 32, backgroundColor: '#B91C1C' }]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 0.6 }}>POPULAR NOW</Text>
                  </View>
                  <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '800', color: '#FFF' }}>Momo & Chowmein specials</Text>
                  <Text style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Crispy, juicy & freshly steamed daily</Text>
                  <TouchableOpacity onPress={() => setSelectedCategory(categories.find((c) => c.name.toLowerCase().includes('momo'))?.id || null)} style={{ marginTop: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#B91C1C' }}>Browse Momo →</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 34 }}>🥟</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* ─── 1️⃣ Popular Restaurants FIRST ─── */}
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' }}>
                  <Feather name="star" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Popular Restaurants</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/explore' as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.sectionAction}>See all</Text>
              </TouchableOpacity>
            </View>
            {filteredPopular.length === 0 ? (
              <View style={styles.emptyInline}>
                <Feather name="search" size={20} color="#CBD5E1" />
                <Text style={styles.emptyInlineTitle}>No restaurants match</Text>
                <Text style={styles.emptyInlineSub}>{activeFilterLabel ? `No restaurants for “${activeFilterLabel}”` : q ? `No match for “${q}”` : 'Try a different filter'}</Text>
                <TouchableOpacity onPress={clearFilters} style={styles.emptyInlineBtn}>
                  <Text style={styles.emptyInlineBtnText}>Clear filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }} bounces={false}>
                {filteredPopular.slice(0, 8).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={favoriteIds.has(restaurant.id)} onToggleFavorite={handleToggleFavorite} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* ─── 2️⃣ Recommended for you SECOND ─── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' }}>
                  <Feather name="heart" size={14} color="#2563EB" />
                </View>
                <Text style={styles.sectionTitle}>Recommended for you</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/explore' as any)}>
                <Text style={styles.sectionAction}>See all</Text>
              </TouchableOpacity>
            </View>
            {filteredRecommendations.length === 0 ? (
              <View style={styles.emptyInline}>
                <Feather name="heart" size={20} color="#CBD5E1" />
                <Text style={styles.emptyInlineTitle}>No recommendations yet</Text>
                <Text style={styles.emptyInlineSub}>{activeFilterLabel ? `Nothing matched “${activeFilterLabel}”` : 'Order more to get personalized picks'}</Text>
                {!activeFilterLabel && !q ? (
                  <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/explore' as any)} style={styles.emptyInlineBtn}>
                    <Text style={styles.emptyInlineBtnText}>Explore</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={clearFilters} style={styles.emptyInlineBtn}>
                    <Text style={styles.emptyInlineBtnText}>Clear filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }} bounces={false}>
                {filteredRecommendations.slice(0, 8).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={favoriteIds.has(restaurant.id)} onToggleFavorite={handleToggleFavorite} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* ─── 3️⃣ Menu Items THIRD ─── */}
          {(() => {
            if (filteredMenus.length === 0) {
              if (selectedCategory || q) {
                return (
                  <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
                    <View style={styles.sectionHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FDBA74' }}>
                          <Feather name="grid" size={14} color="#EA580C" />
                        </View>
                        <Text style={styles.sectionTitle}>Popular Dishes</Text>
                      </View>
                    </View>
                    <View style={styles.emptyInline}>
                      <Text style={{ fontSize: 28 }}>🍽️</Text>
                      <Text style={styles.emptyInlineTitle}>No dishes found</Text>
                      <Text style={styles.emptyInlineSub}>{activeFilterLabel ? `Nothing in “${activeFilterLabel}”` : `No match for “${q}”`}</Text>
                      <TouchableOpacity onPress={clearFilters} style={styles.emptyInlineBtn}>
                        <Text style={styles.emptyInlineBtnText}>Clear filters</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
              return null;
            }
            return (
              <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
                <View style={styles.sectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FDBA74' }}>
                      <Feather name="grid" size={14} color="#EA580C" />
                    </View>
                    <Text style={styles.sectionTitle}>Trending Dishes</Text>
                    <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: '#FECACA' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.primary }}>{filteredMenus.length} items</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/explore' as any)}>
                    <Text style={styles.sectionAction}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }} bounces={false}>
                  {filteredMenus.slice(0, 10).map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.88}
                      onPress={() => router.push(`/(customer)/menu/${item.id}` as any)}
                      style={{
                        width: 168,
                        backgroundColor: '#FFFFFF',
                        borderRadius: Radius.xl,
                        overflow: 'hidden',
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: '#E2E8F0',
                        ...Shadow.sm,
                      }}
                    >
                      <View style={{ height: 128, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} cachePolicy="memory-disk" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7Rj~qofM{WB' }} />
                        ) : (
                          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FDE68A' }}>
                            <Text style={{ fontSize: 28 }}>🍽️</Text>
                          </View>
                        )}
                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primaryDark }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>Rs. {item.price}</Text>
                        </View>
                        <View style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.96)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' }}>
                          <Feather name="star" size={10} color="#FBBFBC" />
                          <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textDark }}>4.6</Text>
                        </View>
                      </View>
                      <View style={{ padding: 12, paddingBottom: 10 }}>
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 }}>
                          {item.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <Feather name="map-pin" size={10} color={Colors.textTertiary} />
                          <Text numberOfLines={1} style={{ flex: 1, fontSize: 11, color: Colors.textSecondary, fontWeight: '500' }}>
                            {item.restaurantName || 'Restaurant'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          })()}

          {/* ─── Recently ordered / Order again ─── */}
          {filteredRecently.length > 0 ? (
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
                    <Feather name="repeat" size={14} color="#15803D" />
                  </View>
                  <Text style={styles.sectionTitle}>Order again</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/orders' as any)}>
                  <Text style={styles.sectionAction}>History</Text>
                </TouchableOpacity>
              </View>
              {filteredRecently.slice(0, 3).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={favoriteIds.has(restaurant.id)} onToggleFavorite={handleToggleFavorite} variant="list" />
              ))}
            </View>
          ) : null}

          {/* ─── Empty global ─── */}
          {!filteredPopular.length && !filteredRecommendations.length && !filteredMenus.length && !filteredRecently.length ? (
            <EmptyState
              icon="search"
              title={activeFilterLabel || q ? 'No matches' : 'Welcome to KhanaGo!'}
              description={activeFilterLabel || q ? `Try clearing filters or search differently.` : 'Start exploring restaurants and discover delicious food near you.'}
              actionLabel={activeFilterLabel || q ? 'Clear filters' : 'Explore Restaurants'}
              onAction={() => (activeFilterLabel || q ? clearFilters() : router.push('/(customer)/(tabs)/explore' as any))}
            />
          ) : null}
        </AnimatedPage>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: Radius['3xl'],
    borderBottomRightRadius: Radius['3xl'],
  },
  headerShimmer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: Radius['3xl'],
    borderBottomRightRadius: Radius['3xl'],
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.4, marginTop: 1 },
  subtle: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1, fontWeight: '500' },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    ...Shadow.lg,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.primary },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    marginTop: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 10,
    ...Shadow.sm,
  },
  searchInput: { flex: 1, minWidth: 0 as any, fontSize: 14, color: Colors.textDark, paddingVertical: 0 },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activeFilterText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  activeFilterX: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: 2 },
  activeFilterPillLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activeFilterTextLight: { fontSize: 12, fontWeight: '600', color: Colors.textDark },
  clearFilterBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  clearFilterText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    ...Shadow.xs,
  },
  trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  trustIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  trustText: { fontSize: 11, fontWeight: '600', color: Colors.textDark, letterSpacing: 0.1 },
  trustDivider: { width: 1, height: 18, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  iconSkeleton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  emptyInline: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    ...Shadow.xs,
  },
  emptyInlineTitle: { marginTop: 8, fontSize: 13, fontWeight: '700', color: Colors.textDark },
  emptyInlineSub: { marginTop: 4, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  emptyInlineBtn: { marginTop: 12, backgroundColor: Colors.textDark, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  emptyInlineBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});
