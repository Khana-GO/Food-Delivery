import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import PremiumCard from '@/components/ui/PremiumCard';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [push, setPush] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promo, setPromo] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
        <AnimatedPage slide>
          <PremiumCard>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'U'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(customer)/profile/edit' as any)} style={styles.editPill}>
                <Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>

          <PremiumCard style={{ marginTop: 2 } as any}>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Row label="Push notifications" desc="Receive order & promo alerts" value={push} onChange={setPush} />
            <Row label="Order updates" desc="Live status for your orders" value={orderUpdates} onChange={setOrderUpdates} />
            <Row label="Promotions" desc="Offers and new restaurants" value={promo} onChange={setPromo} last />
          </PremiumCard>

          <PremiumCard>
            <Text style={styles.cardTitle}>Preferences</Text>
            <PressRow icon="globe" label="Language" value="English" onPress={() => Alert.alert('Coming soon', 'Multi-language support coming soon.')} />
            <PressRow icon="moon" label="Appearance" value="System" onPress={() => Alert.alert('Coming soon', 'Dark mode will be available soon.')} />
            <PressRow icon="shield" label="Privacy" onPress={() => Alert.alert('Privacy', 'Your data is protected and never shared.')} last />
          </PremiumCard>

          <PremiumCard>
            <Text style={styles.cardTitle}>Support</Text>
            <PressRow icon="help-circle" label="Help Center" onPress={() => Alert.alert('Help', 'Contact support@khanago.com')} />
            <PressRow icon="file-text" label="Terms & Privacy" onPress={() => Alert.alert('Terms', 'View terms at khanago.com/terms')} />
            <PressRow icon="info" label="About" value="v1.0.0" last />
          </PremiumCard>
        </AnimatedPage>
      </ScrollView>
    </View>
  );
}

function Row({ label, desc, value, onChange, last }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {desc ? <Text style={styles.rowDesc}>{desc}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: '#E2E8F0', true: Colors.primary }} thumbColor="#FFFFFF" />
    </View>
  );
}
function PressRow({ icon, label, value, onPress, last }: { icon: any; label: string; value?: string; onPress?: () => void; last?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Feather name={icon} size={14} color={Colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Feather name="chevron-right" size={14} color="#CBD5E1" />
    </TouchableOpacity>
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
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  profileName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  profileEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  editPill: { backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: '#E2E8F0' },
  editPillText: { fontSize: 12, fontWeight: '700', color: Colors.textDark },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 10 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F1F5F9' },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  rowDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  rowValue: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  rowIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#FEE2E2' },
});
