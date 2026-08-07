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

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Burgers', emoji: '🍔' },
  { id: '2', name: 'Grocery', emoji: '🛍️' },
  { id: '3', name: 'Salads', emoji: '🥗' },
  { id: '4', name: 'Sweets', emoji: '🍩' },
  { id: '5', name: 'Utensils', emoji: '🫖', isNew: true },
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
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Address + Order Now chips */}
        <View style={styles.chipRow}>
          <TouchableOpacity style={styles.chip} onPress={() => router.push('/(customer)/address' as any)}>
            <Ionicons name="location-outline" size={14} color="#F59E0B" />
            <Text style={styles.chipText}>32, Kingston Ln.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Ionicons name="time-outline" size={14} color="#F59E0B" />
            <Text style={styles.chipText}>Order Now</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Good Evening Luisa</Text>

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
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={styles.categoryCircle}>
                {cat.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/(customer)/categories' as any)}>
            <View style={[styles.categoryCircle, styles.seeAllCircle]}>
              <Text style={styles.seeAllArrow}>→</Text>
            </View>
            <Text style={[styles.categoryName, { color: '#38BDF8' }]}>See all</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Offers Near You */}
        <Text style={styles.sectionTitle}>Offers Near you</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {[
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop',
          ].map((uri, i) => (
            <TouchableOpacity key={i} style={styles.offerCard}>
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
              onPress={() => router.push('/(customer)/restaurant' as any)}
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
  greeting: { fontSize: 30, fontWeight: '800', color: '#1E293B', paddingHorizontal: 16, marginBottom: 16 },
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
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', paddingHorizontal: 16, marginBottom: 16 },
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
  offerCard: {
    width: width * 0.8,
    height: 160,
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
