import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HomeBanner {
  id: string;
  title: string;
  badge: string;
  image: string;
  active: boolean;
}

const INITIAL_BANNERS: HomeBanner[] = [
  {
    id: 'b1',
    title: '50% OFF on First 3 Orders in Kathmandu',
    badge: 'NEW USER OFFER',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
    active: true,
  },
  {
    id: 'b2',
    title: 'Free Delivery Weekend in Lalitpur',
    badge: 'WEEKEND SPECIAL',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop',
    active: true,
  },
];

export default function ContentManagementScreen() {
  const [banners, setBanners] = useState<HomeBanner[]>(INITIAL_BANNERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('');

  const toggleBanner = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleCreateBanner = () => {
    if (!title.trim()) return;

    const newB: HomeBanner = {
      id: 'b_' + Date.now(),
      title: title.trim(),
      badge: badge.trim() || 'PROMO',
      image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop',
      active: true,
    };

    setBanners([newB, ...banners]);
    setModalOpen(false);
    setTitle('');
    setBadge('');
    Alert.alert('Banner Live 🖼️', `"${newB.title}" published to Customer Home!`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Content &amp; Banners</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Banner</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        <View style={styles.bannersList}>
          {banners.map((b) => (
            <View key={b.id} style={styles.bannerCard}>
              <Image source={{ uri: b.image }} style={styles.bannerImg} />

              <View style={styles.bannerBody}>
                <View style={styles.bannerHeaderRow}>
                  <View style={styles.badgeTag}>
                    <Text style={styles.badgeTagText}>{b.badge}</Text>
                  </View>

                  <Switch
                    value={b.active}
                    onValueChange={() => toggleBanner(b.id)}
                    trackColor={{ false: '#FEE2E2', true: '#DCFCE7' }}
                    thumbColor={b.active ? '#22C55E' : '#EF4444'}
                  />
                </View>

                <Text style={styles.bannerTitle}>{b.title}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Add Home Hero Banner</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Banner Headline Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Flat Rs. 100 OFF on Momo Festival"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Badge Tag</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., FESTIVAL OFFER"
              value={badge}
              onChangeText={setBadge}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateBanner}>
              <Text style={styles.saveBtnText}>Publish to Customer Home</Text>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  bannersList: { paddingHorizontal: 16, gap: 14 },
  bannerCard: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  bannerImg: { width: '100%', height: 140 },
  bannerBody: { padding: 14 },
  bannerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeTagText: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },

  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },

  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, height: 46, fontSize: 14, color: '#1E293B' },

  saveBtn: { backgroundColor: '#1E293B', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
