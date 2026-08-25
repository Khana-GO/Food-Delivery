import React from 'react';
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

const CATEGORIES = [
  { id: '1', name: 'Momo', count: 18, emoji: '🥟', bg: '#FFEDD5' },
  { id: '2', name: 'Pizza', count: 12, emoji: '🍕', bg: '#FEE2E2' },
  { id: '3', name: 'Burger', count: 9, emoji: '🍔', bg: '#FEF3C7' },
  { id: '4', name: 'Thali', count: 14, emoji: '🍱', bg: '#ECFCCB' },
  { id: '5', name: 'Drinks', count: 7, emoji: '🥤', bg: '#E0F2FE' },
  { id: '6', name: 'Dessert', count: 5, emoji: '🍦', bg: '#FCE7F3' },
];

export default function ManageCategoriesScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Manage Categories</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnIcon}>+</Text>
          <Text style={styles.addBtnText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
         
         {/* Categories Grid */}
         <View style={styles.grid}>
            {CATEGORIES.map(cat => (
               <View key={cat.id} style={styles.gridCard}>
                  <View style={styles.gridCardHeader}>
                     <View style={[styles.iconBg, { backgroundColor: cat.bg }]}>
                        <Text style={styles.iconEmoji}>{cat.emoji}</Text>
                     </View>
                     <View style={styles.dragHandle}><Text style={styles.dragIcon}>⋮⋮</Text></View>
                  </View>
                  
                  <Text style={styles.catName}>{cat.name}</Text>
                  
                  <View style={styles.countBadge}>
                     <Text style={styles.countText}>{cat.count} items</Text>
                  </View>
                  
                  <View style={styles.actionsRow}>
                     <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionIcon}>✏️</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}>
                        <Text style={styles.actionIcon}>🗑️</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            ))}
         </View>

         {/* Category Order Section */}
         <View style={styles.orderSection}>
            <View style={styles.orderHeader}>
               <View>
                 <Text style={styles.orderTitle}>Category Order</Text>
                 <Text style={styles.orderSub}>Drag items to reorder your menu categories.</Text>
               </View>
               <View style={styles.countPill}>
                 <Text style={styles.countPillTxt}>6 categories</Text>
               </View>
            </View>

            <View style={styles.orderList}>
               {CATEGORIES.map(cat => (
                  <View key={`list-${cat.id}`} style={styles.listCard}>
                     <View style={styles.dragHandleList}><Text style={styles.dragIconList}>⋮⋮</Text></View>
                     <View style={[styles.listIconBg, { backgroundColor: cat.bg }]}>
                        <Text style={styles.listEmoji}>{cat.emoji}</Text>
                     </View>
                     <View style={styles.listInfo}>
                        <Text style={styles.listName}>{cat.name}</Text>
                        <Text style={styles.listDesc}>Display order and visibility</Text>
                     </View>
                     <View style={styles.listCountBox}>
                        <Text style={styles.listCountText}>{cat.count}</Text>
                     </View>
                  </View>
               ))}
            </View>
         </View>

      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
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
  container: { paddingBottom: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  gridCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  gridCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 24 },
  dragHandle: { padding: 4 },
  dragIcon: { color: Colors.textLight, fontSize: 14, fontWeight: '800' },
  catName: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 16,
  },
  countText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionBtn: { padding: 6 },
  actionIcon: { fontSize: 14 },
  actionBtnDanger: { opacity: 0.8 },
  orderSection: { padding: 16, backgroundColor: Colors.background },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  orderSub: { fontSize: 12, color: Colors.textSecondary },
  countPill: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  countPillTxt: { fontSize: 11, fontWeight: '600', color: Colors.textDark },
  orderList: { gap: 12 },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  dragHandleList: { padding: 8, paddingLeft: 4, marginRight: 8 },
  dragIconList: { color: Colors.textLight, fontSize: 16, fontWeight: '800' },
  listIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  listEmoji: { fontSize: 18 },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  listDesc: { fontSize: 11, color: Colors.textSecondary },
  listCountBox: { backgroundColor: Colors.backgroundAlt, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  listCountText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
});
