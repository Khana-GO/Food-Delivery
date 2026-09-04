import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReviewForm } from '@/components/review/ReviewForm';
import { useMyReviews } from '@/hooks/review/useMyReviews';
import { useUpdateReview } from '@/hooks/review/useUpdateReview';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function EditReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useMyReviews();
  const { mutate: updateReview, isPending } = useUpdateReview();
  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    if (data?.data) {
      const found = data.data.find((r) => r.id === id);
      if (found) setReview(found);
    }
  }, [data, id]);

  if (isLoading || !review) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleSubmit = (rating: number, comment: string) => {
    updateReview(
      { id: id!, data: { rating, comment } },
      {
        onSuccess: () => router.back(),
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.primary }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm }}>
            <Feather name="arrow-left" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 }}>Edit Review</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '500' }} numberOfLines={1}>
              {review.restaurantName}
            </Text>
          </View>
        </View>
      </SafeAreaView>
      <ReviewForm
        initialRating={review.rating}
        initialComment={review.comment || ''}
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Update Review"
        onCancel={() => router.back()}
      />
    </View>
  );
}
