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
import { useCartStore } from '../store/cartStore';
import { ItemCustomizationModal, MenuItemData } from '../components/restaurant/ItemCustomizationModal';

const { width } = Dimensions.get('window');

const MENU_TABS = ['Breakfast Menu', 'Lunch & Dinner', 'Overnight Menu'];
const CATEGORY_CHIPS = ["Today's Deals", 'Burger Meals', 'Chicken & Fish'];

const RESTAURANT_DATA = {
  id: 'mcdonalds_1',
  name: "McDonald's",
  address: 'Bramlea & Sandalwood, Brampton',
  rating: 4.5,
  prepTime: '15-20 min',
  deliveryFee: '$2.99',
};

const MENU_ITEMS: MenuItemData[] = [
  {
    id: 'mcd_1',
    name: 'Western BBQ Cheeseburger Meal',
    calories: '400 Cals',
    price: 6.69,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop',
    restaurantId: RESTAURANT_DATA.id,
    restaurantName: RESTAURANT_DATA.name,
  },
  {
    id: 'mcd_2',
    name: 'Simply Cheese with Sesame Buns',
    calories: '320 Cals',
    price: 3.59,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&auto=format&fit=crop',
    restaurantId: RESTAURANT_DATA.id,
    restaurantName: RESTAURANT_DATA.name,
  },
  {
    id: 'mcd_3',
    name: 'Double Angus Classic',
    calories: '550 Cals',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop',
    restaurantId: RESTAURANT_DATA.id,
    restaurantName: RESTAURANT_DATA.name,
  },
];

export default function RestaurantScreen() {
  const [activeTab, setActiveTab] = useState(1);
  const [activeChip, setActiveChip] = useState(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addItem, getCartArray, getTotal } = useCartStore();
  const cartItems = getCartArray();
  const cartTotal = getTotal();

  const handleAddToCart = (customizedItem: {
    item: MenuItemData;
    customizations: string[];
    specialInstructions: string;
    finalPrice: number;
    qty: number;
  }) => {
    addItem({
      id: customizedItem.item.id,
      name: customizedItem.item.name,
      price: customizedItem.finalPrice,
      restaurantId: customizedItem.item.restaurantId,
      restaurantName: customizedItem.item.restaurantName,
      image: customizedItem.item.image,
      customizations: customizedItem.customizations,
      specialInstructions: customizedItem.specialInstructions,
    });
  };

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
          {/* Back / Bag overlay */}
          <SafeAreaView style={styles.heroOverlay} edges={['top']}>
            <TouchableOpacity onPress={() => router.back()} style={styles.heroBtn}>
              <Ionicons name="arrow-back" size={20} color="#1E293B" />
            </TouchableOpacity>
            <View style={styles.heroRightBtns}>
              <TouchableOpacity style={styles.heroIconBtn} onPress={() => router.push('/(customer)/search')}>
                <Ionicons name="search" size={18} color="#1E293B" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroIconBtn} onPress={() => router.push('/(customer)/cart')}>
                <Ionicons name="bag-outline" size={18} color="#1E293B" />
                {cartItems.length > 0 && <View style={styles.cartBadge} />}
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
              <Text style={styles.restaurantName}>{RESTAURANT_DATA.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={13} color="#94A3B8" />
                <Text style={styles.restaurantAddress}>{RESTAURANT_DATA.address}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.favoriteBtn, isFavorite && styles.favoriteBtnActive]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.statText}>Rating: {RESTAURANT_DATA.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bicycle-outline" size={14} color="#64748B" />
              <Text style={styles.statText}>{RESTAURANT_DATA.prepTime}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="wallet-outline" size={14} color="#64748B" />
              <Text style={styles.statText}>Fee: {RESTAURANT_DATA.deliveryFee}</Text>
            </View>
          </View>
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
              {activeTab === i ? <View style={styles.menuTabUnderline} /> : null}
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
        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => setSelectedMenuItem(item)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.image }} style={styles.menuItemImage} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {!!item.calories && <Text style={styles.menuItemCal}>{item.calories}</Text>}
                <Text style={styles.discountPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.addIconCircle}>
                <Ionicons name="add" size={18} color="#1E293B" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom View Cart Bar */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => router.push('/(customer)/cart')}
            activeOpacity={0.9}
          >
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{cartItems.reduce((acc, i) => acc + i.qty, 0)}</Text>
            </View>
            <Text style={styles.viewCartText}>View Cart</Text>
            <Text style={styles.viewCartPrice}>${cartTotal.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Item Customization Modal */}
      <ItemCustomizationModal
        visible={!!selectedMenuItem}
        item={selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
        onAddToCart={handleAddToCart}
      />
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
    paddingTop: 8,
  },
  heroBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRightBtns: { flexDirection: 'row', gap: 8 },
  heroIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
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
  favoriteBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  statsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 13, color: '#1E293B', fontWeight: '600' },

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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuItemImage: { width: 68, height: 68, borderRadius: 12 },
  menuItemName: { fontSize: 15, fontWeight: '700', color: '#1E293B', flexShrink: 1 },
  menuItemCal: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  discountPrice: { fontSize: 15, fontWeight: '800', color: '#38BDF8', marginTop: 4 },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 16,
  },
  badgeCount: {
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  viewCartPrice: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '700',
  },
});
