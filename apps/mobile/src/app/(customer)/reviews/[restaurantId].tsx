import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReviewCard } from '@/components/review/ReviewCard';
import { ReviewStatsView } from '@/components/review/ReviewStats';
import { useReviewsForRestaurant } from '@/hooks/review/useReviewsForRestaurant';
import { useReviewStats } from '@/hooks/review/useReviewStats';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function RestaurantReviewsScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { data: reviewsData, isLoading, refetch } = useReviewsForRestaurant(restaurantId, 1, 50);
  const { data: stats } = useReviewStats(restaurantId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const reviews = reviewsData?.data || [];
  const total = reviewsData?.total || 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.primary }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Reviews</Text>
              <Text style={styles.subtitle}>{total} {total === 1 ? 'review' : 'reviews'} for this restaurant</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {stats ? <ReviewStatsView stats={stats} /> : null}

      {reviews.length === 0 ? (
        <EmptyState
          icon="message-circle"
          title="No reviews yet"
          description="Be the first to share your experience with this restaurant."
        />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => refetch()}
          renderItem={({ item }) => <ReviewCard review={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius['3xl'],
    borderBottomRightRadius: Radius['3xl'],
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '500' },
});
