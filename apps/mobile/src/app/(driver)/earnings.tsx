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

interface ShiftSlot {
  id: string;
  area: string;
  timeSlot: string;
  incentive: string;
  booked: boolean;
}

const AVAILABLE_SHIFTS: ShiftSlot[] = [
  {
    id: 's1',
    area: 'Kathmandu Valley (Thamel & Durbar Marg)',
    timeSlot: 'Today: 5:00 PM - 10:00 PM',
    incentive: '+Rs. 50 bonus / order',
    booked: true,
  },
  {
    id: 's2',
    area: 'Lalitpur (Jhamsikhel & Patan)',
    timeSlot: 'Tomorrow: 11:30 AM - 3:30 PM',
    incentive: '+Rs. 30 bonus / order',
    booked: false,
  },
];

export default function DriverEarningsScreen() {
  const [shifts, setShifts] = useState<ShiftSlot[]>(AVAILABLE_SHIFTS);

  const toggleBookShift = (id: string, area: string, currentBooked: boolean) => {
    const nextState = !currentBooked;
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, booked: nextState } : s))
    );
    Alert.alert(
      nextState ? 'Shift Scheduled 📅' : 'Shift Cancelled',
      `${nextState ? 'Reserved' : 'Removed'} shift for ${area}.`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Earnings &amp; Shift Scheduling</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        {/* Weekly Earnings Card */}
        <View style={styles.card}>
          <Text style={styles.cardSub}>This Week's Payout</Text>
          <Text style={styles.weeklyTotal}>Rs. 14,850</Text>
          <Text style={styles.payoutDate}>Direct Deposit to eSewa / Bank on Monday</Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownVal}>Rs. 11,200</Text>
              <Text style={styles.breakdownSub}>Trip Fares (42)</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownVal}>Rs. 2,150</Text>
              <Text style={styles.breakdownSub}>Customer Tips</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownVal}>Rs. 1,500</Text>
              <Text style={styles.breakdownSub}>Peak Bonuses</Text>
            </View>
          </View>
        </View>

        {/* Shift Scheduling Section */}
        <Text style={styles.sectionTitle}>Reserve Delivery Shifts</Text>
        <View style={styles.shiftsList}>
          {shifts.map((s) => (
            <View key={s.id} style={styles.shiftCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shiftArea}>{s.area}</Text>
                <Text style={styles.shiftTime}>{s.timeSlot}</Text>
                <Text style={styles.shiftIncentive}>{s.incentive}</Text>
              </View>

              <TouchableOpacity
                style={[styles.bookBtn, s.booked && styles.bookedBtn]}
                onPress={() => toggleBookShift(s.id, s.area, s.booked)}
              >
                <Text style={[styles.bookBtnText, s.booked && styles.bookedBtnText]}>
                  {s.booked ? 'Booked ✅' : 'Book Shift'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  cardSub: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  weeklyTotal: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  payoutDate: { fontSize: 12, color: '#166534', fontWeight: '700', marginTop: 4 },

  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  breakdownItem: { alignItems: 'center' },
  breakdownVal: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  breakdownSub: { fontSize: 11, color: '#64748B', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', paddingHorizontal: 16, marginBottom: 10 },
  shiftsList: { paddingHorizontal: 16, gap: 12 },
  shiftCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  shiftArea: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  shiftTime: { fontSize: 13, color: '#64748B', marginTop: 2 },
  shiftIncentive: { fontSize: 12, fontWeight: '700', color: '#0284C7', marginTop: 4 },

  bookBtn: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  bookedBtn: { backgroundColor: '#DCFCE7' },
  bookBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  bookedBtnText: { color: '#15803D' },
});
