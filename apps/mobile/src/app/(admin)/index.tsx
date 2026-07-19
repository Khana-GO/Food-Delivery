import { Text } from '@/components/ui/Text';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminDashboardScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSub}>Platform health, approvals, and issue tracking</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconTxt}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn}>
              <Text style={styles.avatarTxt}>AD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={[styles.statIconBg, { backgroundColor: '#FFEDD5' }]}><Text style={styles.statIconEmoji}>🛍️</Text></View>
                 <View style={styles.trendBadge}><Text style={styles.trendPos}>+12%</Text></View>
              </View>
              <Text style={styles.statLabel}>Total Orders</Text>
              <Text style={styles.statValue}>12.4K</Text>
           </View>

           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={[styles.statIconBg, { backgroundColor: '#DCFCE7' }]}><Text style={styles.statIconEmoji}>🏪</Text></View>
                 <View style={styles.trendBadge}><Text style={styles.trendPos}>+4%</Text></View>
              </View>
              <Text style={styles.statLabel}>Active Restaurants</Text>
              <Text style={styles.statValue}>248</Text>
           </View>

           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={[styles.statIconBg, { backgroundColor: '#FEE2E2' }]}><Text style={styles.statIconEmoji}>🚚</Text></View>
                 <View style={[styles.trendBadge, { backgroundColor: '#FEE2E2' }]}><Text style={styles.trendNeg}>-2%</Text></View>
              </View>
              <Text style={styles.statLabel}>Total Drivers</Text>
              <Text style={styles.statValue}>86</Text>
           </View>

           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}><Text style={styles.statIconEmoji}>💰</Text></View>
                 <View style={styles.trendBadge}><Text style={styles.trendPos}>+18%</Text></View>
              </View>
              <Text style={styles.statLabel}>Revenue Today</Text>
              <Text style={styles.statValue}>Rs. 1.8L</Text>
           </View>
        </ScrollView>

        {/* Platform Overview Chart Area */}
        <View style={styles.chartCard}>
           <View style={styles.chartHeader}>
              <View>
                 <Text style={styles.chartTitle}>Platform Overview</Text>
                 <Text style={styles.chartSub}>Weekly order trend and fulfillment activity</Text>
              </View>
              <View style={styles.filterPill}>
                 <Text style={styles.filterPillTxt}>This week</Text>
              </View>
           </View>
           <View style={styles.chartPlaceholder}>
              {/* Fake chart bars */}
              <View style={styles.chartArea}>
                 <Text style={{ color: Colors.textLight, fontSize: 12 }}>[ Chart UI Placeholder ]</Text>
              </View>
              <View style={styles.chartLabels}>
                 <Text style={styles.chartLabelText}>Mon</Text>
                 <Text style={styles.chartLabelText}>Tue</Text>
                 <Text style={styles.chartLabelText}>Wed</Text>
                 <Text style={styles.chartLabelText}>Thu</Text>
                 <Text style={styles.chartLabelText}>Fri</Text>
                 <Text style={styles.chartLabelText}>Sat</Text>
                 <Text style={styles.chartLabelText}>Sun</Text>
              </View>
           </View>
        </View>

        {/* Pending Approvals */}
        <View style={styles.sectionHeader}>
           <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Pending Approvals</Text>
              <Text style={styles.sectionSub}>Review new restaurant and driver requests</Text>
           </View>
           <Text style={styles.seeAllText}>8 pending</Text>
        </View>
        
        <View style={styles.approvalCard}>
           <View style={styles.approvalRow}>
              <View style={[styles.approvalImg, { backgroundColor: '#E5E7EB' }]}><Text style={{ fontSize: 24 }}>🏪</Text></View>
              <View style={styles.approvalInfo}>
                 <Text style={styles.approvalName}>Himalayan Spice Kitchen</Text>
                 <Text style={styles.approvalDesc}>Restaurant onboarding request</Text>
              </View>
              <Badge label="Pending" variant="warning" />
           </View>
           <View style={styles.approvalActions}>
              <Button label="Approve" size="sm" style={{ flex: 1 }} />
              <Button label="Reject" size="sm" variant="outline" style={{ flex: 1 }} textStyle={{ color: Colors.textDark }} />
           </View>
        </View>

        <View style={styles.approvalCard}>
           <View style={styles.approvalRow}>
              <View style={[styles.approvalImg, { backgroundColor: '#E5E7EB' }]}><Text style={{ fontSize: 24 }}>👨</Text></View>
              <View style={styles.approvalInfo}>
                 <Text style={styles.approvalName}>Aarav Shrestha</Text>
                 <Text style={styles.approvalDesc}>Driver verification request</Text>
              </View>
              <Badge label="Pending" variant="warning" />
           </View>
           <View style={styles.approvalActions}>
              <Button label="Approve" size="sm" style={{ flex: 1 }} />
              <Button label="Reject" size="sm" variant="outline" style={{ flex: 1 }} textStyle={{ color: Colors.textDark }} />
           </View>
        </View>

        {/* Recent Reports & Issues */}
        <View style={styles.sectionHeader}>
           <View>
              <Text style={styles.sectionTitle}>Recent Reports & Issues</Text>
              <Text style={styles.sectionSub}>Customer complaints and operational alerts</Text>
           </View>
        </View>
        
        <View style={styles.issuesCard}>
           <TouchableOpacity style={styles.issueRow}>
              <View style={styles.issueIconBg}><Text style={styles.issueIcon}>💬</Text></View>
              <View style={styles.issueInfo}>
                 <Text style={styles.issueTitle}>Late delivery complaint from Baneshwor order #2041</Text>
                 <Text style={styles.issueTime}>12 min ago</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.issueRow}>
              <View style={styles.issueIconBgWarn}><Text style={styles.issueIcon}>⚠️</Text></View>
              <View style={styles.issueInfo}>
                 <Text style={styles.issueTitle}>Restaurant marked unavailable during peak hours</Text>
                 <Text style={styles.issueTime}>34 min ago</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={[styles.issueRow, { borderBottomWidth: 0 }]}>
              <View style={styles.issueIconBgError}><Text style={styles.issueIcon}>⚙️</Text></View>
              <View style={styles.issueInfo}>
                 <Text style={styles.issueTitle}>Payment gateway timeout reported by multiple users</Text>
                 <Text style={styles.issueTime}>1 hr ago</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
           </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
           <View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionSub}>Fast access to admin tools</Text>
           </View>
        </View>
        
        <View style={styles.quickGrid}>
           <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(admin)/users' as any)}>
              <View style={[styles.quickIconBg, { backgroundColor: '#FFEDD5' }]}><Text style={styles.quickIcon}>👥</Text></View>
              <Text style={styles.quickText}>Manage Users</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(admin)/restaurants' as any)}>
              <View style={[styles.quickIconBg, { backgroundColor: '#FEE2E2' }]}><Text style={styles.quickIcon}>🏪</Text></View>
              <Text style={styles.quickText}>Manage Restaurants</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickCard}>
              <View style={[styles.quickIconBg, { backgroundColor: '#FEF3C7' }]}><Text style={styles.quickIcon}>🚚</Text></View>
              <Text style={styles.quickText}>Manage Drivers</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickCard}>
              <View style={[styles.quickIconBg, { backgroundColor: '#E0F2FE' }]}><Text style={styles.quickIcon}>⚙️</Text></View>
              <Text style={styles.quickText}>Settings</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerInfo: { flex: 1, paddingRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  headerSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  iconTxt: { fontSize: 18 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  avatarTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  statsScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 16 },
  statCard: {
    width: 130,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  statIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statIconEmoji: { fontSize: 18 },
  trendBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendPos: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  trendNeg: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  chartCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 2 },
  chartSub: { fontSize: 12, color: Colors.textSecondary },
  filterPill: { backgroundColor: Colors.backgroundAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  filterPillTxt: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  chartPlaceholder: { backgroundColor: Colors.background, borderRadius: Radius.lg, height: 180, padding: 12, justifyContent: 'space-between' },
  chartArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  chartLabelText: { fontSize: 10, color: Colors.textLight },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: Colors.textSecondary },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#D97706' },
  approvalCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  approvalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  approvalImg: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  approvalInfo: { flex: 1, paddingRight: 8 },
  approvalName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  approvalDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },
  approvalActions: { flexDirection: 'row', gap: 12 },
  issuesCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  issueIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  issueIconBgWarn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  issueIconBgError: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  issueIcon: { fontSize: 16 },
  issueInfo: { flex: 1, paddingRight: 12 },
  issueTitle: { fontSize: 13, color: Colors.textDark, fontWeight: '500', marginBottom: 4, lineHeight: 18 },
  issueTime: { fontSize: 11, color: Colors.textLight },
  chevron: { fontSize: 20, color: Colors.textLight },
  quickGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  quickCard: { flex: 1, backgroundColor: Colors.white, paddingVertical: 16, paddingHorizontal: 8, borderRadius: Radius.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  quickIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickIcon: { fontSize: 20 },
  quickText: { fontSize: 11, fontWeight: '600', color: Colors.textDark, textAlign: 'center' },
});
