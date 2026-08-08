import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';

// Localized Addresses for Nepal
const SAVED_ADDRESSES = [
  {
    id: 'addr_1',
    label: 'Home',
    city: 'Kathmandu',
    address: 'Durbar Marg, House #45, Kathmandu',
    landmark: 'Near Annapurna Hotel',
    isDefault: true,
  },
  {
    id: 'addr_2',
    label: 'Work / Office',
    city: 'Lalitpur',
    address: 'Jhamsikhel Road, Ward #3, Lalitpur',
    landmark: 'Opposite Labim Mall',
    isDefault: false,
  },
];

// Localized Nepal Payment Methods with Tokenized Badges
const NEPAL_PAYMENT_METHODS = [
  {
    id: 'esewa',
    name: 'eSewa Mobile Wallet',
    badge: 'Tokenized • 9841****89',
    icon: 'wallet-outline',
    color: '#60BB46',
    popular: true,
  },
  {
    id: 'khalti',
    name: 'Khalti Digital Wallet',
    badge: 'Linked • 9851****12',
    icon: 'card-outline',
    color: '#5C2D91',
    popular: true,
  },
  {
    id: 'fonepay',
    name: 'Fonepay / Direct Bank QR',
    badge: 'Instant QR Pay',
    icon: 'qr-code-outline',
    color: '#DC2626',
    popular: false,
  },
  {
    id: 'card_visa',
    name: 'Visa / Mastercard',
    badge: 'Saved •••• 4242',
    icon: 'card',
    color: '#0284C7',
    popular: false,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    badge: 'Pay NPR in cash to driver',
    icon: 'cash-outline',
    color: '#059669',
    popular: false,
  },
];

