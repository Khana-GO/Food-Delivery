import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Button from '@/components/ui/Button';

export default function RestaurantDashboardScreen() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBg}>
            <Text style={styles.logoEmoji}>🥟</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.greetingText}>Good Morning, Himalayan Spice Kitchen</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locIcon}>📍</Text>
              <Text style={styles.locText}>Kathmandu, Baneshwor</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Restaurant Status Toggle */}
        <View style={styles.statusCard}>
           <Text style={styles.statusLabel}>Restaurant Status</Text>
           <View style={styles.statusRow}>
              <Text style={styles.statusValue}>{isOpen ? 'Open for orders' : 'Closed for orders'}</Text>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
           </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={styles.statIconBg}><Text>📋</Text></View>
                 <Text style={styles.statTrendPos}>+12%</Text>
              </View>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statSub}>Today's Orders</Text>
           </View>
           
           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={styles.statIconBg}><Text>💵</Text></View>
                 <Text style={styles.statTrendPos}>+8%</Text>
              </View>
              <Text style={styles.statValue}>Rs. 18.4K</Text>
              <Text style={styles.statSub}>Today's Revenue</Text>
           </View>

           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={styles.statIconBg}><Text>⭐</Text></View>
                 <Text style={styles.statTrendPos}>4.8</Text>
              </View>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statSub}>Avg Rating</Text>
           </View>
           
           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={styles.statIconBg}><Text>⏱️</Text></View>
                 <Text style={styles.statTrendNeg}>6 waiting</Text>
              </View>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statSub}>Pending Orders</Text>
           </View>
        </View>

        {/* Incoming Orders */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Incoming Orders</Text>
           <TouchableOpacity><Text style={styles.seeAllText}>View all</Text></TouchableOpacity>
        </View>
        
        <View style={styles.orderCard}>
           <View style={styles.orderRow}>
             <Text style={styles.orderName}>Anisha Gurung</Text>
             <View style={styles.orderIdBadge}><Text style={styles.orderIdText}>#2041</Text></View>
             <View style={{ flex: 1 }} />
             <View style={styles.timeBadge}><Text style={styles.timeText}>08:24</Text></View>
           </View>
           <Text style={styles.orderItems}>2x Chicken Momo, 1x Thukpa, 1x Coke</Text>
           <View style={styles.orderActionRow}>
              <Text style={styles.orderPrice}>Rs. 1,240</Text>
              <View style={styles.btnRow}>
                 <TouchableOpacity style={styles.acceptBtn}><Text style={styles.acceptText}>Accept</Text></TouchableOpacity>
                 <TouchableOpacity style={styles.rejectBtn}><Text style={styles.rejectText}>Reject</Text></TouchableOpacity>
              </View>
           </View>
        </View>

        <View style={styles.orderCard}>
           <View style={styles.orderRow}>
             <Text style={styles.orderName}>Sujan Shrestha</Text>
             <View style={styles.orderIdBadge}><Text style={styles.orderIdText}>#2042</Text></View>
             <View style={{ flex: 1 }} />
             <View style={[styles.timeBadge, styles.timeBadgeWarn]}><Text style={styles.timeTextWarn}>05:12</Text></View>
           </View>
           <Text style={styles.orderItems}>1x Veg Thali, 2x Garlic Naan, 1x Lassi</Text>
           <View style={styles.orderActionRow}>
              <Text style={styles.orderPrice}>Rs. 860</Text>
              <View style={styles.btnRow}>
                 <TouchableOpacity style={styles.acceptBtn}><Text style={styles.acceptText}>Accept</Text></TouchableOpacity>
                 <TouchableOpacity style={styles.rejectBtn}><Text style={styles.rejectText}>Reject</Text></TouchableOpacity>
              </View>
           </View>
        </View>

        {/* Menu Management Quick View */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Menu Management</Text>
           <TouchableOpacity onPress={() => router.push('/(restaurant)/menu' as any)}><Text style={styles.seeAllText}>Manage</Text></TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuScroll}>
           <View style={styles.menuCard}>
              <View style={[styles.menuImg, { backgroundColor: '#FFEDD5' }]}><Text style={styles.menuEmoji}>🥟</Text></View>
              <Text style={styles.menuName} numberOfLines={2}>Steamed Chicken Momo</Text>
              <View style={styles.menuActionRow}>
                 <Text style={styles.menuPrice}>Rs. 220</Text>
                 <Switch value={true} trackColor={{ false: Colors.border, true: Colors.primary }} />
              </View>
           </View>
           
           <View style={styles.menuCard}>
              <View style={[styles.menuImg, { backgroundColor: '#FEE2E2' }]}><Text style={styles.menuEmoji}>🍕</Text></View>
              <Text style={styles.menuName} numberOfLines={2}>Napoli Pizza</Text>
              <View style={styles.menuActionRow}>
                 <Text style={styles.menuPrice}>Rs. 540</Text>
                 <Switch value={true} trackColor={{ false: Colors.border, true: Colors.primary }} />
              </View>
           </View>

           <View style={styles.menuCard}>
              <View style={[styles.menuImg, { backgroundColor: '#FEF3C7' }]}><Text style={styles.menuEmoji}>🍱</Text></View>
              <Text style={styles.menuName} numberOfLines={2}>Veg Thali</Text>
              <View style={styles.menuActionRow}>
                 <Text style={styles.menuPrice}>Rs. 320</Text>
                 <Switch value={true} trackColor={{ false: Colors.border, true: Colors.primary }} />
              </View>
           </View>
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Quick Actions</Text>
           <Text style={styles.subText}>Fast access</Text>
        </View>

        <View style={styles.quickActionsGrid}>
           <TouchableOpacity style={[styles.quickBtn, styles.quickBtnPrimary]} onPress={() => router.push('/(restaurant)/menu' as any)}>
              <Text style={styles.quickIconLight}>+</Text>
              <Text style={styles.quickTextLight}>Add Menu Item</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickBtn}>
              <Text style={styles.quickIcon}>📋</Text>
              <Text style={styles.quickText}>View Orders</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickBtn}>
              <Text style={styles.quickIcon}>📈</Text>
              <Text style={styles.quickText}>Earnings</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickBtn}>
              <Text style={styles.quickIcon}>💬</Text>
              <Text style={styles.quickText}>Reviews</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoBg: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoEmoji: { fontSize: 24 },
  headerInfo: { flex: 1 },
  greetingText: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locIcon: { fontSize: 12 },
  locText: { fontSize: 12, color: Colors.textSecondary },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  notifIcon: { fontSize: 16 },
  statusCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  statusLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusValue: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  statIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' },
  statTrendPos: { fontSize: 11, fontWeight: '700', color: Colors.success },
  statTrendNeg: { fontSize: 11, fontWeight: '700', color: Colors.error },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  statSub: { fontSize: 12, color: Colors.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  seeAllText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  subText: { fontSize: 12, color: Colors.textSecondary },
  orderCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  orderName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  orderIdBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  orderIdText: { fontSize: 10, color: Colors.primaryDark, fontWeight: '700' },
  timeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  timeText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  timeBadgeWarn: { backgroundColor: '#FEF3C7' },
  timeTextWarn: { color: '#D97706' },
  orderItems: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  orderActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderPrice: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  btnRow: { flexDirection: 'row', gap: 8 },
  acceptBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  acceptText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rejectBtn: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  rejectText: { color: Colors.textDark, fontSize: 13, fontWeight: '600' },
  menuScroll: { gap: 12, paddingBottom: 16 },
  menuCard: { width: 140, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  menuImg: { height: 100, borderRadius: Radius.lg, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  menuEmoji: { fontSize: 40 },
  menuName: { fontSize: 13, fontWeight: '700', color: Colors.textDark, height: 36, marginBottom: 8 },
  menuActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickBtn: { width: '48%', backgroundColor: Colors.white, paddingVertical: 14, borderRadius: Radius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  quickBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickIcon: { fontSize: 14 },
  quickText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  quickIconLight: { fontSize: 16, color: '#fff', fontWeight: '400' },
  quickTextLight: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
