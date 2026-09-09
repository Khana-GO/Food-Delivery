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
import { useInvoices } from '../../../hooks/invoice/useInvoices';
import { Colors, Radius, Shadow } from '../../../constants/theme';
import type { Invoice } from '../../../services/invoice/invoice.service';

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PAID: { label: 'Paid', color: '#15803D', bg: '#F0FDF4' },
  PENDING: { label: 'Pending', color: '#B45309', bg: '#FEF3C7' },
  FAILED: { label: 'Failed', color: '#DC2626', bg: '#FEF2F2' },
  REFUNDED: { label: 'Refunded', color: '#6D28D9', bg: '#EDE9FE' },
};

function InvoiceCard({ item }: { item: Invoice }) {
  const date = new Date(item.issuedAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const statusMeta = paymentStatusConfig[item.paymentStatus] || paymentStatusConfig.PENDING;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/(customer)/invoices/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconWrap}>
            <Feather name="file-text" size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.restaurantName || 'Restaurant'}
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
        <View style={styles.footerItem}>
          <Feather name="calendar" size={12} color={Colors.textTertiary} />
          <Text style={styles.footerText}>
            {formattedDate} at {formattedTime}
          </Text>
        </View>
        <Text style={styles.totalAmount}>Rs. {Number(item.total).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function InvoicesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useInvoices({ page: 1, limit: 50 });

  const invoices = data?.data || [];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>My Invoices</Text>
              <Text style={styles.headerSub}>
                {data?.total || 0} invoice{data?.total !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading invoices...</Text>
        </View>
      ) : isError ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Feather name="alert-circle" size={56} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>Something Went Wrong</Text>
          <Text style={styles.emptySub}>
            Failed to load invoices. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.85}
            onPress={() => refetch()}
          >
            <Text style={styles.exploreBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : invoices.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Feather name="file-text" size={56} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>No Invoices Yet</Text>
          <Text style={styles.emptySub}>
            Invoices will appear here after you place orders
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(customer)/(tabs)')}
          >
            <Text style={styles.exploreBtnText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InvoiceCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafe: {
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius['3xl'],
    borderBottomRightRadius: Radius['3xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.xl,
    ...Shadow.primary,
  },
  exploreBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  restaurantName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
});
