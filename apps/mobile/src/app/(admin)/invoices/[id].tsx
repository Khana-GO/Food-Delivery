import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInvoice } from '@/hooks/invoice/useInvoice';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { goBack } from '@/lib/navigation';

const payConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PAID: { label: 'Paid', color: '#15803D', bg: '#F0FDF4', icon: 'check-circle' },
  PENDING: { label: 'Pending', color: '#B45309', bg: '#FEF3C7', icon: 'clock' },
  FAILED: { label: 'Failed', color: '#DC2626', bg: '#FEF2F2', icon: 'x-circle' },
  REFUNDED: { label: 'Refunded', color: '#6D28D9', bg: '#EDE9FE', icon: 'rotate-ccw' },
};

export default function AdminInvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoice, isLoading, isError, refetch, isRefetching } = useInvoice(id || '');

  if (isLoading) {
    return <View style={s.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (isError || !invoice) {
    return (
      <View style={s.loading}>
        <Text style={{ color: Colors.textSecondary }}>Invoice not found</Text>
        <TouchableOpacity onPress={() => goBack('/(admin)/(tabs)')} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = payConfig[invoice.paymentStatus] || payConfig.PENDING;
  const issued = new Date(invoice.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={s.headerSafe}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => goBack('/(admin)/(tabs)')} activeOpacity={0.8} style={s.backBtn}>
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>Invoice Details</Text>
              <Text style={s.headerSub}>{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}>
        <View style={s.statusCard}>
          <View style={s.statusRow}>
            <View style={[s.statusIcon, { backgroundColor: meta.bg }]}><Feather name={meta.icon} size={22} color={meta.color} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '600' }}>Payment Status</Text>
              <View style={[s.badge, { backgroundColor: meta.bg }]}><Text style={[s.badgeText, { color: meta.color }]}>{meta.label}</Text></View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' }}>Total</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.primary }}>Rs. {Number(invoice.total).toLocaleString()}</Text>
            </View>
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.sectionTitle}>Customer</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textDark }}>{invoice.customerName || 'N/A'}</Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{invoice.restaurantName || 'Restaurant'}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.sectionTitle}>Billing Breakdown</Text>
          {[
            ['Subtotal', invoice.subtotal],
            ['Tax (13% VAT)', invoice.tax],
            ['Delivery Fee', invoice.deliveryFee],
            ...(invoice.discount > 0 ? [['Discount', -invoice.discount] as const] : []),
          ].map(([label, val]) => (
            <View key={String(label)} style={s.billRow}>
              <Text style={s.billLabel}>{label}</Text>
              <Text style={s.billValue}>Rs. {Number(val).toLocaleString()}</Text>
            </View>
          ))}
          <View style={s.billDivider} />
          <View style={s.billRow}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark }}>Total</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.primary }}>Rs. {Number(invoice.total).toLocaleString()}</Text>
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.sectionTitle}>Details</Text>
          <View style={s.detailRow}><Text style={s.detailLabel}>Invoice #</Text><Text style={s.detailValue}>{invoice.invoiceNumber}</Text></View>
          <View style={s.detailRow}><Text style={s.detailLabel}>Payment</Text><Text style={s.detailValue}>{invoice.paymentMethod === 'ONLINE' ? 'Online' : 'Cash on Delivery'}</Text></View>
          <View style={s.detailRow}><Text style={s.detailLabel}>Issued</Text><Text style={s.detailValue}>{issued}</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 12 },
  headerSafe: { backgroundColor: Colors.primary },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerTitle: { fontSize: 19, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  content: { padding: 16, paddingBottom: 32 },
  statusCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E8E8E8', ...Shadow.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, marginTop: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E8E8E8', ...Shadow.sm },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 10 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  billLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  billValue: { fontSize: 13, color: Colors.textDark, fontWeight: '600' },
  billDivider: { height: 1, backgroundColor: '#E8E8E8', marginVertical: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  detailLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  detailValue: { fontSize: 13, color: Colors.textDark, fontWeight: '600' },
});
