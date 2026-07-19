import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const RESTAURANTS = [
  {
    id: '1',
    name: 'Himalayan Kitchen',
    categories: ['Nepali', 'Momos', 'Thali'],
    rating: 4.8,
    location: 'Baneshwor',
    status: 'Active',
    isOpen: true,
    tags: ['Momos', 'Thali', 'Delivery'],
    emoji: '🥟',
    bg: '#FFEDD5',
  },
  {
    id: '2',
    name: 'Spice Route',
    categories: ['Indian', 'Biryani', 'Grill'],
    rating: 4.5,
    location: 'New Road',
    status: 'Suspended',
    isOpen: false,
    tags: ['Biryani', 'Tandoor', 'Pickup'],
    emoji: '🍛',
    bg: '#FEE2E2',
  },
  {
    id: '3',
    name: 'Momo House',
    categories: ['Fast Food', 'Snacks', 'Tea'],
    rating: 4.7,
    location: 'Patan',
    status: 'Active',
    isOpen: true,
    tags: ['Momos', 'Snacks', 'Dine-in'],
    emoji: '☕',
    bg: '#FEF3C7',
  },
];

export default function ManageRestaurantsScreen() {
  const [searchText, setSearchText] = useState('');
  const [restaurants, setRestaurants] = useState(RESTAURANTS);
  const [showToast, setShowToast] = useState(false);

  const toggleStatus = (id: string, val: boolean) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, isOpen: val } : r));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Manage{'\n'}Restaurants</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnIcon}>+</Text>
          <Text style={styles.addBtnText}>Add Restaurant</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input 
           placeholder="Search restaurants" 
           value={searchText}
           onChangeText={setSearchText}
           leftIcon={<Text style={{ fontSize: 16 }}>🔍</Text>}
           rightIcon={<Text style={{ fontSize: 16 }}>⚙️</Text>}
           containerStyle={{ marginBottom: 0 }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
         {restaurants.map(r => (
            <View key={r.id} style={styles.card}>
               <View style={styles.cardHeaderRow}>
                  <View style={[styles.cardImg, { backgroundColor: r.bg }]}>
                     <Text style={styles.cardEmoji}>{r.emoji}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                     <View style={styles.nameRow}>
                        <Text style={styles.cardName}>{r.name}</Text>
                        <Badge label={r.status} variant={r.status === 'Active' ? 'success' : 'warning'} />
                     </View>
                     <Text style={styles.cardCat}>{r.categories.join(' • ')}</Text>
                     <View style={styles.metaRow}>
                        <Text style={styles.ratingText}>⭐ {r.rating}</Text>
                        <Text style={styles.locText}>📍 {r.location}</Text>
                     </View>
                  </View>
               </View>

               <View style={styles.tagsRow}>
                  {r.tags.map(tag => (
                     <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                  ))}
               </View>

               <View style={styles.statusToggleRow}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <View style={styles.toggleWrap}>
                     <Text style={styles.toggleTextL}>Closed</Text>
                     <Switch 
                        value={r.isOpen} 
                        onValueChange={(val) => toggleStatus(r.id, val)}
                        trackColor={{ false: Colors.border, true: Colors.primary }}
                        style={{ transform: [{ scale: 0.9 }] }}
                     />
                     <Text style={styles.toggleTextR}>Open</Text>
                  </View>
               </View>

               <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn}>
                     <Text style={styles.actionIcon}>👁️</Text>
                     <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                     <Text style={styles.actionIcon}>✏️</Text>
                     <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                     <Text style={styles.actionIconDanger}>🗑️</Text>
                     <Text style={styles.actionTextDanger}>Delete</Text>
                  </TouchableOpacity>
               </View>
            </View>
         ))}
      </ScrollView>

      {/* Toast Notification */}
      {showToast && (
         <View style={styles.toast}>
            <View style={styles.toastLeft}>
               <Text style={styles.toastIcon}>✅</Text>
               <Text style={styles.toastText}>Restaurant saved successfully</Text>
            </View>
            <TouchableOpacity onPress={() => setShowToast(false)}>
               <Text style={styles.toastDismiss}>Dismiss</Text>
            </TouchableOpacity>
         </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, textAlign: 'center', lineHeight: 20 },
  addBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    gap: 4,
  },
  addBtnIcon: { color: '#fff', fontSize: 16 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  list: { padding: 16, paddingBottom: 100, backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  cardHeaderRow: { flexDirection: 'row', marginBottom: 12 },
  cardImg: { width: 64, height: 64, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: '800', color: Colors.textDark, flex: 1, marginRight: 8 },
  cardCat: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 12 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  locText: { fontSize: 12, color: Colors.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: Colors.backgroundAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  tagText: { fontSize: 11, color: Colors.textMedium, fontWeight: '500' },
  statusToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.borderLight, marginBottom: 12 },
  statusLabel: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  toggleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleTextL: { fontSize: 11, color: Colors.textSecondary },
  toggleTextR: { fontSize: 11, color: Colors.textDark, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 12, paddingTop: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderLight },
  actionIcon: { fontSize: 14 },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.textDark },
  actionIconDanger: { fontSize: 14 },
  actionTextDanger: { fontSize: 12, fontWeight: '600', color: Colors.error },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#111827',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.lg,
  },
  toastLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toastIcon: { fontSize: 16 },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  toastDismiss: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
