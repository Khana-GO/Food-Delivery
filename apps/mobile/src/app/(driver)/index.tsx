import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function DriverDashboardScreen() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.greetingText}>Good afternoon</Text>
            <Text style={styles.nameText}>Hi, {user?.firstName}</Text>
          </View>
          <View style={styles.statusToggle}>
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapBg}>
             <View style={styles.mapPin}>
               <Text style={styles.mapPinIcon}>📍</Text>
               <Text style={styles.mapPinText}>You are here</Text>
             </View>
          </View>
        </View>

        {/* Earnings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Earnings Today</Text>
            <Badge label="Live" variant="neutral" />
          </View>
          <Text style={styles.earningsAmount}>Rs. 1,840</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
               <Text style={styles.statLabel}>Trips Completed</Text>
               <Text style={styles.statValue}>18</Text>
            </View>
            <View style={styles.statBox}>
               <Text style={styles.statLabel}>Hours Online</Text>
               <Text style={styles.statValue}>6h 20m</Text>
            </View>
          </View>
        </View>

        {/* New Delivery Request */}
        <View style={[styles.card, styles.highlightBorder]}>
           <View style={styles.cardHeader}>
             <Text style={styles.highlightTitle}>New Delivery Request</Text>
             <Badge label="Active" variant="success" />
           </View>
           <Text style={styles.restaurantName}>Himalayan Spice Kitchen</Text>

           <View style={styles.requestDetailsBox}>
              <View style={styles.locationRow}>
                <Text style={styles.locIcon}>🏪</Text>
                <View>
                  <Text style={styles.locLabel}>Pickup</Text>
                  <Text style={styles.locName}>Himalayan Spice Kitchen</Text>
                  <Text style={styles.locDesc}>Jhamsikhel, Lalitpur</Text>
                </View>
              </View>
              
              <View style={styles.locLine} />
              
              <View style={styles.locationRow}>
                <Text style={styles.locIcon}>📍</Text>
                <View>
                  <Text style={styles.locLabel}>Drop-off</Text>
                  <Text style={styles.locName}>Anish Shrestha</Text>
                  <Text style={styles.locDesc}>Baneshwor, Kathmandu</Text>
                </View>
              </View>

              <View style={styles.tripStatsRow}>
                 <View style={styles.tripStat}>
                    <Text style={styles.tripStatLabel}>Distance</Text>
                    <Text style={styles.tripStatValue}>3.8 km</Text>
                 </View>
                 <View style={styles.tripStat}>
                    <Text style={styles.tripStatLabel}>ETA</Text>
                    <Text style={styles.tripStatValue}>18 min</Text>
                 </View>
                 <View style={styles.tripStat}>
                    <Text style={styles.tripStatLabel}>Payout</Text>
                    <Text style={[styles.tripStatValue, { color: Colors.primary }]}>Rs. 220</Text>
                 </View>
              </View>
           </View>

           <View style={styles.actionButtonsRow}>
              <Button label="Accept" style={{ flex: 1 }} />
              <Button label="Decline" variant="outline" style={{ flex: 1 }} />
           </View>
        </View>

        {/* Active Delivery */}
        <View style={styles.card}>
           <View style={styles.cardHeader}>
             <Text style={styles.highlightTitle}>Active Delivery</Text>
             <Badge label="In Progress" variant="neutral" />
           </View>
           <Text style={styles.orderId}>Order #KG-2048</Text>
           
           {/* Progress bar */}
           <View style={styles.progressBar}>
              <View style={styles.progressFill} />
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={styles.progressDot} />
           </View>
           <View style={styles.progressLabels}>
             <Text style={styles.progressLabel}>Picked Up</Text>
             <Text style={styles.progressLabelCenter}>On the Way</Text>
             <Text style={styles.progressLabel}>Delivered</Text>
           </View>

           <View style={styles.actionButtonsRow}>
              <Button label="Call" variant="outline" leftIcon={<Text>📞</Text>} style={{ flex: 1 }} textStyle={{ color: Colors.textDark }} />
              <Button label="Message" variant="outline" leftIcon={<Text>💬</Text>} style={{ flex: 1 }} textStyle={{ color: Colors.textDark }} />
           </View>

           <Button label="Mark as Delivered" fullWidth style={{ marginTop: 12 }} />
        </View>

        {/* Shift Summary */}
        <View style={styles.card}>
           <View style={styles.shiftHeader}>
             <View style={styles.shiftIconBg}><Text>🕒</Text></View>
             <View>
               <Text style={styles.shiftTitle}>Shift Summary</Text>
               <Text style={styles.shiftSub}>Keep going to unlock bonus earnings</Text>
             </View>
           </View>
           
           <View style={styles.statsRow}>
             <View style={styles.statBoxSm}>
               <Text style={styles.statLabelSm}>Completed</Text>
               <Text style={styles.statValueSm}>12</Text>
             </View>
             <View style={styles.statBoxSm}>
               <Text style={styles.statLabelSm}>Cancelled</Text>
               <Text style={styles.statValueSm}>1</Text>
             </View>
             <View style={styles.statBoxBonus}>
               <Text style={styles.statLabelSm}>Bonus</Text>
               <Text style={styles.statValueBonus}>Rs. 180</Text>
             </View>
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 24 },
  headerInfo: { flex: 1 },
  greetingText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  nameText: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  statusText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  mapContainer: { marginBottom: 16, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  mapBg: { height: 160, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  mapPin: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapPinIcon: { fontSize: 14, color: '#fff' },
  mapPinText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  highlightBorder: { borderColor: Colors.primaryLight, borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  earningsAmount: { fontSize: 32, fontWeight: '800', color: Colors.primary, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: Colors.backgroundAlt, padding: 16, borderRadius: Radius.lg },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  highlightTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  restaurantName: { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 16 },
  requestDetailsBox: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  locationRow: { flexDirection: 'row', gap: 12 },
  locIcon: { fontSize: 20 },
  locLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  locName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  locDesc: { fontSize: 12, color: Colors.textSecondary },
  locLine: { width: 2, height: 24, backgroundColor: Colors.border, marginLeft: 10, marginVertical: 4 },
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tripStat: { flex: 1 },
  tripStatLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  tripStatValue: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  actionButtonsRow: { flexDirection: 'row', gap: 12 },
  orderId: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 16 },
  progressBar: {
    height: 4,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border, borderWidth: 2, borderColor: Colors.white, zIndex: 1 },
  progressDotActive: { backgroundColor: Colors.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  progressLabel: { fontSize: 11, color: Colors.textSecondary },
  progressLabelCenter: { fontSize: 11, color: Colors.textDark, fontWeight: '700' },
  shiftHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  shiftIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' },
  shiftTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  shiftSub: { fontSize: 12, color: Colors.textSecondary },
  statBoxSm: { flex: 1, backgroundColor: Colors.backgroundAlt, padding: 12, borderRadius: Radius.lg, alignItems: 'center' },
  statBoxBonus: { flex: 1, backgroundColor: '#ECFCCB', padding: 12, borderRadius: Radius.lg, alignItems: 'center' },
  statLabelSm: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  statValueSm: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  statValueBonus: { fontSize: 16, fontWeight: '700', color: '#65A30D' },
});
