import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInvoice } from '../../../hooks/invoice/useInvoice';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { goBack } from '@/lib/navigation';

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PAID: { label: 'Paid', color: '#15803D', bg: '#F0FDF4', icon: 'check-circle' },
  PENDING: { label: 'Pending', color: '#B45309', bg: '#FEF3C7', icon: 'clock' },
  FAILED: { label: 'Failed', color: '#DC2626', bg: '#FEF2F2', icon: 'x-circle' },
  REFUNDED: { label: 'Refunded', color: '#6D28D9', bg: '#EDE9FE', icon: 'rotate-ccw' },
};

const orderStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmed', color: '#2563EB', bg: '#EFF6FF' },
  PREPARING: { label: 'Preparing', color: '#8B5CF6', bg: '#EDE9FE' },
  READY: { label: 'Ready', color: '#0E9F6E', bg: '#DCFCE7' },
  PICKED_UP: { label: 'Picked Up', color: '#E23744', bg: '#FEE2E2' },
  DELIVERED: { label: 'Delivered', color: '#22C55E', bg: '#DCFCE7' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoice, isLoading, isError, refetch, isRefetching } = useInvoice(id || '');

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  if (isError || !invoice) {
    return (
      <View style={styles.loadingWrap}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => goBack('/(customer)/(tabs)/orders')}
                activeOpacity={0.8}
                style={styles.backBtn}
              >
                <Feather name="arrow-left" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Invoice Details</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={styles.emptyIconWrap}>
            <Feather name="alert-circle" size={48} color={Colors.textLight} />
          </View>
          <Text style={styles.errorTitle}>Invoice Not Found</Text>
          <Text style={styles.errorSub}>
            This invoice may have been removed or you don't have access.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.85}
            onPress={() => goBack('/(customer)/(tabs)/orders')}
          >
            <Text style={styles.exploreBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const payMeta = paymentStatusConfig[invoice.paymentStatus] || paymentStatusConfig.PENDING;
  const orderMeta = invoice.orderStatus ? orderStatusConfig[invoice.orderStatus] : null;

  const issuedDate = new Date(invoice.issuedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const issuedTime = new Date(invoice.issuedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const paidDate = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => goBack('/(customer)/(tabs)/orders')}
              activeOpacity={0.8}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Invoice Details</Text>
              <Text style={styles.headerSub}>{invoice.invoiceNumber}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push(`/(customer)/order/${invoice.orderId}` as any)
              }
              activeOpacity={0.85}
              style={styles.orderBtn}
            >
              <Feather name="external-link" size={14} color="#FFFFFF" />
              <Text style={styles.orderBtnText}>Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Payment Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconWrap, { backgroundColor: payMeta.bg }]}>
              <Feather name={payMeta.icon} size={24} color={payMeta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>Payment Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: payMeta.bg }]}>
                <Text style={[styles.statusBadgeText, { color: payMeta.color }]}>
                  {payMeta.label}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                Rs. {Number(invoice.total).toLocaleString()}
              </Text>
            </View>
          </View>
          {orderMeta && (
            <View style={styles.orderStatusRow}>
              <Text style={styles.orderStatusLabel}>Order Status</Text>
              <View style={[styles.orderStatusBadge, { backgroundColor: orderMeta.bg }]}>
                <Text style={[styles.orderStatusText, { color: orderMeta.color }]}>
                  {orderMeta.label}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Invoice Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Invoice Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Invoice Number</Text>
              <Text style={styles.infoValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <View style={styles.methodRow}>
                <Feather
                  name={invoice.paymentMethod === 'ONLINE' ? 'credit-card' : 'dollar-sign'}
                  size={13}
                  color={Colors.textDark}
                />
                <Text style={styles.infoValue}>
                  {invoice.paymentMethod === 'ONLINE' ? 'Online' : 'Cash on Delivery'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Issued</Text>
              <Text style={styles.timelineValue}>
                {issuedDate} at {issuedTime}
              </Text>
            </View>
          </View>
          {paidDate && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#15803D' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Paid</Text>
                <Text style={styles.timelineValue}>{paidDate}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Billing Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Billing Breakdown</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>
              Rs. {Number(invoice.subtotal).toLocaleString()}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax (13% VAT)</Text>
            <Text style={styles.billValue}>
              Rs. {Number(invoice.tax).toLocaleString()}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>
              Rs. {Number(invoice.deliveryFee).toLocaleString()}
            </Text>
          </View>
          {invoice.discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: '#15803D' }]}>Discount</Text>
              <Text style={[styles.billValue, { color: '#15803D' }]}>
                - Rs. {Number(invoice.discount).toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.billDivider} />
          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Total</Text>
            <Text style={styles.billTotalValue}>
              Rs. {Number(invoice.total).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Restaurant Info */}
        {invoice.restaurantName && (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              router.push(`/(customer)/restaurant/${invoice.restaurantId}` as any)
            }
          >
            <View style={styles.restRow}>
              <View style={styles.restIcon}>
                <Feather name="home" size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.restLabel}>Restaurant</Text>
                <Text style={styles.restName}>{invoice.restaurantName}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#CBD5E1" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
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
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  errorSub: {
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
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  orderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
    ...Shadow.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  orderStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
  },
  orderStatusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '700',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flex: 1,
  },
  infoDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 14,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '600',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '600',
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  billLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  billValue: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '600',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 8,
  },
  billTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  restLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  restName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
