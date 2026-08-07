import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const ALL_CATEGORIES = [
  { id: '1', name: 'Burgers', emoji: '🍔' },
  { id: '2', name: 'Grocery', emoji: '🛍️' },
  { id: '3', name: 'Salads', emoji: '🥗' },
  { id: '4', name: 'Sweets', emoji: '🍩' },
  { id: '5', name: 'Utensils', emoji: '🫖', isNew: true },
  { id: '6', name: 'Pizza', emoji: '🍕' },
  { id: '7', name: 'Mexican', emoji: '🌮' },
  { id: '8', name: 'Sushi', emoji: '🍣' },
  { id: '9', name: 'Healthy', emoji: '🥑' },
  { id: '10', name: 'Coffee', emoji: '☕' },
  { id: '11', name: 'Deserts', emoji: '🍰' },
  { id: '12', name: 'Fast Food', emoji: '🍟' },
];

export default function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Categories</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
        <View style={styles.grid}>
          {ALL_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => router.push('/(customer)/search' as any)}>
              <View style={styles.categoryCircle}>
                {cat.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                <Text style={styles.emojiText}>{cat.emoji}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backText: { fontSize: 15, color: '#1E293B', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: '#1E293B' },
  
  gridContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 32,
  },
  
  categoryItem: {
    width: (width - 64) / 3, // 3 columns with padding
    alignItems: 'center',
  },
  categoryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emojiText: {
    fontSize: 36,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F472B6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
