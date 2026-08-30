import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, StyleSheet, Animated, Image, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { RestaurantCard } from '@/components/customer/RestaurantCard';
import { CategoryChip } from '@/components/customer/CategoryChip';
import { LoadingSkeleton } from '@/components/customer/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useDashboard } from '@/hooks/customer/useDashboard';
import { useFavorites } from '@/hooks/customer/useFavorites';
import { useAddFavorite } from '@/hooks/customer/useAddFavorite';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
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

  const filteredPopular = popularRestaurants.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
        {/* Header — premium with subtle gradient */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerInner}>
              <View>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>{user?.firstName || 'Customer'} 👋</Text>
                <Text style={styles.subtle}>What are you craving today?</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => router.push('/(customer)/notifications' as any)} activeOpacity={0.8} style={styles.headerIcon}>
                  <Feather name="bell" size={18} color={Colors.textDark} />
                  <View style={styles.dot} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(customer)/chatbot' as any)} activeOpacity={0.8} style={[styles.headerIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Feather name="message-circle" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search — responsive: prevents cut on 320px */}
            <Animated.View style={[styles.searchWrap, isVeryCompact && { height: 44, paddingHorizontal: 12 } as any, { borderColor: searchFocus.interpolate({ inputRange: [0, 1], outputRange: ['#E2E8F0', Colors.primary] }) } as any]}>
              <Feather name="search" size={isVeryCompact ? 16 : 18} color="#94A3B8" />
              <TextInput
                style={[styles.searchInput, isVeryCompact && { fontSize: 13 } as any]}
                placeholder={isVeryCompact ? 'Search...' : 'Search restaurants, food...'}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => Animated.timing(searchFocus, { toValue: 1, duration: 160, useNativeDriver: false }).start()}
                onBlur={() => Animated.timing(searchFocus, { toValue: 0, duration: 160, useNativeDriver: false }).start()}
                allowFontScaling={false}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x-circle" size={isVeryCompact ? 16 : 18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </Animated.View>
          </SafeAreaView>
        </View>

        <AnimatedPage delay={40} slide>
          {/* Categories – only from approved restaurants */}
          {categories.length > 0 ? (
            <View style={{ paddingVertical: 14 }}>
              <View style={{ paddingHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>Browse by category</Text>
                <Text style={{ fontSize: 11, color: Colors.textTertiary }}>{categories.length} categories</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} bounces={false}>
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

          {/* Featured Dishes – only from approved restaurants */}
          {(() => {
            const filteredMenus = (featuredMenuItems || []).filter((m: any) => {
              if (selectedCategory && m.categoryId !== selectedCategory) return false;
              if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              return true;
            });
            if (filteredMenus.length === 0) return null;
            return (
              <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popular Dishes</Text>
                  <TouchableOpacity onPress={() => router.push('/(customer)/explore' as any)}>
                    <Text style={styles.sectionAction}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }} bounces={false}>
                  {filteredMenus.slice(0, 8).map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/(customer)/menu/${item.id}` as any)}
                      style={{
                        width: 160,
                        backgroundColor: '#FFFFFF',
                        borderRadius: Radius.xl,
                        overflow: 'hidden',
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: '#E2E8F0',
                        ...Shadow.sm,
                      }}
                    >
                      <View style={{ height: 110, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' }}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <Text style={{ fontSize: 36 }}>🍽️</Text>
                        )}
                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.96)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textDark }}>Rs. {item.price}</Text>
                        </View>
                      </View>
                      <View style={{ padding: 10 }}>
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>
                          {item.name}
                        </Text>
                        <Text numberOfLines={1} style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                          {item.restaurantName || 'Restaurant'} • {item.description?.slice(0, 30) || 'Fresh & tasty'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          })()}

          {/* Popular */}
          {(filteredPopular.length > 0 || popularRestaurants.length > 0) && (
            <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular near you</Text>
                <TouchableOpacity onPress={() => router.push('/(customer)/explore' as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.sectionAction}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }} bounces={false}>
                {(searchQuery ? filteredPopular : popularRestaurants).slice(0, 6).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={favoriteIds.has(restaurant.id)} onToggleFavorite={handleToggleFavorite} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 ? (
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recommended for you</Text>
                <TouchableOpacity onPress={() => router.push('/(customer)/explore' as any)}>
                  <Text style={styles.sectionAction}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }} bounces={false}>
                {recommendations.slice(0, 6).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={favoriteIds.has(restaurant.id)} onToggleFavorite={handleToggleFavorite} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Recently ordered */}
          {recentlyOrdered.length > 0 ? (
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Recently ordered</Text>
              {recentlyOrdered.slice(0, 3).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={favoriteIds.has(restaurant.id)} onToggleFavorite={handleToggleFavorite} variant="list" />
              ))}
            </View>
          ) : null}

          {/* Empty */}
          {!popularRestaurants.length && !recommendations.length && !recentlyOrdered.length ? (
            <EmptyState
              icon="search"
              title="Welcome to KhanaGo!"
              description="Start exploring restaurants and discover delicious food near you."
              actionLabel="Explore Restaurants"
              onAction={() => router.push('/(customer)/explore' as any)}
            />
          ) : null}
        </AnimatedPage>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingBottom: 16,
    ...Shadow.xs,
  },
  headerShimmer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 8 },
  greeting: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.5, marginTop: 2 },
  subtle: { fontSize: 12, color: Colors.textTertiary, marginTop: 2, fontWeight: '500' },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.xs,
  },
  dot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, borderWidth: 2, borderColor: '#FFFFFF' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.xl,
    borderWidth: 1.4,
    gap: 10,
  },
  searchInput: { flex: 1, minWidth: 0 as any, fontSize: 14, color: Colors.textDark, paddingVertical: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  iconSkeleton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0' },
});
