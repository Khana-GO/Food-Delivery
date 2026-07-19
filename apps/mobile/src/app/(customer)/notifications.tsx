import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';

const TABS = ['All', 'Orders', 'Offers', 'System'];

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    title: 'Order out for delivery',
    message: 'Your Himalayan Kitchen order is on the way and should arrive in 8 minutes.',
    time: '2 min ago',
    read: false,
    emoji: '🥡',
    bg: '#FFEDD5',
  },
  {
    id: '2',
    type: 'offer',
    title: 'Weekend momo deal',
    message: 'Get 20% off on selected momo combos above Rs. 500.',
    time: '18 min ago',
    read: false,
    emoji: '🏷️',
    bg: '#FEF3C7',
  },
  {
    id: '3',
    type: 'system',
    title: 'Payment update required',
    message: 'Your saved card needs verification before the next order can be placed.',
    time: '1 hr ago',
    read: false,
    emoji: '⚠️',
    bg: '#FEE2E2',
  },
  {
    id: '4',
    type: 'system',
    title: 'System maintenance tonight',
    message: 'A short maintenance window is scheduled from 1:00 AM to 1:30 AM.',
    time: 'Yesterday',
    read: true,
    emoji: '🔔',
    bg: '#F3F4F6',
  },
];

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = activeTab === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab.toLowerCase() || (activeTab === 'Orders' && n.type === 'order'));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <TouchableOpacity style={styles.refreshBar}>
          <Text style={styles.refreshIcon}>🔄</Text>
          <Text style={styles.refreshText}>Pull to refresh</Text>
        </TouchableOpacity>

        {filtered.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconBg, { backgroundColor: item.bg }]}>
              <Text style={styles.iconEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardTime}>{item.time}</Text>
                {item.id === '1' && (
                   <View style={styles.swipeHint}>
                     <Text style={styles.swipeText}>Swipe to delete</Text>
                   </View>
                )}
              </View>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
        ))}

        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Text style={styles.emptyEmoji}>🔕</Text>
          </View>
          <Text style={styles.emptyTitle}>You're all caught up!</Text>
          <Text style={styles.emptyText}>
            No new notifications right now. Check back later for order updates, offers, and alerts.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  markReadText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  tabsWrapper: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingBottom: 12 },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 40 },
  refreshBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    gap: 8,
  },
  refreshIcon: { color: Colors.textSecondary, fontSize: 14 },
  refreshText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    ...Shadow.sm,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  cardMessage: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTime: { fontSize: 12, color: Colors.textLight },
  swipeHint: { backgroundColor: Colors.backgroundAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  swipeText: { fontSize: 10, color: Colors.textSecondary },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: { fontSize: 28 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
