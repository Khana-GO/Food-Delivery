import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useHomeData } from '@/api/home';
import { useUserLocation } from '@/hooks/useUserLocation';

// Components
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeSearchBar } from '@/components/home/HomeSearchBar';
import { CategoryList } from '@/components/home/CategoryList';
import { PromoCarousel } from '@/components/home/PromoCarousel';
import { SectionHeader } from '@/components/home/SectionHeader';
import { RestaurantCard } from '@/components/home/RestaurantCard';
import { FoodCard } from '@/components/home/FoodCard';
import { HomeSkeleton } from '@/components/common/Skeleton';
import { Text } from '@/components/ui/Text';

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  
  // Location hook
  const { location, address, loading: locationLoading } = useUserLocation();

  // API hook
  const { data, isLoading, isError, refetch, isRefetching } = useHomeData(
    location?.coords.latitude,
    location?.coords.longitude
  );

  if (locationLoading || isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load home data.</Text>
          <Text style={styles.retryBtn} onPress={() => refetch()}>Retry</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    banners = [],
    categories = [],
    recommendedFoods = [],
    nearbyRestaurants = [],
    popularFoods = [],
    topRatedRestaurants = [],
    featuredRestaurants = [],
  } = data || {};

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        <HomeHeader address={address} />

        <HomeSearchBar value={searchText} onChangeText={setSearchText} />

        {/* Categories */}
        {categories.length > 0 && <CategoryList categories={categories} />}

        {/* Banners */}
        <PromoCarousel banners={banners} />

        {/* Nearby Restaurants */}
        {nearbyRestaurants.length > 0 && (
          <>
            <SectionHeader title="Nearby Restaurants" onSeeAll={() => {}} />
            <View style={styles.twoCol}>
              {nearbyRestaurants.map((item: any) => (
                <RestaurantCard key={item.restaurant.id} restaurant={item} />
              ))}
            </View>
          </>
        )}

        {/* Recommended Foods */}
        {recommendedFoods.length > 0 && (
          <>
            <SectionHeader title="Recommended For You" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {recommendedFoods.map((food: any) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Top Rated Restaurants */}
        {topRatedRestaurants.length > 0 && (
          <>
            <SectionHeader title="Top Rated Restaurants" onSeeAll={() => {}} />
            <View style={styles.twoCol}>
              {topRatedRestaurants.map((restaurant: any) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </View>
          </>
        )}

        {/* Featured Restaurants */}
        {featuredRestaurants.length > 0 && (
          <>
            <SectionHeader title="Featured Restaurants" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {featuredRestaurants.map((restaurant: any) => (
                <View key={restaurant.id} style={{ marginRight: 12 }}>
                  <RestaurantCard restaurant={restaurant} />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: Colors.error,
    marginBottom: 12,
  },
  retryBtn: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
