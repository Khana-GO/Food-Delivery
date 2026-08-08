import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  orderedItem: string;
  comment: string;
  reply?: string;
}

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'r1',
    customerName: 'Aayush Shrestha',
    rating: 5,
    date: 'Yesterday',
    orderedItem: 'Western BBQ Cheeseburger Meal',
    comment: 'Delicious burger! The patty was super juicy and fries arrived hot.',
    reply: 'Thank you Aayush! We appreciate your support and hope to serve you again soon.',
  },
  {
    id: 'r2',
    customerName: 'Prashant Nepal',
    rating: 4,
    date: '2 days ago',
    orderedItem: 'Double Angus Classic',
    comment: 'Great taste, but delivery took 5 extra minutes during lunch rush.',
  },
  {
    id: 'r3',
    customerName: 'Suman Bhattarai',
    rating: 5,
    date: '3 days ago',
    orderedItem: 'Crispy Onion Rings + Coke',
    comment: 'Super fast delivery to Durbar Marg! 10/10.',
  },
];

export default function RestaurantReviewsScreen() {
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [replyText, setReplyText] = useState('');

  const openReplyModal = (rev: CustomerReview) => {
    setSelectedReview(rev);
    setReplyText(rev.reply || '');
    setReplyModalOpen(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedReview) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReview.id ? { ...r, reply: replyText.trim() } : r
      )
    );

    setReplyModalOpen(false);
    setSelectedReview(null);
    setReplyText('');
    Alert.alert('Reply Sent 💬', 'Your response to the customer has been published.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Customer Reviews</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        {/* Rating Overview Box */}
        <View style={styles.ratingOverviewCard}>
          <View style={styles.ratingBigCol}>
            <Text style={styles.ratingBigText}>4.8</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={16} color="#F59E0B" />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>320 Customer Reviews</Text>
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.customerName}>{rev.customerName}</Text>
                  <Text style={styles.orderedItem}>Item: {rev.orderedItem}</Text>
                </View>

                <View style={styles.starsBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.starsText}>{rev.rating}.0</Text>
                </View>
              </View>

              <Text style={styles.commentText}>"{rev.comment}"</Text>

              {rev.reply ? (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Your Response:</Text>
                  <Text style={styles.replyText}>"{rev.reply}"</Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <Text style={styles.dateText}>{rev.date}</Text>
                <TouchableOpacity
                  style={styles.replyBtn}
                  onPress={() => openReplyModal(rev)}
                >
                  <Ionicons name="chatbubble-outline" size={14} color="#38BDF8" />
                  <Text style={styles.replyBtnText}>
                    {rev.reply ? 'Edit Reply' : 'Reply to Customer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Reply Modal */}
      <Modal visible={replyModalOpen} animationType="slide" transparent onRequestClose={() => setReplyModalOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Reply to {selectedReview?.customerName}</Text>
              <TouchableOpacity onPress={() => setReplyModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.reviewQuote}>"{selectedReview?.comment}"</Text>

            <Text style={styles.label}>Your Official Response</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Thank you for your feedback! We will make sure..."
              placeholderTextColor="#94A3B8"
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />

            <TouchableOpacity style={styles.sendBtn} onPress={handleSendReply}>
              <Text style={styles.sendBtnText}>Publish Reply</Text>
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

  ratingOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  ratingBigCol: { alignItems: 'center' },
  ratingBigText: { fontSize: 36, fontWeight: '800', color: '#1E293B' },
  starsRow: { flexDirection: 'row', gap: 4, marginVertical: 4 },
  totalReviewsText: { fontSize: 12, color: '#64748B' },

  reviewsList: { paddingHorizontal: 16, gap: 12 },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  customerName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  orderedItem: { fontSize: 12, color: '#64748B', marginTop: 2 },
  starsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  starsText: { fontSize: 12, fontWeight: '800', color: '#92400E' },

  commentText: { fontSize: 14, color: '#334155', fontStyle: 'italic', marginVertical: 8 },

  replyBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#BAE6FD', marginTop: 8 },
  replyLabel: { fontSize: 11, fontWeight: '800', color: '#0284C7', marginBottom: 2 },
  replyText: { fontSize: 13, color: '#0369A1' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dateText: { fontSize: 12, color: '#94A3B8' },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replyBtnText: { fontSize: 12, fontWeight: '700', color: '#38BDF8' },

  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },

  reviewQuote: { fontSize: 13, fontStyle: 'italic', color: '#64748B', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 },
  textInput: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, minHeight: 90, fontSize: 14, color: '#1E293B', textAlignVertical: 'top', marginBottom: 20 },

  sendBtn: { backgroundColor: '#1E293B', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
