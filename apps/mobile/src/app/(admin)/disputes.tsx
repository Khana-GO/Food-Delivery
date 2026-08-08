import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface DisputeTicket {
  id: string;
  orderId: string;
  customerName: string;
  restaurantName: string;
  amountNpr: number;
  reason: string;
  status: 'OPEN' | 'REFUNDED' | 'DISMISSED';
  date: string;
}

const INITIAL_DISPUTES: DisputeTicket[] = [
  {
    id: 'disp_1',
    orderId: 'NP-88912',
    customerName: 'Prashant Nepal',
    restaurantName: 'Pizza Hut Express',
    amountNpr: 1850,
    reason: 'Wrong pizza delivered (delivered Pepperoni instead of Veg Supreme)',
    status: 'OPEN',
    date: 'Today, 11:20 AM',
  },
  {
    id: 'disp_2',
    orderId: 'NP-88210',
    customerName: 'Kriti Adhikari',
    restaurantName: "McDonald's (Durbar Marg)",
    amountNpr: 669,
    reason: 'Missing item (French Fries were omitted from bag)',
    status: 'OPEN',
    date: 'Yesterday, 8:45 PM',
  },
];

export default function DisputeManagementScreen() {
  const [disputes, setDisputes] = useState<DisputeTicket[]>(INITIAL_DISPUTES);

  const handleRefund = (id: string, orderId: string, amount: number, type: 'Full' | 'Partial') => {
    const refundAmount = type === 'Full' ? amount : Math.round(amount * 0.5);
    Alert.alert(
      `Issue ${type} Refund 💸`,
      `Refund Rs. ${refundAmount} back to customer for Order #${orderId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Refund Rs. ${refundAmount}`,
          onPress: () => {
            setDisputes((prev) =>
              prev.map((d) => (d.id === id ? { ...d, status: 'REFUNDED' } : d))
            );
            Alert.alert('Refund Issued ✅', `Rs. ${refundAmount} credited to customer eSewa/Khalti wallet.`);
          },
        },
      ]
    );
  };

  const handleDismiss = (id: string, orderId: string) => {
    Alert.alert('Dismiss Dispute', `Dismiss claim for Order #${orderId}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Dismiss',
        style: 'destructive',
        onPress: () =>
          setDisputes((prev) =>
            prev.map((d) => (d.id === id ? { ...d, status: 'DISMISSED' } : d))
          ),
      },
    ]);
  };

  const openTickets = disputes.filter((d) => d.status === 'OPEN');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Disputes &amp; Refunds ({openTickets.length})</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        {disputes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
            <Text style={styles.emptyTitle}>No open dispute claims</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {disputes.map((d) => (
              <View key={d.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderIdText}>Order #{d.orderId}</Text>
                    <Text style={styles.customerName}>{d.customerName}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      d.status === 'OPEN' ? styles.badgeOpen : d.status === 'REFUNDED' ? styles.badgeRefunded : styles.badgeDismissed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: d.status === 'OPEN' ? '#B45309' : d.status === 'REFUNDED' ? '#166534' : '#991B1B' },
                      ]}
                    >
                      {d.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.restText}>Restaurant: {d.restaurantName}</Text>
                <View style={styles.reasonBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.reasonText}>"{d.reason}"</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.amountText}>Claimed Amount: Rs. {d.amountNpr}</Text>
                  <Text style={styles.dateText}>{d.date}</Text>
                </View>

                {d.status === 'OPEN' && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.dismissBtn}
                      onPress={() => handleDismiss(d.id, d.orderId)}
                    >
                      <Text style={styles.dismissBtnText}>Dismiss</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.partialRefundBtn}
                      onPress={() => handleRefund(d.id, d.orderId, d.amountNpr, 'Partial')}
                    >
                      <Text style={styles.partialRefundText}>50% Refund</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.fullRefundBtn}
                      onPress={() => handleRefund(d.id, d.orderId, d.amountNpr, 'Full')}
                    >
                      <Text style={styles.fullRefundText}>Full Refund</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },

  list: { paddingHorizontal: 16, gap: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  orderIdText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  customerName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  restText: { fontSize: 13, color: '#64748B', marginBottom: 10 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeOpen: { backgroundColor: '#FEF3C7' },
  badgeRefunded: { backgroundColor: '#DCFCE7' },
  badgeDismissed: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '800' },

  reasonBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 10, gap: 8, marginBottom: 10 },
  reasonText: { fontSize: 13, color: '#991B1B', flex: 1 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  amountText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  dateText: { fontSize: 11, color: '#94A3B8' },

  actionsRow: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dismissBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F1F5F9' },
  dismissBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  partialRefundBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E0F2FE', alignItems: 'center' },
  partialRefundText: { color: '#0284C7', fontWeight: '700', fontSize: 12 },
  fullRefundBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center' },
  fullRefundText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
