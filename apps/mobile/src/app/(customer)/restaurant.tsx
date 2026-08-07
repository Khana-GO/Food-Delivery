import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MENU_TABS = ['Breakfast Menu', 'Lunch & Dinner', 'Overnight Menu'];
const CATEGORY_CHIPS = ["Today's Deals", 'Burger Meals', 'Chicken & Fish'];

const MENU_ITEMS = [
  {
    id: '1',
    name: 'Classic Cheese Hamburger',
    calories: '(400 Cals)',
    originalPrice: '$5.80',
    price: '$4.59',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Simply Cheese with Sesame Seed buns',
    calories: '',
    originalPrice: '$4.80',
    price: '$3.59',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=120&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Double Angus Classic',
    calories: '(500 Cals)',
    originalPrice: '$7.80',
    price: '$5.99',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop',
  },
];

export default function RestaurantScreen() {
  const [activeTab, setActiveTab] = useState(1); // Lunch & Dinner active
  const [activeChip, setActiveChip] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&auto=format&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Back / More / Search / Bag icons */}
          <SafeAreaView style={styles.heroOverlay} edges={['top']}>
            <TouchableOpacity onPress={() => router.back()} style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.heroRightBtns}>
              <TouchableOpacity style={styles.heroIconBtn}>
                <Text style={{ fontSize: 18 }}>···</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroIconBtn}>
                <Ionicons name="search" size={18} color="#1E293B" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroIconBtn}>
                <Ionicons name="bag-outline" size={18} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.restaurantLogo}>
              <Text style={{ fontSize: 28 }}>🍔</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>McDonald's</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={13} color="#94A3B8" />
                <Text style={styles.restaurantAddress}>Bramlea &amp; Sandalwood</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.favoriteBtn}>
              <Ionicons name="heart-outline" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Card */}
          <TouchableOpacity style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.statText}>Ratings: 4.5</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bicycle-outline" size={14} color="#64748B" />
              <Text style={styles.statText}>Delivers in 15-20 min</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="grid-outline" size={14} color="#64748B" />
              <Text style={styles.statText}>Burgers</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Menu Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.menuTabsScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}
        >
          {MENU_TABS.map((tab, i) => (
            <TouchableOpacity key={i} onPress={() => setActiveTab(i)} style={styles.menuTab}>
              <Text style={[styles.menuTabText, activeTab === i && styles.menuTabTextActive]}>{tab}</Text>
              {activeTab === i && <View style={styles.menuTabUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 12 }}
        >
          {CATEGORY_CHIPS.map((chip, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveChip(i)}
              style={[styles.chip, activeChip === i && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeChip === i && styles.chipTextActive]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 16 }}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push('/(customer)/meal' as any)}
            >
              <Image source={{ uri: item.image }} style={styles.menuItemImage} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {!!item.calories && (
                  <Text style={styles.menuItemCal}>{item.calories}</Text>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                  <Text style={styles.discountPrice}>{item.price}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: { height: 240, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  heroBtn: { paddingVertical: 6 },
  heroBtnText: { fontSize: 15, color: '#1E293B', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  heroRightBtns: { flexDirection: 'row', gap: 8 },
  heroIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  restaurantLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantName: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  restaurantAddress: { fontSize: 13, color: '#94A3B8' },
  favoriteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 13, color: '#1E293B' },
  menuTabsScroll: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuTab: { paddingVertical: 14, position: 'relative' },
  menuTabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  menuTabTextActive: { color: '#1E293B' },
  menuTabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: '#1E293B', borderRadius: 1 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chipActive: { backgroundColor: '#1E293B' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#FFFFFF' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuItemImage: { width: 64, height: 64, borderRadius: 10 },
  menuItemName: { fontSize: 15, fontWeight: '600', color: '#1E293B', flexShrink: 1 },
  menuItemCal: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  originalPrice: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through' },
  discountPrice: { fontSize: 14, fontWeight: '700', color: '#38BDF8' },
});
