import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useOrder } from '@/hooks/customer/useOrder';
import { Colors, Radius, Shadow } from '@/constants/theme';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: 'clock' },
  CONFIRMED: { label: 'Confirmed', color: '#2563EB', bg: '#EFF6FF', icon: 'check-circle' },
  PREPARING: { label: 'Preparing', color: '#8B5CF6', bg: '#EDE9FE', icon: 'tool' },
  READY: { label: 'Ready', color: '#0E9F6E', bg: '#DCFCE7', icon: 'check' },
  PICKED_UP: { label: 'Picked Up', color: '#E23744', bg: '#FEE2E2', icon: 'truck' },
  DELIVERED: { label: 'Delivered', color: '#22C55E', bg: '#DCFCE7', icon: 'check-circle' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: 'x-circle' },
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }}>Loading order details...</Text>
      </View>
    );
  }

  const statusMeta = statusConfig[order.orderStatus] || statusConfig.PENDING;
  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.primary }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.headerSub}>{formatDate(order.createdAt)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/(customer)/order-tracking/${order.id}` as any)}
              activeOpacity={0.85}
              style={styles.trackBtn}
            >
              <Feather name="map-pin" size={15} color="#FFFFFF" />
              <Text style={styles.trackBtnText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Status card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconWrap, { backgroundColor: statusMeta.bg }]}>
              <Feather name={statusMeta.icon} size={20} color={statusMeta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Current Status</Text>
              <OrderStatusBadge status={order.orderStatus} />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statusAmountLabel}>Total</Text>
              <Text style={styles.statusAmount}>Rs. {Number(order.totalAmount).toLocaleString()}</Text>
            </View>
          </View>
          {order.estimatedDeliveryTime ? (
            <View style={styles.statusEta}>
              <Feather name="clock" size={13} color={Colors.textTertiary} />
              <Text style={styles.statusEtaText}>Estimated delivery: {order.estimatedDeliveryTime}</Text>
            </View>
          ) : null}
        </View>

        {/* Restaurant card */}
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/restaurant/${order.restaurantId}` as any)}
          activeOpacity={0.85}
          style={styles.card}
        >
          <View style={styles.restRow}>
            <View style={styles.restIcon}>
              <Feather name="home" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{order.restaurantName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <Feather name="map-pin" size={11} color={Colors.textTertiary} />
                <Text style={styles.cardSub} numberOfLines={1}>{order.restaurantAddress || 'Restaurant'}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#CBD5E1" />
          </View>
        </TouchableOpacity>

        {/* Items */}
        <View style={[styles.card, { paddingHorizontal: 16 }]}>
          <Text style={styles.cardSectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <View key={item.id || idx}>
              <View style={styles.itemRow}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>×{item.quantity}</Text>
                </View>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rs. {Number(item.totalPrice).toLocaleString()}</Text>
              </View>
              {idx < order.items.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>

        {/* Billing breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Payment Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>Rs. {Number(order.subtotal).toLocaleString()}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>Rs. {Number(order.deliveryFee).toLocaleString()}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotalRow]}>
            <Text style={styles.billTotalLabel}>Total</Text>
            <Text style={styles.billTotalValue}>Rs. {Number(order.totalAmount).toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment + delivery info */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Payment</Text>
              <View style={styles.infoValueRow}>
                <Feather name={order.paymentMethod === 'ONLINE' ? 'credit-card' : 'dollar-sign'} size={13} color={Colors.textDark} />
                <Text style={styles.infoValue}>{order.paymentMethod === 'ONLINE' ? 'Online' : 'Cash on Delivery'}</Text>
              </View>
              <View style={[styles.payStatusPill, { backgroundColor: order.paymentStatus === 'PAID' ? '#F0FDF4' : '#FEF3C7' }]}>
                <Text style={[styles.payStatusText, { color: order.paymentStatus === 'PAID' ? '#15803D' : '#B45309' }]}>
                  {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Deliver To</Text>
              <View style={styles.infoValueRow}>
                <Feather name="map-pin" size={13} color={Colors.textDark} />
                <Text style={styles.infoValue} numberOfLines={3}>{order.deliveryAddress || 'Address'}</Text>
              </View>
            </View>
          </View>
        </View>

        {order.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Order Note</Text>
            <Text style={styles.noteText}>{order.notes}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 10, marginTop: 4 }}>
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/review/create?restaurantId=${order.restaurantId}` as any)}
            activeOpacity={0.85}
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
          >
            <Feather name="star" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Rate Restaurant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/order-tracking/${order.id}` as any)}
            activeOpacity={0.85}
            style={[styles.actionBtn, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]}
          >
            <Feather name="navigation" size={16} color={Colors.textDark} />
            <Text style={[styles.actionBtnText, { color: Colors.textDark }]}>Live Tracking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius['3xl'],
    borderBottomRightRadius: Radius['3xl'],
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
  headerTitle: { fontSize: 19, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  trackBtn: {
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
  trackBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
    ...Shadow.sm,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginBottom: 6 },
  statusAmountLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  statusAmount: { fontSize: 18, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.4, marginTop: 2 },
  statusEta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F1F5F9' },
  statusEtaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
  cardSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', flex: 1 },
  cardSectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 8, letterSpacing: -0.2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  qtyBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  qtyBadgeText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  itemName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#F1F5F9' },
  billRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  billLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  billValue: { fontSize: 13, color: Colors.textDark, fontWeight: '600' },
  billTotalRow: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E8E8E8' },
  billTotalLabel: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  billTotalValue: { fontSize: 17, fontWeight: '900', color: Colors.primary, letterSpacing: -0.3 },
  infoRow: { flexDirection: 'row' },
  infoItem: { flex: 1 },
  infoDivider: { width: StyleSheet.hairlineWidth, backgroundColor: '#E8E8E8', marginHorizontal: 14 },
  infoLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  infoValueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  infoValue: { fontSize: 13, color: Colors.textDark, fontWeight: '600', flex: 1 },
  payStatusPill: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  payStatusText: { fontSize: 11, fontWeight: '700' },
  noteText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontWeight: '500' },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    ...Shadow.sm,
  },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
