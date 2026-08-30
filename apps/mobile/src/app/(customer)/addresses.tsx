import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import PremiumCard from '@/components/ui/PremiumCard';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { Colors, Radius, Shadow } from '@/constants/theme';

const MOCK = [
  { id: '1', label: 'Home', address: 'Bhagwati Marg, Chabahil, Kathmandu', detail: 'House 12, Ward 7', isDefault: true },
  { id: '2', label: 'Office', address: 'Durbarmarg, Kathmandu', detail: 'Level 3', isDefault: false },
];

export default function Addresses() {
  const [addresses] = useState(MOCK);
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Addresses</Text>
          <TouchableOpacity onPress={() => {}} style={styles.addBtn}>
            <Feather name="plus" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {addresses.length === 0 ? (
        <EmptyState icon="map-pin" title="No addresses yet" description="Add your home or office for faster checkout." actionLabel="Add Address" onAction={() => {}} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}>
          {addresses.map((a) => (
            <PremiumCard key={a.id} style={{ gap: 6 } as any}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.iconCircle}>
                    <Feather name={a.label === 'Home' ? 'home' : 'briefcase'} size={14} color={Colors.primary} />
                  </View>
                  <Text style={styles.addrLabel}>{a.label}</Text>
                  {a.isDefault ? (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="more-vertical" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.addrLine}>{a.address}</Text>
              <Text style={styles.addrDetail}>{a.detail}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity style={styles.action}>
                  <Feather name="edit-2" size={12} color={Colors.textMedium} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.action, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                  <Feather name="trash-2" size={12} color="#EF4444" />
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </PremiumCard>
          ))}

          <Button label="Add New Address" onPress={() => {}} fullWidth size="md" />
          <Text style={styles.footer}>Your addresses are encrypted and only shared with the rider.</Text>
        </ScrollView>
      )}
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  iconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#FEE2E2' },
  addrLabel: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  defaultPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: '#BBF7D0' },
  defaultText: { fontSize: 10, fontWeight: '700', color: '#15803D', letterSpacing: 0.3, textTransform: 'uppercase' },
  addrLine: { fontSize: 13, color: Colors.textDark, fontWeight: '500', marginTop: 2 },
  addrDetail: { fontSize: 12, color: Colors.textSecondary },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.textMedium },
  footer: { textAlign: 'center', fontSize: 11, color: Colors.textTertiary, marginTop: 8, fontWeight: '500' },
});
