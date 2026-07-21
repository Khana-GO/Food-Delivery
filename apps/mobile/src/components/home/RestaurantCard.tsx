import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { router } from 'expo-router';
import Badge from '@/components/ui/Badge';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export interface RestaurantData {
  id: string;
  name: string;
  rating?: number;
  averageRating?: number;
  totalReviews?: number;
  reviews?: string;
  time?: string;
  estimatedDeliveryTime?: number;
  fee?: string;
  deliveryFee?: string;
  distance?: number | string;
  cuisine?: string[];
  cuisineType?: string;
  isOpen: boolean;
  emoji?: string;
  color?: string;
  coverImageUrl?: string;
}

interface RestaurantCardProps {
  restaurant: RestaurantData | any;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const isDataFromApi = restaurant.restaurant ? true : false;
  const data = isDataFromApi ? restaurant.restaurant : restaurant;
  const distance = isDataFromApi ? (restaurant.distance ? `${restaurant.distance.toFixed(1)} km` : 'N/A') : restaurant.distance;

  // Mock colors/emojis if not provided by API
  const fallbackColor = data.color || '#FEF3C7';
  const fallbackEmoji = data.emoji || '🍽️';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/(customer)/restaurant/${data.id}` as any)}
    >
      <View style={[styles.cardImage, { backgroundColor: fallbackColor }]}>
        {data.coverImageUrl ? (
          <Image source={{ uri: data.coverImageUrl }} style={StyleSheet.absoluteFill} />
        ) : (
          <Text style={styles.cardEmoji}>{fallbackEmoji}</Text>
        )}
        <Badge
          label={data.isOpen ? 'Open' : 'Closed'}
          variant={data.isOpen ? 'success' : 'error'}
          style={styles.openBadge}
        />
        <TouchableOpacity style={styles.heartBtn}>
          <Text>🤍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {data.name}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaStar}>⭐ {data.averageRating || data.rating || 'New'}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaInfo}>({data.totalReviews || data.reviews || 0})</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.metaInfo}>⏱ {data.estimatedDeliveryTime || data.time || '30'} min</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaInfo}>🚴 Rs. {data.deliveryFee || data.fee || '0'}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaInfo}>📍 {distance}</Text>
        </View>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{data.cuisineType || (data.cuisine ? data.cuisine[0] : 'Restaurant')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  cardImage: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardEmoji: { fontSize: 44 },
  openBadge: { position: 'absolute', top: 8, left: 8 },
  heartBtn: { position: 'absolute', top: 8, right: 8 },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  metaStar: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
  metaDot: { fontSize: 11, color: Colors.textLight },
  metaInfo: { fontSize: 11, color: Colors.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
});
