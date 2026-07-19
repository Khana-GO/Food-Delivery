import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Button from '@/components/ui/Button';

const TABS = ['Momo', 'Thali', 'Drinks', 'Desserts'];

const MENU_ITEMS = [
  {
    id: '1',
    name: 'Chicken Momo',
    desc: 'Steamed dumplings with spicy achar',
    price: 320,
    isVeg: false,
    isActive: true,
    emoji: '🥟',
    bg: '#FFEDD5',
  },
  {
    id: '2',
    name: 'Butter Chicken',
    desc: 'Rich gravy with tender chicken',
    price: 480,
    isVeg: false,
    isActive: true,
    emoji: '🍛',
    bg: '#FEE2E2',
  },
  {
    id: '3',
    name: 'Napoli Pizza',
    desc: 'Wood-fired crust with mozzarella',
    price: 540,
    isVeg: true,
    isActive: false,
    emoji: '🍕',
    bg: '#FEF3C7',
  },
  {
    id: '4',
    name: 'Mango Lassi',
    desc: 'Sweet yogurt drink with mango',
    price: 140,
    isVeg: true,
    isActive: true,
    emoji: '🥭',
    bg: '#ECFCCB',
  },
];

export default function MenuManagementScreen() {
  const [activeTab, setActiveTab] = useState('Momo');
  const [items, setItems] = useState(MENU_ITEMS);

  const toggleItem = (id: string, value: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: value } : item))
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Menu Management</Text>
          <Text style={styles.headerSub}>Manage items, availability, and pricing</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnIcon}>+</Text>
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
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
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={[styles.itemImg, { backgroundColor: item.bg }]}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.itemInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={[styles.vegDot, item.isVeg ? styles.veg : styles.nonVeg]} />
              </View>
              <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
              <Text style={styles.itemPrice}>Rs. {item.price}</Text>
              
              <View style={styles.bottomRow}>
                <View style={styles.vegLabelRow}>
                   <View style={[styles.vegDotSm, item.isVeg ? styles.veg : styles.nonVeg]} />
                   <Text style={styles.vegLabel}>{item.isVeg ? 'Veg' : 'Non-Veg'}</Text>
                </View>
                <Switch 
                  value={item.isActive} 
                  onValueChange={(val) => toggleItem(item.id, val)}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  style={{ transform: [{ scale: 0.9 }] }}
                />
              </View>
            </View>

            <View style={styles.actionsCol}>
              <TouchableOpacity style={styles.iconBtn}>
                 <Text style={styles.iconTxt}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]}>
                 <Text style={styles.iconTxt}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Unsaved changes bar placeholder */}
      <View style={styles.footerBar}>
         <View style={{ flex: 1 }}>
            <Text style={styles.footerSub}>Unsaved changes</Text>
            <Text style={styles.footerTitle}>Menu item form ready</Text>
         </View>
         <View style={styles.footerBtns}>
            <TouchableOpacity style={styles.cancelBtn}>
               <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn}>
               <Text style={styles.saveBtnTxt}>Save</Text>
            </TouchableOpacity>
         </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
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
  headerSub: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
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
  tabsWrapper: { backgroundColor: Colors.white, paddingVertical: 12 },
  tabsContainer: { paddingHorizontal: 16, gap: 10 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  itemImg: { width: 72, height: 72, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  itemEmoji: { fontSize: 32 },
  itemInfo: { flex: 1, paddingHorizontal: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  itemName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  veg: { backgroundColor: '#16A34A' },
  nonVeg: { backgroundColor: '#DC2626' },
  itemDesc: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6, lineHeight: 16 },
  itemPrice: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vegLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vegDotSm: { width: 6, height: 6, borderRadius: 3 },
  vegLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  actionsCol: { gap: 12, justifyContent: 'center' },
  iconBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBtnDanger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  iconTxt: { fontSize: 12 },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    ...Shadow.lg,
  },
  footerSub: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  footerTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  footerBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  cancelBtnTxt: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.primary },
  saveBtnTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
