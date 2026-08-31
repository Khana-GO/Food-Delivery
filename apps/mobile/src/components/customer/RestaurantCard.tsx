import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Restaurant } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 10) / 2;

interface Props {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  variant?: 'grid' | 'list';
  showDistance?: boolean;
}

export const RestaurantCard = ({ restaurant, isFavorite = false, onToggleFavorite, variant = 'grid', showDistance = false }: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  const handlePress = () => router.push(`/(customer)/restaurant/${restaurant.id}` as any);
  const handleFavoritePress = (e: any) => {
    e.stopPropagation?.();
    onToggleFavorite?.(restaurant.id);
  };

  if (variant === 'list') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.92}
          style={styles.listCard}
        >
          <View style={styles.listImgWrap}>
            {restaurant.logoUrl ? (
              <Image source={{ uri: restaurant.logoUrl }} style={styles.listImg} contentFit="contain" transition={200} cachePolicy="memory-disk" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7Rj~qofM{WB' }} />
            ) : (
              <Text style={styles.listInitial}>{restaurant.name?.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {restaurant.name}
              </Text>
              {onToggleFavorite ? (
                <TouchableOpacity onPress={handleFavoritePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.favBtnSmall}>
                  <Feather name="heart" size={16} color={isFavorite ? Colors.primary : '#CBD5E1'} style={isFavorite ? { opacity: 1 } : undefined} />
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={styles.cuisine}>{restaurant.cuisineType}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View style={styles.ratingPill}>
                <Feather name="star" size={10} color="#FFFFFF" />
                <Text style={styles.ratingText}>{restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New'}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.meta}>{restaurant.estimatedDeliveryTime || 30} min</Text>
              {showDistance ? (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.meta}>1.2 km</Text>
                </>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }], width: CARD_WIDTH }}>
      <TouchableOpacity onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={0.92} style={styles.gridCard}>
        <View style={styles.gridImgWrap}>
          {restaurant.coverImageUrl ? (
            <Image source={{ uri: restaurant.coverImageUrl }} style={styles.gridImg} contentFit="cover" transition={250} cachePolicy="memory-disk" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7Rj~qofM{WB' }} />
          ) : (
            <View style={styles.gridPlaceholder}>
              <Text style={styles.gridInitial}>{restaurant.name?.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.gridGradient} />
          {onToggleFavorite ? (
            <TouchableOpacity onPress={handleFavoritePress} activeOpacity={0.8} style={styles.favBtn}>
              <Feather name="heart" size={14} color={isFavorite ? Colors.primary : '#64748B'} fill={isFavorite ? Colors.primary : 'transparent'} />
            </TouchableOpacity>
          ) : null}
          {!restaurant.isOpen ? (
            <View style={styles.closedPill}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          ) : null}
          <View style={styles.deliveryPill}>
            <Text style={styles.deliveryText}>{restaurant.estimatedDeliveryTime || 30} min</Text>
          </View>
        </View>
        <View style={styles.gridBody}>
          <Text style={styles.gridTitle} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.gridCuisine} numberOfLines={1}>
            {restaurant.cuisineType}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <View style={styles.ratingPill}>
              <Feather name="star" size={10} color="#FFFFFF" />
              <Text style={styles.ratingText}>{restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New'}</Text>
            </View>
            <Text style={styles.metaSmall}>{restaurant.deliveryFee ? `Rs. ${restaurant.deliveryFee} fee` : 'Free delivery'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'center',
    ...Shadow.sm,
  },
  listImgWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FEE2E2',
  },
  listImg: { width: '100%', height: '100%' },
  listInitial: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  listTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, flex: 1, letterSpacing: -0.2 },
  cuisine: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  ratingText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  dot: { color: '#CBD5E1', fontSize: 10 },
  meta: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  metaSmall: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', flex: 1 },
  favBtnSmall: { padding: 4, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' },

  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
    marginBottom: 2,
  },
  gridImgWrap: { height: 124, backgroundColor: '#FEF2F2', position: 'relative', overflow: 'hidden' },
  gridImg: { width: '100%', height: '100%' },
  gridPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2' },
  gridInitial: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  gridGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    backgroundColor: 'rgba(15,23,42,0.04)',
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  closedPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  closedText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  deliveryPill: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(226,232,240,0.8)',
  },
  deliveryText: { fontSize: 10, fontWeight: '700', color: Colors.textDark },
  gridBody: { padding: 12, paddingTop: 10 },
  gridTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.2 },
  gridCuisine: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
});
