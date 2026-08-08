import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Promotion {
  id: string;
  code: string;
  discountText: string;
  minOrder: string;
  usageCount: number;
  active: boolean;
}

const INITIAL_PROMOS: Promotion[] = [
  {
    id: 'p1',
    code: 'NEPAL20',
    discountText: '20% OFF on all burgers',
    minOrder: 'Rs. 500',
    usageCount: 142,
    active: true,
  },
  {
    id: 'p2',
    code: 'FREEDEL',
    discountText: 'Free Delivery Fee',
    minOrder: 'Rs. 700',
    usageCount: 89,
    active: true,
  },
];

export default function RestaurantPromotionsScreen() {
  const [promos, setPromos] = useState<Promotion[]>(INITIAL_PROMOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [minOrder, setMinOrder] = useState('');

  const togglePromo = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleCreatePromo = () => {
    if (!code.trim() || !discountText.trim()) {
      Alert.alert('Missing Info', 'Please enter promo code and discount details.');
      return;
    }

    const newP: Promotion = {
      id: 'p_' + Date.now(),
      code: code.trim().toUpperCase(),
      discountText: discountText.trim(),
      minOrder: minOrder ? `Rs. ${minOrder}` : 'No Min',
      usageCount: 0,
      active: true,
    };

    setPromos([newP, ...promos]);
    setModalOpen(false);
    setCode('');
    setDiscountText('');
    setMinOrder('');
    Alert.alert('Promo Created 🎟️', `Voucher "${newP.code}" is now live!`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Promotions &amp; Discounts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        <View style={styles.promosList}>
          {promos.map((p) => (
            <View key={p.id} style={styles.promoCard}>
              <View style={styles.codeRow}>
                <View style={styles.codeBadge}>
                  <Ionicons name="ticket-outline" size={16} color="#22C55E" />
                  <Text style={styles.codeText}>{p.code}</Text>
                </View>
                <Switch
                  value={p.active}
                  onValueChange={() => togglePromo(p.id)}
                  trackColor={{ false: '#FEE2E2', true: '#DCFCE7' }}
                  thumbColor={p.active ? '#22C55E' : '#EF4444'}
                />
              </View>

              <Text style={styles.discountTitle}>{p.discountText}</Text>
              <Text style={styles.minOrderText}>Min Order: {p.minOrder}</Text>
              <Text style={styles.usageText}>Used {p.usageCount} times</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Create New Promo Voucher</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Promo Code Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., KATHMANDU30"
              autoCapitalize="characters"
              value={code}
              onChangeText={setCode}
            />

            <Text style={styles.label}>Discount Description</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30% OFF on orders over Rs. 600"
              value={discountText}
              onChangeText={setDiscountText}
            />

            <Text style={styles.label}>Minimum Order Amount (Rs.)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500"
              keyboardType="numeric"
              value={minOrder}
              onChangeText={setMinOrder}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreatePromo}>
              <Text style={styles.saveBtnText}>Launch Promo Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
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
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B', flex: 1, marginLeft: 12 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  promosList: { paddingHorizontal: 16, gap: 12 },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  codeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  codeText: { fontSize: 14, fontWeight: '800', color: '#166534' },
  discountTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  minOrderText: { fontSize: 12, color: '#64748B', marginTop: 4 },
  usageText: { fontSize: 11, fontWeight: '700', color: '#0284C7', marginTop: 6 },

  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },

  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, height: 46, fontSize: 14, color: '#1E293B' },

  saveBtn: { backgroundColor: '#1E293B', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
