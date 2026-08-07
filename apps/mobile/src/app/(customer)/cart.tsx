import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_CART = [
  {
    id: '1',
    name: 'Western BBQ Cheeseburger Meal',
    price: 6.69,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop',
    restaurant: 'McDonald\'s',
  },
  {
    id: '2',
    name: 'Spicy Chicken Sandwich',
    price: 5.49,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1626082895617-2c67678e0638?w=200&auto=format&fit=crop',
    restaurant: 'KFC',
  },
];

export default function CartScreen() {
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.13;
  const deliveryFee = 2.99;
  const total = subtotal + tax + deliveryFee;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Your cart is empty.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(customer)/search')}>
              <Text style={styles.browseText}>Browse Food</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItemRow}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemRestaurant}>{item.restaurant}</Text>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  </View>

                  <View style={styles.quantityControl}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                      <Ionicons name="remove" size={16} color="#64748B" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                      <Ionicons name="add" size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Receipt Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Checkout Bottom Bar */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => console.log('Checkout')}>
            <Text style={styles.checkoutText}>Checkout</Text>
            <Text style={styles.checkoutPrice}>${total.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backText: { fontSize: 15, color: '#1E293B', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: '#1E293B' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  browseBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  browseText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  
  itemsContainer: { paddingHorizontal: 16 },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  itemImage: { width: 72, height: 72, borderRadius: 12 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  itemRestaurant: { fontSize: 13, color: '#94A3B8', marginBottom: 8 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#38BDF8' },
  
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  qtyText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  
  summaryContainer: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: '#64748B' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  totalRow: { marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#38BDF8' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
  },
  checkoutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  checkoutPrice: { fontSize: 16, fontWeight: '700', color: '#38BDF8' },
});
