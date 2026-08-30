import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCartStore } from '@/stores/customer/cartStore';
import PremiumCard from '@/components/ui/PremiumCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function CartScreen() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, restaurantId } = useCartStore();
  const deliveryFee = 50;
  const grandTotal = totalPrice + deliveryFee;

  const handleClear = () => {
    Alert.alert('Clear cart?', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
        <EmptyState
          icon="shopping-bag"
          title="Your cart is empty"
          description="Add delicious dishes from verified restaurants to get started. Your cart will be saved securely."
          actionLabel="Browse Restaurants"
          onAction={() => router.push('/(customer)/(tabs)/explore' as any)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerSub}>{totalItems} {totalItems === 1 ? 'item' : 'items'} • Verified restaurant</Text>
          </View>
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.clearBtn}>
            <Feather name="trash-2" size={14} color="#EF4444" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#EF4444' }}>Clear</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 140, gap: 12 }}>
        <AnimatedPage slide>
          {/* Restaurant note */}
          <View style={styles.secureBanner}>
            <View style={styles.secureIcon}>
              <Feather name="shield" size={14} color="#15803D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.secureTitle}>Secure checkout • Premium packaging</Text>
              <Text style={styles.secureDesc}>Only from verified restaurants • Fresh & hygienic</Text>
            </View>
          </View>

          {items.map((item) => (
            <PremiumCard key={item.menuItemId} style={styles.itemCard as any}>
              <View style={styles.itemImageWrap}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> : <Text style={{ fontSize: 26 }}>🍽️</Text>}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.pricePillSmall}>
                    <Text style={styles.priceSmall}>Rs. {item.price}</Text>
                  </View>
                  {!item.isAvailable ? <Text style={{ fontSize: 10, color: '#EF4444', fontWeight: '700' }}>Unavailable</Text> : null}
                </View>
              </View>

              <View style={styles.qtyWrap}>
                <TouchableOpacity
                  onPress={() => {
                    if (item.quantity <= 1) removeItem(item.menuItemId);
                    else updateQuantity(item.menuItemId, item.quantity - 1);
                  }}
                  style={styles.qtyBtn}
                >
                  <Feather name="minus" size={14} color={Colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.menuItemId, item.quantity + 1)} style={styles.qtyAdd}>
                  <Feather name="plus" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </PremiumCard>
          ))}

          {/* Order Summary – premium */}
          <PremiumCard style={{ padding: 16 } as any}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' }}>
                <Feather name="file-text" size={14} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark }}>Order Summary</Text>
            </View>
            <View style={{ gap: 10 }}>
              <Row label="Subtotal" value={`Rs. ${totalPrice}`} />
              <Row label="Delivery fee" value={`Rs. ${deliveryFee}`} />
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#F1F5F9', marginVertical: 4 }} />
              <Row label="Total" value={`Rs. ${grandTotal}`} bold />
              <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 6, fontWeight: '500' }}>Inclusive of all taxes • Delivery by verified rider</Text>
            </View>
          </PremiumCard>

          <View style={styles.trustRow}>
            <Trust icon="clock" label="30 min" />
            <View style={styles.vDivider} />
            <Trust icon="shield" label="Safe" />
            <View style={styles.vDivider} />
            <Trust icon="award" label="Premium" />
          </View>
        </AnimatedPage>
      </ScrollView>

      {/* Sticky checkout – premium */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>Rs. {grandTotal}</Text>
          <Text style={styles.totalSub}>{totalItems} items • Free packaging</Text>
        </View>
        <Button label="Checkout" onPress={() => router.push('/(customer)/checkout' as any)} style={{ paddingHorizontal: 28, borderRadius: Radius.full }} />
      </View>
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 13, color: bold ? Colors.textDark : Colors.textSecondary, fontWeight: bold ? '800' : '500' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: bold ? Colors.primary : Colors.textDark, fontWeight: bold ? '800' : '700' }}>{value}</Text>
    </View>
  );
}
function Trust({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Feather name={icon} size={14} color={Colors.textSecondary} />
      <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    ...Shadow.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2, textAlign: 'center' },
  headerSub: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', textAlign: 'center', marginTop: 1 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: Radius.xl,
  },
  secureIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
  secureTitle: { fontSize: 12, fontWeight: '700', color: '#15803D' },
  secureDesc: { fontSize: 11, color: '#15803D', opacity: 0.8, marginTop: 1, fontWeight: '500' },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 } as any,
  itemImageWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFEDD5',
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  itemName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.2 },
  pricePillSmall: { backgroundColor: Colors.textDark, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  priceSmall: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
    gap: 8,
  },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' },
  qtyAdd: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontWeight: '800', color: Colors.textDark, minWidth: 16, textAlign: 'center' },
  trustRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: Radius.xl, paddingVertical: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', ...Shadow.xs },
  vDivider: { width: StyleSheet.hairlineWidth, backgroundColor: '#E2E8F0' },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    ...Shadow.lg,
  },
  totalLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  totalValue: { fontSize: 18, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 },
  totalSub: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 1 },
});
