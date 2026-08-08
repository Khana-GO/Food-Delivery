import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NEPAL_CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan'];

export default function AddressScreen() {
  const [selectedCity, setSelectedCity] = useState('Kathmandu');
  const [address, setAddress] = useState('Durbar Marg, House #45, Ward No. 1');
  const [landmark, setLandmark] = useState('Near Annapurna Hotel');
  const [tag, setTag] = useState('Home');

  const handleSave = () => {
    Alert.alert('Address Saved 🇳🇵', `Location updated: ${address}, ${selectedCity}`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Location (Nepal 🇳🇵)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map Header Box */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={42} color="#38BDF8" />
            <Text style={styles.mapTitle}>Kathmandu Valley Coverage Area</Text>
            <Text style={styles.mapSub}>Patan • Durbar Marg • Jhamsikhel • Thamel • Baneshwor</Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* Select City */}
          <Text style={styles.label}>Select City / Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
            {NEPAL_CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.cityChip, c === selectedCity && styles.cityChipSelected]}
                onPress={() => setSelectedCity(c)}
              >
                <Text style={[styles.cityText, c === selectedCity && styles.cityTextSelected]}>
                  🇳🇵 {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Street Address */}
          <Text style={styles.label}>Street Address &amp; Ward No.</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#F59E0B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g., Durbar Marg, House #45"
            />
          </View>

          {/* Landmark */}
          <Text style={styles.label}>Nearby Landmark (Required for Nepal Delivery)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="compass-outline" size={20} color="#38BDF8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g., Opposite Labim Mall, Near Bhatbhateni"
            />
          </View>

          {/* Label Tags */}
          <Text style={styles.label}>Save Address As</Text>
          <View style={styles.labelTags}>
            {['Home', 'Work', 'Other'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tag, tag === t && styles.tagActive]}
                onPress={() => setTag(t)}
              >
                <Text style={[styles.tagText, tag === t && styles.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Nepal Address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginLeft: 12 },
  content: { paddingBottom: 100 },

  mapContainer: {
    height: 180,
    backgroundColor: '#F0F9FF',
    marginBottom: 20,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mapTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  mapSub: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },

  form: { paddingHorizontal: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginTop: 14, marginBottom: 8 },

  cityScroll: { gap: 8, marginBottom: 4 },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cityChipSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  cityText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  cityTextSelected: { color: '#FFFFFF' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1E293B' },

  labelTags: { flexDirection: 'row', gap: 10 },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  tagActive: { backgroundColor: '#1E293B' },
  tagText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tagTextActive: { color: '#FFFFFF' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#1E293B',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
