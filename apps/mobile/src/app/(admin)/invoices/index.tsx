import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAllInvoices, useInvoiceStats } from '@/hooks/invoice/useAdminInvoices';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { goBack } from '@/lib/navigation';
import type { Invoice } from '@/services/invoice/invoice.service';

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PAID: { label: 'Paid', color: '#15803D', bg: '#F0FDF4' },
  PENDING: { label: 'Pending', color: '#B45309', bg: '#FEF3C7' },
  FAILED: { label: 'Failed', color: '#DC2626', bg: '#FEF2F2' },
  REFUNDED: { label: 'Refunded', color: '#6D28D9', bg: '#EDE9FE' },
};

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InvoiceCard({ item }: { item: Invoice }) {
  const date = new Date(item.issuedAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const statusMeta = paymentStatusConfig[item.paymentStatus] || paymentStatusConfig.PENDING;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/(admin)/invoices/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconWrap}>
            <Feather name="file-text" size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.restaurantName || 'Restaurant'} · {item.customerName || 'Customer'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.statusText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>{formattedDate}</Text>
        <Text style={styles.totalAmount}>Rs. {Number(item.total).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminInvoicesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useAllInvoices({ page: 1, limit: 50 });
  const { data: stats } = useInvoiceStats();
  const invoices = data?.data || [];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => goBack('/(admin)/(tabs)')} activeOpacity={0.8} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>All Invoices</Text>
              <Text style={styles.headerSub}>{data?.total || 0} total</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {stats && (
        <View style={styles.statsRow}>
          <StatCard label="Revenue" value={`Rs. ${Number(stats.totalRevenue).toLocaleString()}`} color={Colors.primary} />
          <StatCard label="Tax" value={`Rs. ${Number(stats.totalTax).toLocaleString()}`} color="#B45309" />
          <StatCard label="Paid" value={String(stats.paidOrders)} color="#15803D" />
          <StatCard label="Pending" value={String(stats.pendingOrders)} color="#F59E0B" />
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Failed to Load</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : invoices.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="file-text" size={56} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Invoices</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InvoiceCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerSafe: { backgroundColor: Colors.primary },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerTitle: { fontSize: 19, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.sm, padding: 10, alignItems: 'center', ...Shadow.xs },
  statValue: { fontSize: 14, fontWeight: '800', color: Colors.textDark },
  statLabel: { fontSize: 9, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full },
  retryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E8E8E8', ...Shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderMedium },
  invoiceNumber: { fontSize: 14, fontWeight: '800', color: Colors.textDark },
  restaurantName: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerText: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' },
  totalAmount: { fontSize: 16, fontWeight: '900', color: Colors.primary, letterSpacing: -0.3 },
});
