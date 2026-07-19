import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Button from '@/components/ui/Button';

const CART_ITEMS = [
  {
    restaurantId: 'r1',
    restaurantName: 'Himalayan Kitchen',
    distance: '1.2 km away',
    restaurantEmoji: '🥟',
    items: [
      { id: '1', name: 'Chicken Momo (10 pcs)', note: 'Extra spicy, jhol achar', price: 320, qty: 2 },
      { id: '2', name: 'Butter Chicken', note: 'Medium spice, extra gravy', price: 480, qty: 1 },
    ],
  },
  {
    restaurantId: 'r2',
    restaurantName: 'Spice Route',
    distance: '2.4 km away',
    restaurantEmoji: '🍛',
    items: [
      { id: '3', name: 'Veg Dum Biryani', note: 'No onion, add raita', price: 290, qty: 1 },
      { id: '4', name: 'Garlic Naan', note: 'Butter brushed', price: 90, qty: 2 },
    ],
  },
];

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'wallet', label: 'KhanaGo Wallet', icon: '👜' },
];

export default function CartScreen() {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    '1': 2, '2': 1, '3': 1, '4': 2,
  });
  const [promoCode, setPromoCode] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const subtotal = CART_ITEMS.flatMap((g) => g.items).reduce(
    (sum, item) => sum + item.price * (quantities[item.id] || item.qty),
    0
  );
  const tax = Math.round(subtotal * 0.13);
  const deliveryFee = 60;
  const platformFee = 15;
  const discount = 118;
  const total = subtotal + tax + deliveryFee + platformFee - discount;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart groups */}
        {CART_ITEMS.map((group) => (
          <View key={group.restaurantId} style={styles.group}>
            <View style={styles.groupHeader}>
              <View style={styles.groupLogo}>
                <Text style={{ fontSize: 20 }}>{group.restaurantEmoji}</Text>
              </View>
              <View>
                <Text style={styles.groupName}>{group.restaurantName}</Text>
                <Text style={styles.groupDist}>📍 {group.distance}</Text>
              </View>
            </View>

            {group.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={[styles.itemImg, { backgroundColor: '#FFF7ED' }]}>
                  <Text style={{ fontSize: 24 }}>🍽️</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemNote}>{item.note}</Text>
                  <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantities[item.id] || item.qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Promo code */}
        <View style={styles.promoContainer}>
          <Text style={styles.promoIcon}>🏷️</Text>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            placeholderTextColor={Colors.textLight}
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery instructions */}
        <View style={styles.instructionsContainer}>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Delivery instructions (optional)"
            placeholderTextColor={Colors.textLight}
            value={deliveryNote}
            onChangeText={setDeliveryNote}
          />
        </View>

        {/* Bill Details */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>
          {[
            { label: 'Subtotal', value: `Rs. ${subtotal}` },
            { label: 'Taxes (13%)', value: `Rs. ${tax}` },
            { label: 'Delivery Fee', value: `Rs. ${deliveryFee}` },
            { label: 'Platform Fee', value: `Rs. ${platformFee}` },
          ].map((row) => (
            <View key={row.label} style={styles.billRow}>
              <Text style={styles.billLabel}>{row.label}</Text>
              <Text style={styles.billValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: Colors.success }]}>Discount</Text>
            <Text style={[styles.billValue, { color: Colors.success }]}>- Rs. {discount}</Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandValue}>Rs. {total}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>📍 Delivery Address</Text>
            <TouchableOpacity>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressRow}>
            <View style={styles.mapThumb}>
              <Text style={{ fontSize: 24 }}>🗺️</Text>
            </View>
            <View>
              <Text style={styles.addressName}>Home</Text>
              <Text style={styles.addressDetail}>Ward 4, Jhamsikhel Marg, Lalitpur,{'\n'}Kathmandu 44600</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentRow}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={styles.paymentLabel}>{method.label}</Text>
              <View style={styles.radioOuter}>
                {selectedPayment === method.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Place Order button */}
      <View style={styles.placeOrderBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {total}</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} activeOpacity={0.9}>
          <Text style={styles.placeOrderText}>Place Order  →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  group: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.xl,
    padding: 14,
    ...Shadow.sm,
  },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  groupLogo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  groupDist: { fontSize: 12, color: Colors.textSecondary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  itemImg: { width: 58, height: 58, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  itemNote: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 4,
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: '400' },
  qtyValue: { color: '#fff', fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
  },
  promoIcon: { fontSize: 18, marginRight: 8 },
  promoInput: { flex: 1, height: 48, fontSize: 14, color: Colors.textDark },
  applyText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  instructionsContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    ...Shadow.sm,
  },
  instructionsInput: { height: 48, fontSize: 14, color: Colors.textDark },
  billCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadow.sm,
  },
  billTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, color: Colors.textSecondary },
  billValue: { fontSize: 14, color: Colors.textDark, fontWeight: '500' },
  billDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  grandLabel: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  grandValue: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  addressCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadow.sm,
  },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  addressTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  changeText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mapThumb: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  addressDetail: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  paymentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadow.sm,
  },
  paymentTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  paymentIcon: { fontSize: 20 },
  paymentLabel: { flex: 1, fontSize: 14, color: Colors.textDark, fontWeight: '500' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  placeOrderBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 24,
  },
  totalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  placeOrderBtn: { alignItems: 'center' },
  placeOrderText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
