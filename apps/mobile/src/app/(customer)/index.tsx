import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Burgers', emoji: '🍔' },
  { id: '2', name: 'Grocery', emoji: '🛍️' },
  { id: '3', name: 'Salads', emoji: '🥗' },
  { id: '4', name: 'Sweets', emoji: '🍩' },
  { id: '5', name: 'Utensils', emoji: '🫖', isNew: true },
];

const RECOMMENDED_ITEMS = [
  {
    id: 'rec_1',
    name: 'Western BBQ Cheeseburger',
    restaurant: "McDonald's",
    price: '$6.69',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
    reason: 'Based on your past orders',
  },
  {
    id: 'rec_2',
    name: '8pc Chicken Bucket Meal',
    restaurant: 'KFC',
    price: '$18.99',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop',
    reason: 'Popular near you',
  },
  {
    id: 'rec_3',
    name: 'Avocado & Quinoa Power Salad',
    restaurant: 'Green & Fresh',
    price: '$9.49',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    reason: 'You liked healthy salads',
  },
];

const TRENDING = [
  {
    id: '1',
    name: "Harvey's",
    distance: '2.1 mi',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Harvey%27s_logo.svg/200px-Harvey%27s_logo.svg.png',
  },
  {
    id: '2',
    name: 'KFC',
    distance: '1.3 mi',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/200px-KFC_logo.svg.png',
  },
];

export default function HomeScreen() {
  const { addItem, getCartArray } = useCartStore();
  const cartItems = getCartArray();

  const handleQuickAdd = (rec: typeof RECOMMENDED_ITEMS[0]) => {
    addItem({
      id: rec.id,
      name: rec.name,
      price: parseFloat(rec.price.replace('$', '')),
      restaurantId: 'mcdonalds_1',
      restaurantName: rec.restaurant,
      image: rec.image,
    });

    router.push('/(customer)/cart');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Address + Order Now chips */}
        <View style={styles.chipRow}>
          <TouchableOpacity style={styles.chip} onPress={() => router.push('/address' as any)}>
            <Ionicons name="location-outline" size={14} color="#F59E0B" />
            <Text style={styles.chipText}>32, Kingston Ln.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Ionicons name="time-outline" size={14} color="#F59E0B" />
            <Text style={styles.chipText}>Order Now</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>Good Evening, Luisa 👋</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity style={styles.cartBadgeBtn} onPress={() => router.push('/(customer)/cart')}>
              <Ionicons name="bag" size={20} color="#38BDF8" />
              <View style={styles.badgeDot}>
                <Text style={styles.badgeCountText}>{cartItems.reduce((a, b) => a + b.qty, 0)}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(customer)/search' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color="#94A3B8" />
          <Text style={styles.searchPlaceholder}>Search Food, Restaurants etc.</Text>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() =>
                router.push({
                  pathname: '/(customer)/search',
                  params: { category: cat.name },
                } as any)
              }
            >
              <View style={styles.categoryCircle}>
                {cat.isNew ? (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                ) : null}
                <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/categories' as any)}>
            <View style={[styles.categoryCircle, styles.seeAllCircle]}>
              <Text style={styles.seeAllArrow}>→</Text>
            </View>
            <Text style={[styles.categoryName, { color: '#38BDF8' }]}>See all</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recommended For You Based On History */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <Text style={styles.historyBadge}>✨ Based on order history</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 10, marginBottom: 20 }}
        >
          {RECOMMENDED_ITEMS.map((rec) => (
            <View key={rec.id} style={styles.recCard}>
              <Image source={{ uri: rec.image }} style={styles.recImage} />
              <View style={styles.recBody}>
                <Text style={styles.recName} numberOfLines={1}>{rec.name}</Text>
                <Text style={styles.recRest}>{rec.restaurant}</Text>
                <View style={styles.recPriceRow}>
                  <Text style={styles.recPrice}>{rec.price}</Text>
                  <TouchableOpacity style={styles.addCartSmallBtn} onPress={() => handleQuickAdd(rec)}>
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Offers Near You */}
        <Text style={styles.sectionTitle}>Offers Near You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, marginBottom: 24 }}>
          {[
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop',
          ].map((uri, i) => (
            <TouchableOpacity key={i} style={styles.offerCard} onPress={() => router.push('/restaurant' as any)}>
              <Image source={{ uri }} style={styles.offerImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* New & Trending */}
        <Text style={styles.sectionTitle}>New &amp; Trending</Text>
        <View style={styles.trendingGrid}>
          {TRENDING.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.trendingCard}
              onPress={() => router.push('/restaurant' as any)}
            >
              <Image source={{ uri: item.image }} style={styles.trendingImage} resizeMode="cover" />
              <View style={styles.trendingFooter}>
                <Image source={{ uri: item.logo }} style={styles.trendingLogo} resizeMode="contain" />
                <View>
                  <Text style={styles.trendingName}>{item.name}</Text>
                  <Text style={styles.trendingDist}>{item.distance}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = (width - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  chipRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#92400E' },

  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#1E293B' },
  cartBadgeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 24,
    gap: 10,
  },
  searchPlaceholder: { fontSize: 14, color: '#94A3B8' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', paddingHorizontal: 16, marginBottom: 14 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  historyBadge: { fontSize: 11, fontWeight: '700', color: '#0284C7', backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 14 },

  categoriesRow: { paddingHorizontal: 16, gap: 16, paddingBottom: 8, marginBottom: 24 },
  categoryItem: { alignItems: 'center', width: 72 },
  categoryCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  newBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  categoryName: { fontSize: 12, fontWeight: '600', color: '#1E293B', textAlign: 'center' },
  seeAllCircle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  seeAllArrow: { fontSize: 22, color: '#38BDF8' },

  recCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  recImage: { width: '100%', height: 110 },
  recBody: { padding: 10 },
  recName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  recRest: { fontSize: 12, color: '#64748B', marginTop: 2 },
  recPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  recPrice: { fontSize: 14, fontWeight: '800', color: '#38BDF8' },
  addCartSmallBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  offerCard: {
    width: width * 0.8,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  offerImage: { width: '100%', height: '100%' },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 4,
  },
  trendingCard: {
    width: CARD_W,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trendingImage: { width: '100%', height: 120 },
  trendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  trendingLogo: { width: 28, height: 28, borderRadius: 14 },
  trendingName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  trendingDist: { fontSize: 12, color: '#94A3B8' },
});
