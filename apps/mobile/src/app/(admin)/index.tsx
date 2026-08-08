import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Super Admin Panel</Text>
          <Text style={styles.subTitle}>Platform Operations &amp; System Health</Text>
        </View>
        <View style={styles.systemStatusBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.systemStatusText}>ALL SYSTEMS HEALTHY</Text>
        </View>
      </View>

      {/* Navigation Toolbar */}
      <View style={styles.toolbarScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
          <TouchableOpacity style={[styles.navPill, styles.navPillActive]}>
            <Ionicons name="speedometer" size={16} color="#FFFFFF" />
            <Text style={styles.navPillTextActive}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(admin)/users')}
          >
            <Ionicons name="people" size={16} color="#64748B" />
            <Text style={styles.navPillText}>User Management</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(admin)/verification')}
          >
            <Ionicons name="shield-checkmark" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Verifications (3)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(admin)/content')}
          >
            <Ionicons name="image" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Banners</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(admin)/disputes')}
          >
            <Ionicons name="alert-circle" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Disputes (2)</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        {/* Platform Analytics Cards (GMV, Volume, Revenue) */}
        <Text style={styles.sectionTitle}>Platform Analytics (Nepal)</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Gross GMV</Text>
            <Text style={styles.metricValue}>Rs. 4.85M</Text>
            <Text style={styles.metricTrend}>↑ +22.4% MoM</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active Users</Text>
            <Text style={styles.metricValue}>18,450</Text>
            <Text style={styles.metricSub}>+1,200 this week</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Daily Volume</Text>
            <Text style={styles.metricValue}>2,480</Text>
            <Text style={styles.metricSub}>Orders / Day</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Take Rate Revenue</Text>
            <Text style={styles.metricValue}>Rs. 727.5K</Text>
            <Text style={styles.metricTrend}>15% Commission</Text>
          </View>
        </View>

        {/* System Health & Infrastructure Monitoring */}
        <Text style={styles.sectionTitle}>System Health &amp; Infrastructure</Text>
        <View style={styles.healthCard}>
          <View style={styles.healthRow}>
            <View style={styles.healthLabelGroup}>
              <Ionicons name="server-outline" size={18} color="#38BDF8" />
              <Text style={styles.healthName}>API Gateway Latency</Text>
            </View>
            <Text style={styles.healthVal}>42ms (99.99% Uptime)</Text>
          </View>

          <View style={styles.healthRow}>
            <View style={styles.healthLabelGroup}>
              <Ionicons name="cube-outline" size={18} color="#10B981" />
              <Text style={styles.healthName}>Database Engine (PostgreSQL)</Text>
            </View>
            <Text style={styles.healthVal}>12ms (Healthy)</Text>
          </View>

          <View style={styles.healthRow}>
            <View style={styles.healthLabelGroup}>
              <Ionicons name="notifications-outline" size={18} color="#F59E0B" />
              <Text style={styles.healthName}>Push Notification Engine</Text>
            </View>
            <Text style={styles.healthVal}>Operational</Text>
          </View>

          <View style={styles.healthRow}>
            <View style={styles.healthLabelGroup}>
              <Ionicons name="card-outline" size={18} color="#6366F1" />
              <Text style={styles.healthName}>Nepal Payment Gateways</Text>
            </View>
            <Text style={styles.healthVal}>eSewa, Khalti, Fonepay Online</Text>
          </View>
        </View>

        {/* Quick Action Navigation Cards */}
        <Text style={styles.sectionTitle}>Admin Controls &amp; Management</Text>
        <View style={styles.controlsList}>
          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push('/(admin)/users')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="people" size={22} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>User Directory Management</Text>
              <Text style={styles.controlSub}>Search, filter, role assignment &amp; suspensions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push('/(admin)/verification')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="shield-checkmark" size={22} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>Restaurant Verification Workflow</Text>
              <Text style={styles.controlSub}>Review PAN/VAT &amp; Food Hygiene documents (3 pending)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push('/(admin)/content')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="image" size={22} color="#166534" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>Content &amp; Banner Management</Text>
              <Text style={styles.controlSub}>Manage app hero banners &amp; featured promotions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push('/(admin)/disputes')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={22} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>Dispute &amp; Refund System</Text>
              <Text style={styles.controlSub}>Handle order complaints &amp; refund requests (2 open)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  subTitle: { fontSize: 12, color: '#64748B' },
  systemStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  systemStatusText: { fontSize: 10, fontWeight: '800', color: '#15803D' },

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

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', paddingHorizontal: 16, marginTop: 18, marginBottom: 10 },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: { fontSize: 12, color: '#64748B' },
  metricValue: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  metricTrend: { fontSize: 11, fontWeight: '700', color: '#166534', marginTop: 4 },
  metricSub: { fontSize: 11, color: '#64748B', marginTop: 4 },

  healthCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthName: { fontSize: 13, fontWeight: '600', color: '#334155' },
  healthVal: { fontSize: 12, fontWeight: '700', color: '#059669' },

  controlsList: { paddingHorizontal: 16, gap: 10 },
  controlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  controlTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  controlSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
