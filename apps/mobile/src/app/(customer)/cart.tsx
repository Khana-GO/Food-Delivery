import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import PremiumCard from '@/components/ui/PremiumCard';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Radius, Shadow } from '@/constants/theme';

const MOCK_CART = [
  { id: '1', name: 'Chicken Momo', price: 220, qty: 2, emoji: '🥟', note: 'Extra achar' },
  { id: '2', name: 'Masala Chai', price: 90, qty: 1, emoji: '🍵', note: '' },
];

export default function Cart() {
  const [items, setItems] = useState(MOCK_CART);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = 45;
  const total = subtotal + fee;

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)).filter((i) => i.qty > 0));
  };

  if (!items.length) {
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
        <EmptyState icon="shopping-bag" title="Your cart is empty" description="Add delicious items from restaurants to get started." actionLabel="Explore Restaurants" onAction={() => router.push('/(customer)/(tabs)/explore' as any)} />
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
          <Text style={styles.headerTitle}>Your Cart • {items.length} items</Text>
          <TouchableOpacity onPress={() => setItems([])}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>Clear</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 140 }}>
        {items.map((item) => (
          <PremiumCard key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 } as any}>
            <View style={styles.imgBox}>
              <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>{item.name}</Text>
              {item.note ? <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{item.note}</Text> : null}
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 4 }}>Rs. {item.price}</Text>
            </View>
            <View style={styles.qtyWrap}>
              <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                <Feather name="minus" size={14} color={Colors.textDark} />
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, minWidth: 20, textAlign: 'center' }}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtnAdd}>
                <Feather name="plus" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </PremiumCard>
        ))}

        <PremiumCard>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 12 }}>Order Summary</Text>
          <View style={{ gap: 8 }}>
            <Row label="Subtotal" value={`Rs. ${subtotal}`} />
            <Row label="Delivery fee" value={`Rs. ${fee}`} />
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#F1F5F9', marginVertical: 4 }} />
            <Row label="Total" value={`Rs. ${total}`} bold />
          </View>
        </PremiumCard>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: Radius.lg, padding: 12 }}>
          <Feather name="shield" size={14} color="#15803D" />
          <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '600', flex: 1 }}>Secure checkout • Fresh & hygienic packaging</Text>
        </View>
      </ScrollView>

      <View style={styles.checkoutBar}>
        <View>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>Total</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textDark }}>Rs. {total}</Text>
        </View>
        <Button label="Checkout" onPress={() => router.push('/(customer)/checkout' as any)} style={{ paddingHorizontal: 28, borderRadius: Radius.full }} />
      </View>
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, color: bold ? Colors.textDark : Colors.textSecondary, fontWeight: bold ? '700' : '500' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: bold ? Colors.textDark : Colors.textMedium, fontWeight: bold ? '800' : '600' }}>{value}</Text>
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
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.2 },
  imgBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFEDD5',
  },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' },
  qtyBtnAdd: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.textDark, alignItems: 'center', justifyContent: 'center' },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    ...Shadow.lg,
  },
});
