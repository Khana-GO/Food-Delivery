import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PendingRestaurant {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  panVatNo: string;
  documents: {
    panCert: string;
    hygieneLicense: string;
    citizenship: string;
  };
  submittedDate: string;
}

const PENDING_RESTAURANTS: PendingRestaurant[] = [
  {
    id: 'req_1',
    name: 'Himalayan Momo & Sekuwa House',
    ownerName: 'Subash Shrestha',
    phone: '+977 9841987654',
    address: 'Thamel, Ward No. 26, Kathmandu',
    panVatNo: '302918273 PAN',
    documents: {
      panCert: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop',
      hygieneLicense: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop',
      citizenship: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop',
    },
    submittedDate: 'Yesterday, 4:30 PM',
  },
  {
    id: 'req_2',
    name: 'Pokhara Lakeside Pizza Bar',
    ownerName: 'Anita Gurung',
    phone: '+977 9856012345',
    address: 'Lakeside, Ward No. 6, Pokhara',
    panVatNo: '601298374 VAT',
    documents: {
      panCert: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop',
      hygieneLicense: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop',
      citizenship: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop',
    },
    submittedDate: 'Today, 10:15 AM',
  },
];

export default function RestaurantVerificationScreen() {
  const [requests, setRequests] = useState<PendingRestaurant[]>(PENDING_RESTAURANTS);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleApprove = (id: string, name: string) => {
    Alert.alert('Approve Restaurant 🇳🇵', `Approve "${name}" for live food delivery on the platform?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve & Activate',
        onPress: () => {
          setRequests((prev) => prev.filter((r) => r.id !== id));
          Alert.alert('Verified! ✅', `${name} is now active on the platform.`);
        },
      },
    ]);
  };

  const handleReject = (id: string, name: string) => {
    Alert.alert('Reject Application', `Decline registration for "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setRequests((prev) => prev.filter((r) => r.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Restaurant Verifications ({requests.length})</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark" size={56} color="#22C55E" />
            <Text style={styles.emptyTitle}>All verification queues cleared!</Text>
            <Text style={styles.emptySub}>No pending partner applications.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {requests.map((req) => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.restName}>{req.name}</Text>
                    <Text style={styles.ownerText}>Owner: {req.ownerName} • {req.phone}</Text>
                    <Text style={styles.addressText}>{req.address}</Text>
                    <Text style={styles.panText}>PAN/VAT #: {req.panVatNo}</Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>PENDING</Text>
                  </View>
                </View>

                {/* Document Thumbnails Preview */}
                <Text style={styles.docSectionTitle}>Uploaded Legal Documents (Tap to inspect)</Text>
                <View style={styles.docRow}>
                  <TouchableOpacity
                    style={styles.docThumbBox}
                    onPress={() => setSelectedDoc(req.documents.panCert)}
                  >
                    <Image source={{ uri: req.documents.panCert }} style={styles.docThumb} />
                    <Text style={styles.docThumbLabel}>PAN / VAT Cert</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.docThumbBox}
                    onPress={() => setSelectedDoc(req.documents.hygieneLicense)}
                  >
                    <Image source={{ uri: req.documents.hygieneLicense }} style={styles.docThumb} />
                    <Text style={styles.docThumbLabel}>Food Safety</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.docThumbBox}
                    onPress={() => setSelectedDoc(req.documents.citizenship)}
                  >
                    <Image source={{ uri: req.documents.citizenship }} style={styles.docThumb} />
                    <Text style={styles.docThumbLabel}>Citizenship ID</Text>
                  </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(req.id, req.name)}
                  >
                    <Text style={styles.rejectBtnText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(req.id, req.name)}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.approveBtnText}>Approve Partner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Full Document Inspector Modal */}
      <Modal visible={!!selectedDoc} transparent animationType="fade" onRequestClose={() => setSelectedDoc(null)}>
        <View style={styles.docInspectorBackdrop}>
          <TouchableOpacity style={styles.closeDocBtn} onPress={() => setSelectedDoc(null)}>
            <Ionicons name="close-circle" size={36} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedDoc && (
            <Image source={{ uri: selectedDoc }} style={styles.fullDocImage} resizeMode="contain" />
          )}
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

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  emptySub: { fontSize: 13, color: '#64748B' },

  list: { paddingHorizontal: 16, gap: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  restName: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  ownerText: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 2 },
  addressText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  panText: { fontSize: 12, fontWeight: '700', color: '#0284C7', marginTop: 4 },

  pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pendingText: { fontSize: 10, fontWeight: '800', color: '#92400E' },

  docSectionTitle: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 8 },
  docRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  docThumbBox: { flex: 1, height: 80, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  docThumb: { width: '100%', height: 56 },
  docThumbLabel: { fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'center', marginTop: 4 },

  actionRow: { flexDirection: 'row', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  rejectBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#FEE2E2' },
  rejectBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: 12, gap: 6 },
  approveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  docInspectorBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  closeDocBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullDocImage: { width: '100%', height: '80%' },
});
