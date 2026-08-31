import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import PremiumCard from '@/components/ui/PremiumCard';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Radius, Shadow } from '@/constants/theme';

const METHODS = [
  { id: '1', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: 'dollar-sign' as const },
  { id: '2', label: 'eSewa', desc: 'Digital wallet • Secure', icon: 'smartphone' as const },
  { id: '3', label: 'Khalti', desc: 'Digital wallet • Coming soon', icon: 'credit-card' as const, disabled: true },
];

export default function Payment() {
  const [selected, setSelected] = useState('1');
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.title}>Payment Methods</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}>
        <View style={styles.secure}>
          <Feather name="shield" size={14} color="#15803D" />
          <Text style={styles.secureText}>Payments are encrypted & secure. We never store card details.</Text>
        </View>

        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => !m.disabled && setSelected(m.id)}
            activeOpacity={0.85}
            disabled={!!m.disabled}
            style={[styles.methodCard, selected === m.id && styles.methodSelected, !!m.disabled && { opacity: 0.6 }]}
          >
            <View style={[styles.iconCircle, selected === m.id && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
              <Feather name={m.icon} size={16} color={selected === m.id ? '#FFFFFF' : Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodLabel}>{m.label}</Text>
              <Text style={styles.methodDesc}>{m.desc}</Text>
            </View>
            <View style={[styles.radio, selected === m.id && styles.radioSelected]}>
              {selected === m.id ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>
        ))}

        <PremiumCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
              <Feather name="plus" size={16} color="#15803D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>Add new method</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>Cards & wallets coming soon</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#CBD5E1" />
          </View>
        </PremiumCard>
      </ScrollView>
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
  title: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  secureText: { flex: 1, fontSize: 12, color: '#15803D', fontWeight: '600', lineHeight: 16 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    ...Shadow.xs,
  },
  methodSelected: { borderColor: Colors.primary, backgroundColor: '#FEF2F2' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  methodLabel: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  methodDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
});