export default function CheckoutScreen() {
  const {
    getCartArray,
    getSubtotal,
    getDeliveryFee,
    getTax,
    getTotal,
    discountAmount,
    deliveryNotes,
    setDeliveryNotes,
    clearCart,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0].id);
  const [selectedPayment, setSelectedPayment] = useState(NEPAL_PAYMENT_METHODS[0].id);
  const [deliveryTiming, setDeliveryTiming] = useState<'asap' | 'scheduled'>('asap');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = getCartArray();
  const subtotal = getSubtotal() * 100; // Converted to NPR ratio for display
  const deliveryFee = getDeliveryFee() > 0 ? 50 : 0; // NPR 50 flat delivery fee
  const tax = Math.round(subtotal * 0.13); // 13% VAT in Nepal
  const discountNpr = Math.round(discountAmount * 100);
  const totalNpr = Math.max(0, subtotal + deliveryFee + tax - discountNpr);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Please add food items to proceed.');
      return;
    }

    const paymentObj = NEPAL_PAYMENT_METHODS.find((p) => p.id === selectedPayment);

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      clearCart();

      // Navigate to live tracking screen
      router.replace({
        pathname: '/(customer)/orders/track',
        params: {
          orderId: 'NP-' + Math.floor(100000 + Math.random() * 900000),
          paymentMethod: paymentObj?.name || 'eSewa',
        },
      } as any);
    }, 1400);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Checkout (Nepal)</Text>
          <Text style={styles.subTitle}>Fast Delivery to Kathmandu &amp; Lalitpur</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Delivery Address Section (Nepal Address Book) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="location-outline" size={20} color="#38BDF8" />
            <Text style={styles.sectionTitle}>Delivery Address (Nepal)</Text>
            <TouchableOpacity onPress={() => router.push('/address' as any)}>
              <Text style={styles.changeText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressList}>
            {SAVED_ADDRESSES.map((addr) => {
              const selected = selectedAddress === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addressBox, selected && styles.addressBoxSelected]}
                  onPress={() => setSelectedAddress(addr.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.addressRow}>
                    <View style={styles.labelBadge}>
                      <Text style={styles.labelText}>🇳🇵 {addr.label}</Text>
                    </View>
                    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={styles.addressText}>{addr.address}</Text>
                  <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Delivery Instructions Field */}
          <Text style={styles.inputLabel}>Instructions for Driver</Text>
          <View style={styles.inputBox}>
            <Ionicons name="document-text-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.textInput}
              placeholder="E.g., Call when near gate, leave with security at main door"
              placeholderTextColor="#94A3B8"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
            />
          </View>
        </View>

        {/* Delivery Time Selection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Delivery Time</Text>
          </View>

          <View style={styles.timingRow}>
            <TouchableOpacity
              style={[styles.timingOption, deliveryTiming === 'asap' && styles.timingOptionSelected]}
              onPress={() => setDeliveryTiming('asap')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="flash"
                size={18}
                color={deliveryTiming === 'asap' ? '#38BDF8' : '#64748B'}
              />
              <View>
                <Text style={[styles.timingTitle, deliveryTiming === 'asap' && styles.timingTitleSelected]}>
                  ASAP (20-30 min)
                </Text>
                <Text style={styles.timingSub}>Express rider dispatch</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.timingOption, deliveryTiming === 'scheduled' && styles.timingOptionSelected]}
              onPress={() => setDeliveryTiming('scheduled')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={deliveryTiming === 'scheduled' ? '#38BDF8' : '#64748B'}
              />
              <View>
                <Text style={[styles.timingTitle, deliveryTiming === 'scheduled' && styles.timingTitleSelected]}>
                  Schedule Time
                </Text>
                <Text style={styles.timingSub}>Pick custom slot</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods (Nepal Digital Wallets & Cards) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="wallet-outline" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Payment Methods (Nepal)</Text>
          </View>

          <View style={styles.paymentList}>
            {NEPAL_PAYMENT_METHODS.map((pay) => {
              const selected = selectedPayment === pay.id;
              return (
                <TouchableOpacity
                  key={pay.id}
                  style={[styles.paymentRow, selected && styles.paymentRowSelected]}
                  onPress={() => setSelectedPayment(pay.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.paymentIconBox, { backgroundColor: pay.color + '15' }]}>
                    <Ionicons name={pay.icon as any} size={20} color={pay.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.paymentLabel, selected && styles.paymentLabelSelected]}>
                        {pay.name}
                      </Text>
                      {pay.popular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>POPULAR</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paymentBadgeText}>{pay.badge}</Text>
                  </View>

                  <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Final Order Review & NPR Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Review ({cartItems.length} items)</Text>

          <View style={styles.itemsReviewList}>
            {cartItems.map((item) => (
              <View key={item.cartKey} style={styles.reviewItemRow}>
                <Text style={styles.reviewQty}>{item.qty}x</Text>
                <Text style={styles.reviewName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.reviewPrice}>Rs. {(item.price * 100 * item.qty).toFixed(0)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(0)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge (Kathmandu Valley)</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? (
                <Text style={{ color: '#22C55E', fontWeight: '800' }}>FREE</Text>
              ) : (
                `Rs. ${deliveryFee}`
              )}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Government VAT (13%)</Text>
            <Text style={styles.summaryValue}>Rs. {tax}</Text>
          </View>

          {discountNpr > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#22C55E' }]}>Promo Discount</Text>
              <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
                -Rs. {discountNpr}
              </Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>Rs. {totalNpr.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, isSubmitting && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.9}
        >
          <Text style={styles.placeOrderText}>
            {isSubmitting ? 'Processing Payment...' : 'Confirm & Place Order'}
          </Text>

          {!isSubmitting && (
            <View style={styles.totalPriceBadge}>
              <Text style={styles.totalPriceText}>Rs. {totalNpr.toLocaleString()}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  subTitle: { fontSize: 12, color: '#64748B' },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', flex: 1 },
  changeText: { fontSize: 13, fontWeight: '700', color: '#38BDF8' },

  addressList: { gap: 10, marginBottom: 14 },
  addressBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressBoxSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  addressText: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginTop: 6 },
  landmarkText: { fontSize: 12, color: '#64748B', marginTop: 2 },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: { borderColor: '#38BDF8' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#38BDF8' },

  inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginTop: 4, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  textInput: { flex: 1, fontSize: 13, color: '#1E293B' },

  timingRow: { flexDirection: 'row', gap: 10 },
  timingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timingOptionSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  timingTitle: { fontSize: 13, fontWeight: '700', color: '#475569' },
  timingTitleSelected: { color: '#0284C7' },
  timingSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  paymentList: { gap: 8 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  paymentRowSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  paymentLabelSelected: { color: '#0284C7' },
  popularBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularText: { fontSize: 9, fontWeight: '800', color: '#15803D' },
  paymentBadgeText: { fontSize: 12, color: '#64748B', marginTop: 2 },

  itemsReviewList: { gap: 8, marginVertical: 12 },
  reviewItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewQty: { fontSize: 13, fontWeight: '800', color: '#38BDF8' },
  reviewName: { flex: 1, fontSize: 14, color: '#475569' },
  reviewPrice: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#64748B' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  totalRow: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#38BDF8' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  placeOrderBtnDisabled: { backgroundColor: '#94A3B8' },
  placeOrderText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  totalPriceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  totalPriceText: { fontSize: 16, fontWeight: '800', color: '#38BDF8' },
});
