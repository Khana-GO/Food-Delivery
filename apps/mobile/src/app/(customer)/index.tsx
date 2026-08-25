import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Spacing, Shadow } from '@/constants/theme';
import Badge from '@/components/ui/Badge';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const CATEGORIES = [
  { id: '1', name: 'Momo', emoji: '🥟' },
  { id: '2', name: 'Pizza', emoji: '🍕' },
  { id: '3', name: 'Burger', emoji: '🍔' },
  { id: '4', name: 'Thali', emoji: '🍱' },
  { id: '5', name: 'Drinks', emoji: '🥤' },
  { id: '6', name: 'Dessert', emoji: '🍦' },
];

const RESTAURANTS = [
  {
    id: '1',
    name: 'Himalayan Momo House',
    rating: 4.8,
    reviews: '2.1k',
    time: '20-25 min',
    fee: 'Rs. 40',
    distance: '1.2 km',
    cuisine: ['Nepali', 'Dumplings'],
    isOpen: true,
    emoji: '🥟',
    color: '#FEF3C7',
  },
  {
    id: '2',
    name: 'Napoli Pizza Co.',
    rating: 4.6,
    reviews: '980',
    time: '30-35 min',
    fee: 'Rs. 60',
    distance: '2.4 km',
    cuisine: ['Italian', 'Pizza'],
    isOpen: true,
    emoji: '🍕',
    color: '#FEE2E2',
  },
  {
    id: '3',
    name: 'Baneshwor Burger Lab',
    rating: 4.5,
    reviews: '1.4k',
    time: '25 min',
    fee: 'Rs. 50',
    distance: '0.8 km',
    cuisine: ['Fast Food', 'Burgers'],
    isOpen: true,
    emoji: '🍔',
    color: '#DCFCE7',
  },
  {
    id: '4',
    name: 'Spice Route Biryani',
    rating: 4.7,
    reviews: '2.6k',
    time: '35-40 min',
    fee: 'Rs. 70',
    distance: '3.1 km',
    cuisine: ['Indian', 'Biryani'],
    isOpen: false,
    emoji: '🍛',
    color: '#EDE9FE',
  },
  {
    id: '5',
    name: 'Grill & Chill',
    rating: 4.4,
    reviews: '760',
    time: '28 min',
    fee: 'Rs. 55',
    distance: '1.9 km',
    cuisine: ['Grill', 'Chicken'],
    isOpen: true,
    emoji: '🍗',
    color: '#FFF7ED',
  },
  {
    id: '6',
    name: 'Wok Street Noodles',
    rating: 4.6,
    reviews: '1.1k',
    time: '22 min',
    fee: 'Rs. 45',
    distance: '1.5 km',
    cuisine: ['Chinese', 'Noodles'],
    isOpen: true,
    emoji: '🍜',
    color: '#F0FDF4',
  },
  {
    id: '7',
    name: 'The Corner Kitchen',
    rating: 4.3,
    reviews: '540',
    time: '15 min',
    fee: 'Rs. 30',
    distance: '0.4 km',
    cuisine: ['Multi-cuisine', 'Cafe'],
    isOpen: true,
    emoji: '☕',
    color: '#FDF2F8',
  },
  {
    id: '8',
    name: 'Taco Fiesta',
    rating: 4.2,
    reviews: '410',
    time: '18 min',
    fee: 'Rs. 35',
    distance: '0.6 km',
    cuisine: ['Mexican', 'Street Food'],
    isOpen: true,
    emoji: '🌮',
    color: '#FEF9C3',
  },
];

function RestaurantCard({ restaurant }: { restaurant: (typeof RESTAURANTS)[0] }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/(customer)/restaurant/${restaurant.id}` as any)}
    >
      {/* Image placeholder */}
      <View style={[styles.cardImage, { backgroundColor: restaurant.color }]}>
        <Text style={styles.cardEmoji}>{restaurant.emoji}</Text>
        <Badge
          label={restaurant.isOpen ? 'Open' : 'Closed'}
          variant={restaurant.isOpen ? 'success' : 'error'}
          style={styles.openBadge}
        />
        <TouchableOpacity style={styles.heartBtn}>
          <Text>🤍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaStar}>⭐ {restaurant.rating}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaInfo}>({restaurant.reviews})</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.metaInfo}>⏱ {restaurant.time}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaInfo}>🚴 {restaurant.fee}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaInfo}>📍 {restaurant.distance}</Text>
        </View>
        <View style={styles.tagRow}>
          {restaurant.cuisine.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Afternoon, Anish 👋</Text>
            <TouchableOpacity style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText}>Kathmandu, Baneshwor</Text>
              <Text style={styles.locationChevron}> ˅</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/(customer)/notifications' as any)}
            >
              <Text style={styles.iconBtnText}>🔔</Text>
              <View style={styles.notifBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnGreen]}
              onPress={() => router.push('/(customer)/chat' as any)}
            >
              <Text style={styles.iconBtnText}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, food..."
            placeholderTextColor={Colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Text>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={styles.categoryIconBg}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Best Offers */}
        <SectionHeader title="Best Offers" onSeeAll={() => {}} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersContainer}
        >
          <View style={[styles.offerCard, { backgroundColor: Colors.primary }]}>
            <Text style={styles.offerTitle}>50% OFF</Text>
            <Text style={styles.offerSub}>On your first 3 orders</Text>
            <View style={styles.promoChip}>
              <Text style={styles.promoText}>Use KHANA50</Text>
            </View>
            <Text style={styles.offerEmoji}>🍜</Text>
          </View>
          <View style={[styles.offerCard, { backgroundColor: '#1E3A5F' }]}>
            <Text style={styles.offerTitle}>Free{'\n'}Delivery</Text>
            <Text style={styles.offerSub}>On orders above Rs. 500</Text>
            <View style={[styles.promoChip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.promoText, { color: '#fff' }]}>Limited time</Text>
            </View>
            <Text style={styles.offerEmoji}>🍕</Text>
          </View>
        </ScrollView>

        {/* Featured Restaurants */}
        <SectionHeader title="Featured Restaurants" onSeeAll={() => {}} />
        <View style={styles.twoCol}>
          {RESTAURANTS.slice(0, 2).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        {/* Popular Restaurants */}
        <SectionHeader title="Popular Restaurants" onSeeAll={() => {}} />
        <View style={styles.twoCol}>
          {RESTAURANTS.slice(2, 4).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        {/* Recommended */}
        <SectionHeader title="Recommended For You" onSeeAll={() => {}} />
        <View style={styles.twoCol}>
          {RESTAURANTS.slice(4, 6).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        {/* Nearby */}
        <SectionHeader title="Nearby Restaurants" onSeeAll={() => {}} />
        <View style={styles.twoCol}>
          {RESTAURANTS.slice(6, 8).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationPin: { fontSize: 13 },
  locationText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  locationChevron: { fontSize: 13, color: Colors.textSecondary },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  iconBtnGreen: { backgroundColor: '#D1FAE5' },
  iconBtnText: { fontSize: 18 },
  notifBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    height: 48,
    ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textDark },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  categoryItem: { alignItems: 'center', gap: 6 },
  categoryIconBg: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  categoryEmoji: { fontSize: 26 },
  categoryName: { fontSize: 12, color: Colors.textMedium, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  offersContainer: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  offerCard: {
    width: width * 0.65,
    borderRadius: Radius['2xl'],
    padding: 18,
    overflow: 'hidden',
  },
  offerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 26,
  },
  offerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  promoChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  promoText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  offerEmoji: { fontSize: 42, position: 'absolute', right: 16, bottom: 12 },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
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
