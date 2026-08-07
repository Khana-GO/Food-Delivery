import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddressScreen() {
  const [address, setAddress] = useState('10565 Bramlea Road, Brampton, ON');
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Location</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color="#CBD5E1" />
            <Text style={styles.mapText}>Map View</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Delivery Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#F59E0B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
            />
          </View>

          <Text style={styles.label}>Address Label (Optional)</Text>
          <View style={styles.labelTags}>
            {['Home', 'Work', 'Other'].map((tag) => (
              <TouchableOpacity key={tag} style={[styles.tag, tag === 'Home' && styles.tagActive]}>
                <Text style={[styles.tagText, tag === 'Home' && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
          <Text style={styles.saveText}>Save Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backText: { fontSize: 15, color: '#1E293B', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: '#1E293B' },
  content: { paddingBottom: 100 },
  
  mapContainer: {
    height: 240,
    backgroundColor: '#F8FAFC',
    marginBottom: 24,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mapText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  
  form: { paddingHorizontal: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1E293B' },
  
  labelTags: { flexDirection: 'row', gap: 12 },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tagActive: { backgroundColor: '#1E293B' },
  tagText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tagTextActive: { color: '#FFFFFF' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#38BDF8',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
