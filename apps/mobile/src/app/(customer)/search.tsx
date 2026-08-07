import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const RECENT = [
  {
    id: '1',
    type: 'food',
    name: 'BBQ Chicken Burger',
    sub: 'KFC',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&auto=format&fit=crop',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/100px-KFC_logo.svg.png',
  },
  {
    id: '2',
    type: 'restaurant',
    name: 'KFC',
    sub: '10565 Bramlea Road, Brampton, ON',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/100px-KFC_logo.svg.png',
  },
  {
    id: '3',
    type: 'restaurant',
    name: "McDonald's",
    sub: '18915 Queens Road, Brampton, ON',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/100px-McDonald%27s_Golden_Arches.svg.png',
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <Text style={styles.title}>Search</Text>
              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons name="options" size={16} color="#F472B6" />
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Food, Restaurants etc."
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>

          {/* Recently Searched */}
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recently Searched</Text>
              <TouchableOpacity>
                <Text style={styles.clearAll}>CLEAR ALL</Text>
              </TouchableOpacity>
            </View>

            {RECENT.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.resultRow}
                onPress={() => router.push('/(customer)/restaurant' as any)}
              >
                {item.type === 'food' ? (
                  <Image source={{ uri: item.image }} style={styles.foodThumb} />
                ) : (
                  <View style={styles.logoCircle}>
                    <Image source={{ uri: item.logo }} style={styles.logoImg} resizeMode="contain" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  {item.type === 'food' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Image source={{ uri: item.logo }} style={{ width: 16, height: 16, borderRadius: 8 }} />
                      <Text style={styles.resultSub}>{item.sub}</Text>
                    </View>
                  ) : (
                    <Text style={styles.resultSub} numberOfLines={1}>{item.sub}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#1E293B" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backText: { fontSize: 15, color: '#1E293B', marginBottom: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 30, fontWeight: '800', color: '#1E293B' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterText: { fontSize: 14, fontWeight: '700', color: '#F472B6' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recentTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  clearAll: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  foodThumb: { width: 56, height: 56, borderRadius: 10 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: 36, height: 36 },
  resultName: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  resultSub: { fontSize: 13, color: '#94A3B8' },
});
