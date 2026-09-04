import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyReviews } from '@/hooks/review/useMyReviews';
import { useDeleteReview } from '@/hooks/review/useDeleteReview';
import { ReviewCard } from '@/components/review/ReviewCard';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function MyReviewsScreen() {
  const { data, isLoading, refetch } = useMyReviews();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const reviews = data?.data || [];
  const averageRating = data?.averageRating || 0;
  const totalReviews = data?.totalReviews || 0;

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleDelete = () => {
    if (pendingDeleteId) {
      deleteReview(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/(customer)/reviews/edit?id=${id}` as any);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.primary }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>My Reviews</Text>
              <Text style={styles.subtitle}>Manage your ratings & reviews</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Overall rating summary */}
      {totalReviews > 0 ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryValue}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Average rating</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRight}>
            <Text style={styles.summaryCount}>{totalReviews}</Text>
            <Text style={styles.summaryLabel}>{totalReviews === 1 ? 'Review' : 'Reviews'} given</Text>
          </View>
        </View>
      ) : null}

      {totalReviews === 0 ? (
        <EmptyState
          icon="star"
          title="No reviews yet"
          description="Rate restaurants you've ordered from. Your ratings will appear here."
          actionLabel="Explore restaurants"
          onAction={() => router.push('/(customer)/(tabs)/explore' as any)}
        />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => refetch()}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <ReviewCard
                review={item}
                showActions
                onEdit={handleEdit}
                onDelete={confirmDelete}
              />
            </View>
          )}
        />
      )}

      {/* Delete confirmation modal */}
      <Modal visible={!!pendingDeleteId} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={styles.modalBackdrop} onPress={() => setPendingDeleteId(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIcon}>
              <Feather name="trash-2" size={24} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Review?</Text>
            <Text style={styles.modalDesc}>This action cannot be undone. Your rating will be removed permanently.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setPendingDeleteId(null)} activeOpacity={0.8} style={[styles.modalBtn, styles.modalCancel]}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={isDeleting} activeOpacity={0.85} style={[styles.modalBtn, styles.modalConfirm]}>
                {isDeleting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalConfirmText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  title: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '500' },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.md,
  },
  summaryLeft: { flex: 1, alignItems: 'center' },
  summaryRight: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: StyleSheet.hairlineWidth, height: 44, backgroundColor: '#E2E8F0' },
  summaryValue: { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  summaryCount: { fontSize: 28, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardWrap: { marginBottom: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 22,
    alignItems: 'center',
    ...Shadow.xl,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginTop: 12 },
  modalDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  modalBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: Radius.full },
  modalCancel: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  modalCancelText: { fontWeight: '700', color: Colors.textDark, fontSize: 14 },
  modalConfirm: { backgroundColor: '#EF4444' },
  modalConfirmText: { fontWeight: '700', color: '#FFFFFF', fontSize: 14 },
});
