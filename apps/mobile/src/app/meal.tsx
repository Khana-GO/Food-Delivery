import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ADDONS = [
  { id: '1', name: 'Side Item', required: true },
  { id: '2', name: 'Drinks', required: true },
  { id: '3', name: 'Edit Cheeseburger', required: false },
];

export default function MealScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Floating top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.topBtn}>
            <Text style={{ fontSize: 18, color: '#64748B' }}>···</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn}>
            <Ionicons name="bag-outline" size={18} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Food hero image */}
        <View style={styles.heroBox}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop' }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mealTitle}>Western BBQ{'\n'}Cheeseburger Meal</Text>
          <Text style={styles.calories}>340–400 Cals  ⓘ</Text>
        </View>

        {/* Add-on rows */}
        {ADDONS.map((addon) => (
          <View key={addon.id} style={styles.addonRow}>
            <Text style={styles.addonName}>{addon.name}</Text>
            {addon.required ? (
              <Text style={styles.requiredLabel}>REQUIRED</Text>
            ) : null}
            <TouchableOpacity style={styles.plusBtn}>
              <Ionicons name="add" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.heartBtn}>
          <Ionicons name="heart-outline" size={22} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToBagBtn}>
          <Ionicons name="bag-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.addToBagText}>Add to Bag</Text>
          <Text style={styles.addToBagPrice}>  $6.69</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backText: { fontSize: 15, fontWeight: '600', color: '#1E293B', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  topRight: { flexDirection: 'row', gap: 8 },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBox: {
    height: 280,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 80,
  },
  heroImage: { width: '80%', height: 240 },
  titleSection: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  mealTitle: { fontSize: 30, fontWeight: '800', color: '#1E293B', lineHeight: 38, marginBottom: 8 },
  calories: { fontSize: 13, color: '#94A3B8' },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  addonName: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1 },
  requiredLabel: { fontSize: 11, fontWeight: '700', color: '#22C55E', marginRight: 12 },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  heartBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToBagBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    height: 54,
    borderRadius: 30,
  },
  addToBagText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  addToBagPrice: { fontSize: 16, fontWeight: '700', color: '#38BDF8' },
});
