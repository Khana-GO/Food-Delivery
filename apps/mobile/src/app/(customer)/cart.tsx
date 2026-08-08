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
import { QuantityStepper } from '../../components/ui/QuantityStepper';

export default function CartScreen() {
  const {
    items,
    updateQty,
    removeItem,
    promoCode,
    discountAmount,
    applyPromoCode,
    removePromoCode,
    savedForLater,
    saveItemForLater,
    moveFromSavedToCart,
    getCartArray,
    getSubtotal,
    getDeliveryFee,
    getTax,
    getTotal,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cartItems = getCartArray();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getTotal();

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (res.success) {
      setPromoMessage({ type: 'success', text: res.message });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={() => useCartStore.getState().clearCart()}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Good food is just a few taps away!</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push('/(customer)/search')}
            >
              <Text style={styles.browseText}>Explore Restaurants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <View style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <View key={item.cartKey} style={styles.cartItemRow}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.placeholderImg}>
                      <Text style={{ fontSize: 24 }}>🍔</Text>
                    </View>
                  )}

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemRestaurant}>{item.restaurantName}</Text>

                    {/* Customizations tags */}
                    {item.customizations && item.customizations.length > 0 && (
                      <View style={styles.customList}>
                        {item.customizations.map((c, i) => (
                          <Text key={i} style={styles.customTag}>
                            • {c}
                          </Text>
                        ))}
                      </View>
                    )}

                    {!!item.specialInstructions && (
                      <Text style={styles.instructionsText}>
                        Note: "{item.specialInstructions}"
                      </Text>
                    )}

                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                      <TouchableOpacity
                        onPress={() => saveItemForLater(item.cartKey)}
                        style={styles.saveLaterBtn}
                      >
                        <Ionicons name="bookmark-outline" size={13} color="#64748B" />
                        <Text style={styles.saveLaterText}>Save for later</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <QuantityStepper
                    value={item.qty}
                    onIncrement={() => updateQty(item.cartKey, 1)}
                    onDecrement={() => updateQty(item.cartKey, -1)}
                    min={0}
                    size="small"
                  />
                </View>
              ))}
            </View>

            {/* Promo Code Input Bar */}
            <View style={styles.promoContainer}>
              <Text style={styles.sectionHeader}>Promo Code / Voucher</Text>

              {promoCode ? (
                <View style={styles.activePromoCard}>
                  <Ionicons name="ticket" size={20} color="#22C55E" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activePromoCode}>{promoCode} Applied</Text>
                    <Text style={styles.activePromoSavings}>
                      Saving ${discountAmount.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={removePromoCode}>
                    <Text style={styles.removePromoText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.promoInputRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Try 'SAVE20' or 'FREEDEL'"
                    placeholderTextColor="#94A3B8"
                    value={promoInput}
                    onChangeText={setPromoInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
                    <Text style={styles.applyBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}

              {promoMessage && !promoCode && (
                <Text
                  style={[
                    styles.promoMsgText,
                    promoMessage.type === 'error' ? styles.errorMsg : styles.successMsg,
                  ]}
                >
                  {promoMessage.text}
                </Text>
              )}
            </View>

            {/* Bill Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionHeader}>Order Breakdown</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  {deliveryFee === 0 ? (
                    <Text style={{ color: '#22C55E', fontWeight: '800' }}>FREE</Text>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Tax (13%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>

              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#22C55E' }]}>Discount Savings</Text>
                  <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
                    -${discountAmount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Saved For Later Section */}
        {savedForLater.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.sectionHeader}>Saved For Later ({savedForLater.length})</Text>
            {savedForLater.map((sItem) => (
              <View key={sItem.cartKey} style={styles.savedItemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedName}>{sItem.name}</Text>
                  <Text style={styles.savedPrice}>${sItem.price.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.moveToCartBtn}
                  onPress={() => moveFromSavedToCart(sItem)}
                >
                  <Ionicons name="cart" size={16} color="#38BDF8" />
                  <Text style={styles.moveToCartText}>Move to Cart</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Checkout Action */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => router.push('/(customer)/checkout')}
            activeOpacity={0.9}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <View style={styles.checkoutPriceBadge}>
              <Text style={styles.checkoutPrice}>${total.toFixed(2)}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', flex: 1, marginLeft: 12 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  clearText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  emptySub: { fontSize: 14, color: '#64748B' },
  browseBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 12,
  },
  browseText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  itemsContainer: { paddingHorizontal: 16, paddingTop: 8 },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  itemImage: { width: 72, height: 72, borderRadius: 14 },
  placeholderImg: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  itemRestaurant: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  customList: { marginVertical: 4 },
  customTag: { fontSize: 11, color: '#475569' },
  instructionsText: { fontSize: 11, fontStyle: 'italic', color: '#F59E0B', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#38BDF8' },
  saveLaterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saveLaterText: { fontSize: 11, fontWeight: '600', color: '#64748B' },

  promoContainer: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  promoInput: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '600' },
  applyBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  activePromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  activePromoCode: { fontSize: 14, fontWeight: '800', color: '#166534' },
  activePromoSavings: { fontSize: 12, color: '#15803D' },
  removePromoText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  promoMsgText: { fontSize: 12, marginTop: 6, fontWeight: '600' },
  errorMsg: { color: '#EF4444' },
  successMsg: { color: '#22C55E' },

  summaryContainer: { paddingHorizontal: 16, paddingTop: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#64748B' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  totalRow: { marginTop: 8, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#38BDF8' },

  savedSection: { paddingHorizontal: 16, paddingTop: 24 },
  savedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  savedPrice: { fontSize: 13, color: '#38BDF8', fontWeight: '700', marginTop: 2 },
  moveToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  moveToCartText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },

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
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  checkoutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  checkoutPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutPrice: { fontSize: 16, fontWeight: '800', color: '#38BDF8' },
});
