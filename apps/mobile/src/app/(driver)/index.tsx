import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface DeliveryOrder {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  distanceKm: string;
  earningNpr: number;
  status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
}

const ACTIVE_DELIVERY: DeliveryOrder = {
  id: 'NP-9820',
  restaurantName: "McDonald's (Durbar Marg)",
  restaurantAddress: 'Durbar Marg, Kathmandu',
  customerName: 'Sujata Thapa',
  customerAddress: 'Jhamsikhel, Ward No. 3, Lalitpur',
  customerPhone: '+977 9841223344',
  distanceKm: '3.2 km',
  earningNpr: 280,
  status: 'ASSIGNED',
};

export default function DriverDashboardScreen() {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [delivery, setDelivery] = useState<DeliveryOrder | null>(ACTIVE_DELIVERY);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);

  const handleUpdateStatus = () => {
    if (!delivery) return;

    if (delivery.status === 'ASSIGNED') {
      setDelivery({ ...delivery, status: 'PICKED_UP' });
      Alert.alert('Food Picked Up 🍳', 'Navigating to customer address in Jhamsikhel...');
    } else if (delivery.status === 'PICKED_UP') {
      setProofModalOpen(true);
    }
  };

  const handleCompleteDelivery = () => {
    if (!photoTaken || !signatureDone) {
      Alert.alert('Proof Required', 'Please capture delivery photo and customer signature.');
      return;
    }

    setProofModalOpen(false);
    setDelivery(null);
    Alert.alert('Delivery Complete 🎉', 'Rs. 280 credited to your driver wallet!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Driver Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>Marcus Vance (Rider #302)</Text>
          <Text style={styles.vehicleText}>🛵 Honda Dio • Ba 92 Pa 4812</Text>
        </View>

        <View style={styles.dutyToggleBox}>
          <Text style={[styles.dutyText, { color: isOnDuty ? '#166534' : '#991B1B' }]}>
            {isOnDuty ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnDuty}
            onValueChange={setIsOnDuty}
            trackColor={{ false: '#FEE2E2', true: '#DCFCE7' }}
            thumbColor={isOnDuty ? '#22C55E' : '#EF4444'}
          />
        </View>
      </View>

      {/* Navigation Toolbar */}
      <View style={styles.toolbarScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
          <TouchableOpacity style={[styles.navPill, styles.navPillActive]}>
            <Ionicons name="navigate" size={16} color="#FFFFFF" />
            <Text style={styles.navPillTextActive}>Active Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(driver)/earnings')}
          >
            <Ionicons name="wallet" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Earnings &amp; Shifts</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        {/* Today's Earnings Summary Widget */}
        <View style={styles.earningsSummaryCard}>
          <View style={styles.earningCol}>
            <Text style={styles.earningVal}>Rs. 2,450</Text>
            <Text style={styles.earningSub}>Today's Earnings</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.earningCol}>
            <Text style={styles.earningVal}>8</Text>
            <Text style={styles.earningSub}>Trips Done</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.earningCol}>
            <Text style={styles.earningVal}>Rs. 350</Text>
            <Text style={styles.earningSub}>Tips Earned</Text>
          </View>
        </View>

        {/* Active Dispatch Delivery Card */}
        {delivery ? (
          <View style={styles.tripCard}>
            <View style={styles.tripHeaderRow}>
              <View style={styles.tripBadge}>
                <Ionicons name="flash" size={14} color="#0284C7" />
                <Text style={styles.tripBadgeText}>EXPRESS DISPATCH • #{delivery.id}</Text>
              </View>
              <Text style={styles.earningBadgeText}>+Rs. {delivery.earningNpr}</Text>
            </View>

            {/* GPS Navigation Map visual box */}
            <View style={styles.mapBox}>
              <Ionicons name="map" size={36} color="#38BDF8" />
              <Text style={styles.mapTitle}>Route Navigation Active (Kathmandu ➔ Lalitpur)</Text>
              <Text style={styles.mapSub}>Distance: {delivery.distanceKm} • Est. Time: 14 mins</Text>
            </View>

            {/* Pickup & Dropoff Steps */}
            <View style={styles.routeTimeline}>
              <View style={styles.routeStep}>
                <Ionicons name="restaurant" size={18} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>PICKUP: {delivery.restaurantName}</Text>
                  <Text style={styles.stepAddress}>{delivery.restaurantAddress}</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.routeStep}>
                <Ionicons name="location" size={18} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>DROPOFF: {delivery.customerName}</Text>
                  <Text style={styles.stepAddress}>{delivery.customerAddress}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleUpdateStatus}>
              <Ionicons
                name={delivery.status === 'ASSIGNED' ? 'fast-food' : 'camera'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.actionBtnText}>
                {delivery.status === 'ASSIGNED'
                  ? 'Confirm Food Picked Up'
                  : 'Capture Proof & Complete Delivery'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noTripCard}>
            <Ionicons name="checkmark-circle-outline" size={56} color="#22C55E" />
            <Text style={styles.noTripTitle}>Waiting for Next Order Dispatch</Text>
            <Text style={styles.noTripSub}>Stay online in Kathmandu Valley to receive orders.</Text>
          </View>
        )}
      </ScrollView>

      {/* Proof of Delivery Modal */}
      <Modal visible={proofModalOpen} animationType="slide" transparent onRequestClose={() => setProofModalOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Proof of Delivery (Mandatory)</Text>
              <TouchableOpacity onPress={() => setProofModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Photo Capture Step */}
            <TouchableOpacity
              style={[styles.proofStepBox, photoTaken && styles.proofStepDone]}
              onPress={() => {
                setPhotoTaken(true);
                Alert.alert('Photo Captured 📸', 'Package dropoff photo verified!');
              }}
            >
              <Ionicons name={photoTaken ? 'checkmark-circle' : 'camera'} size={24} color={photoTaken ? '#22C55E' : '#38BDF8'} />
              <View style={{ flex: 1 }}>
                <Text style={styles.proofTitle}>1. Package Dropoff Photo</Text>
                <Text style={styles.proofSub}>{photoTaken ? 'Photo attached' : 'Tap to simulate photo capture'}</Text>
              </View>
            </TouchableOpacity>

            {/* Customer Signature Step */}
            <TouchableOpacity
              style={[styles.proofStepBox, signatureDone && styles.proofStepDone]}
              onPress={() => {
                setSignatureDone(true);
                Alert.alert('Signature Signed ✍️', 'Customer signature verified!');
              }}
            >
              <Ionicons name={signatureDone ? 'checkmark-circle' : 'create-outline'} size={24} color={signatureDone ? '#22C55E' : '#38BDF8'} />
              <View style={{ flex: 1 }}>
                <Text style={styles.proofTitle}>2. Customer Signature</Text>
                <Text style={styles.proofSub}>{signatureDone ? 'Signature received' : 'Tap to record customer signature'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.completeDeliveryBtn} onPress={handleCompleteDelivery}>
              <Text style={styles.completeDeliveryText}>Complete &amp; Submit Order</Text>
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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  driverName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  vehicleText: { fontSize: 12, color: '#64748B' },
  dutyToggleBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dutyText: { fontSize: 11, fontWeight: '800' },

  toolbarScroll: { backgroundColor: '#FFFFFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  toolbarContent: { paddingHorizontal: 16, gap: 10 },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navPillActive: { backgroundColor: '#1E293B' },
  navPillText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  navPillTextActive: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  earningsSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  earningCol: { flex: 1, alignItems: 'center' },
  earningVal: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  earningSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  divider: { width: 1, height: '100%', backgroundColor: '#F1F5F9' },

  tripCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  tripHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tripBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  tripBadgeText: { fontSize: 11, fontWeight: '800', color: '#0369A1' },
  earningBadgeText: { fontSize: 16, fontWeight: '800', color: '#166534' },

  mapBox: { height: 100, backgroundColor: '#F0F9FF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#BAE6FD' },
  mapTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  mapSub: { fontSize: 11, color: '#64748B', marginTop: 2 },

  routeTimeline: { gap: 8, marginVertical: 8 },
  routeStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  stepAddress: { fontSize: 12, color: '#64748B', marginTop: 1 },
  timelineLine: { width: 2, height: 16, backgroundColor: '#E2E8F0', marginLeft: 8 },

  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', height: 50, borderRadius: 25, marginTop: 16, gap: 8 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

  noTripCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, marginHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  noTripTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  noTripSub: { fontSize: 12, color: '#64748B', textAlign: 'center' },

  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },

  proofStepBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 12, marginBottom: 12 },
  proofStepDone: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  proofTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  proofSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

  completeDeliveryBtn: { backgroundColor: '#166534', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  completeDeliveryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
