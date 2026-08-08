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

interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  code: string;
}

const REWARDS: RewardItem[] = [
  {
    id: 'r1',
    title: 'Free Delivery Voucher',
    pointsCost: 300,
    description: 'Valid for any restaurant in Kathmandu Valley',
    code: 'FREEDEL300',
  },
  {
    id: 'r2',
    title: 'Rs. 200 Discount Voucher',
    pointsCost: 800,
    description: 'Applicable on orders above Rs. 600',
    code: 'REWARD200',
  },
  {
    id: 'r3',
    title: 'Free Steamed Chicken Momo',
    pointsCost: 1200,
    description: 'Redeemable at participating Momo houses',
    code: 'FREEMOMO',
  },
];

export default function CustomerRewardsScreen() {
  const [points, setPoints] = useState(1450);

  const handleRedeem = (reward: RewardItem) => {
    if (points < reward.pointsCost) {
      Alert.alert('Insufficient Points', `You need ${reward.pointsCost - points} more points.`);
      return;
    }

    setPoints((prev) => prev - reward.pointsCost);
    Alert.alert(
      'Reward Redeemed! 🎁',
      `Voucher "${reward.code}" added to your account! Copy code at checkout.`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Foodie Rewards &amp; Loyalty</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        {/* Tier Card */}
        <View style={styles.pointsCard}>
          <View style={styles.badgeRow}>
            <Ionicons name="trophy" size={20} color="#F59E0B" />
            <Text style={styles.tierText}>GOLD TIER MEMBER 🏆</Text>
          </View>
          <Text style={styles.pointsVal}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsSub}>Foodie Reward Points</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '70%' }]} />
            </View>
            <Text style={styles.progressText}>550 pts until Platinum Tier</Text>
          </View>
        </View>

        {/* Redeemable Rewards */}
        <Text style={styles.sectionTitle}>Redeemable Vouchers</Text>
        <View style={styles.rewardsList}>
          {REWARDS.map((r) => {
            const canAfford = points >= r.pointsCost;
            return (
              <View key={r.id} style={styles.rewardCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardTitle}>{r.title}</Text>
                  <Text style={styles.rewardSub}>{r.description}</Text>
                  <Text style={styles.costText}>{r.pointsCost} Points</Text>
                </View>

                <TouchableOpacity
                  style={[styles.redeemBtn, !canAfford && styles.redeemDisabled]}
                  onPress={() => handleRedeem(r)}
                >
                  <Text style={[styles.redeemText, !canAfford && styles.redeemDisabledText]}>
                    {canAfford ? 'Redeem' : 'Locked'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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

  pointsCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, marginHorizontal: 16, marginBottom: 18 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tierText: { fontSize: 12, fontWeight: '800', color: '#F59E0B' },
  pointsVal: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  pointsSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },

  progressContainer: { marginTop: 16 },
  progressBar: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 4 },
  progressText: { fontSize: 11, color: '#CBD5E1', marginTop: 6 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', paddingHorizontal: 16, marginBottom: 10 },
  rewardsList: { paddingHorizontal: 16, gap: 12 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  rewardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  rewardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  costText: { fontSize: 14, fontWeight: '800', color: '#38BDF8', marginTop: 6 },

  redeemBtn: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  redeemDisabled: { backgroundColor: '#F1F5F9' },
  redeemText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  redeemDisabledText: { color: '#94A3B8' },
});
