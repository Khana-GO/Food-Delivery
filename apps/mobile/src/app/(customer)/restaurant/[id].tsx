import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const RESTAURANT_DATA = {
  name: 'Himalayan Spice Kitchen',
  cuisine: 'Authentic Nepalese · Momo · Thali',
  rating: 4.8,
  reviews: '2.4k',
  deliveryTime: '25 min',
  fee: 'Rs 60',
  distance: '1.8 km',
  description:
    'Cozy family-run spot serving hand-folded momos, hearty dal bhat thali sets and Himalayan classics made with fresh local spices.',
  isOpen: true,
  emoji: '🏔️',
  bgColor: '#F3F4F6',
};

const MENU_CATEGORIES = ['Momo', 'Thali', 'Drinks', 'Desserts'];

const MENU_ITEMS: Record<string, Array<{
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  isVeg: boolean;
  isAvailable: boolean;
  isSpicy?: boolean;
}>> = {
  Momo: [
    {
      id: '1',
      name: 'Steamed Chicken Momo',
      description: '10 juicy hand-folded dumplings with house achar dip.',
      price: 220,
      emoji: '🥟',
      isVeg: false,
      isAvailable: true,
      isSpicy: true,
    },
    {
      id: '2',
      name: 'Veg Fried Momo',
      description: 'Crispy pan-fried veggie dumplings, golden & crunchy.',
      price: 190,
      emoji: '🥟',
      isVeg: true,
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Classic Dal Bhat Thali',
      description: 'Rice, lentil soup, seasonal veg, pickle & papad.',
      price: 350,
      emoji: '🍱',
      isVeg: true,
      isAvailable: false,
    },
    {
      id: '4',
      name: 'Himali Chicken Curry',
      description: 'Slow-cooked chicken in rich mountain spice gravy.',
      price: 420,
      emoji: '🍛',
      isVeg: false,
      isAvailable: true,
      isSpicy: true,
    },
    {
      id: '5',
      name: 'Masala Milk Tea',
      description: 'Aromatic spiced Himalayan chai brewed with fresh milk.',
      price: 90,
      emoji: '🍵',
      isVeg: true,
      isAvailable: true,
    },
  ],
  Thali: [
    {
      id: '6',
      name: 'Classic Dal Bhat Thali',
      description: 'Rice, lentil soup, seasonal veg, pickle & papad.',
      price: 350,
      emoji: '🍱',
      isVeg: true,
      isAvailable: true,
    },
    {
      id: '7',
      name: 'Special Thali',
      description: 'Dal, bhat, sabzi, achar, papad, dessert.',
      price: 480,
      emoji: '🍽️',
      isVeg: false,
      isAvailable: true,
    },
  ],
  Drinks: [
    {
      id: '8',
      name: 'Masala Milk Tea',
      description: 'Aromatic spiced Himalayan chai.',
      price: 90,
      emoji: '🍵',
      isVeg: true,
      isAvailable: true,
    },
    {
      id: '9',
      name: 'Fresh Lemon Soda',
      description: 'Refreshing lemon soda with a twist.',
      price: 80,
      emoji: '🍋',
      isVeg: true,
      isAvailable: true,
    },
  ],
  Desserts: [
    {
      id: '10',
      name: 'Kheer',
      description: 'Creamy rice pudding with cardamom.',
      price: 150,
      emoji: '🍮',
      isVeg: true,
      isAvailable: true,
    },
  ],
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState('Momo');
  const [cart, setCart] = useState<Record<string, number>>({});

  const addToCart = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const items = MENU_ITEMS[activeCategory] || [];
  const totalInCart = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.screen}>
      {/* Hero image */}
      <View style={styles.hero}>
        <View style={styles.heroImageBg}>
          <Text style={styles.heroEmoji}>{RESTAURANT_DATA.emoji}</Text>
        </View>
        <TouchableOpacity style={[styles.heroBtn, styles.heroBtnLeft]} onPress={() => router.back()}>
          <Text>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.heroBtn, styles.heroBtnRight]}>
          <Text>↗️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.heroBtn, styles.heroBtnRight2]}>
          <Text>🤍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.restaurantName}>{RESTAURANT_DATA.name}</Text>
            <Badge label="Open" variant="success" />
          </View>
          <Text style={styles.cuisine}>{RESTAURANT_DATA.cuisine}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {RESTAURANT_DATA.rating}</Text>
              <Text style={styles.statLabel}>{RESTAURANT_DATA.reviews} reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⏱ {RESTAURANT_DATA.deliveryTime}</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🚴 {RESTAURANT_DATA.fee}</Text>
              <Text style={styles.statLabel}>Fee</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>📍 {RESTAURANT_DATA.distance}</Text>
              <Text style={styles.statLabel}>Away</Text>
            </View>
          </View>

          <Text style={styles.description}>{RESTAURANT_DATA.description}</Text>
        </View>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {MENU_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.tabItem, activeCategory === cat && styles.tabItemActive]}
            >
              <Text
                style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu section */}
        <View style={styles.menuSection}>
          <View style={styles.menuSectionHeader}>
            <Text style={styles.menuSectionTitle}>{activeCategory} Menu</Text>
            <Text style={styles.menuItemCount}>{items.length} items</Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={[styles.menuItemImg, { backgroundColor: '#FFF7ED' }]}>
                <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
              </View>

              <View style={styles.menuItemInfo}>
                <View style={styles.menuItemNameRow}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  {item.isSpicy && <Text style={{ fontSize: 12 }}>🌶️</Text>}
                </View>
                <Text style={styles.menuItemDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.menuItemPrice}>Rs {item.price}</Text>
              </View>

              {item.isAvailable ? (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addToCart(item.id)}
                >
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.unavailableTag}>
                  <Text style={styles.unavailableText}>Unavailable</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cart floating button */}
      {totalInCart > 0 && (
        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => router.push('/(customer)/cart' as any)}
            activeOpacity={0.9}
          >
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{totalInCart}</Text>
            </View>
            <Text style={styles.cartBtnText}>View Cart</Text>
            <Text style={styles.cartBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 220, position: 'relative' },
  heroImageBg: {
    flex: 1,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 72 },
  heroBtn: {
    position: 'absolute',
    top: 48,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnLeft: { left: 16 },
  heroBtnRight: { right: 16 },
  heroBtnRight2: { right: 62 },
  content: { flex: 1 },
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadow.md,
    marginBottom: 12,
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  restaurantName: { fontSize: 20, fontWeight: '800', color: Colors.textDark, flex: 1, marginRight: 8 },
  cuisine: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  description: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  tabItemActive: { backgroundColor: Colors.textDark },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  menuSection: { paddingHorizontal: 16 },
  menuSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuSectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  menuItemCount: { fontSize: 13, color: Colors.textSecondary },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: 10,
    ...Shadow.sm,
    gap: 12,
  },
  menuItemImg: {
    width: 74,
    height: 74,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuItemInfo: { flex: 1 },
  menuItemNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  menuItemName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, flex: 1 },
  menuItemDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 6 },
  menuItemPrice: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '400', lineHeight: 28 },
  unavailableTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
  },
  unavailableText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  cartBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  cartBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
    ...Shadow.lg,
  },
  cartCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
