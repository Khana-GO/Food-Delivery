import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function BecomeDriverScreen() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Become a Driver</Text>
          <Text style={styles.headerSub}>Join KhanaGo as a delivery partner and start earning</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          
          {/* Status Banner */}
          <View style={styles.statusBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Application Status</Text>
              <Text style={styles.statusText}>Your profile is currently being reviewed by our team.</Text>
            </View>
            <Badge label="Under Review" variant="warning" />
          </View>

          {/* Form Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.sectionSub}>Tell us who you are.</Text>
            <Input label="Full Name" placeholder="Enter your full name" leftIcon={<Text>👤</Text>} />
            <Input label="Phone Number" placeholder="Enter your phone number" leftIcon={<Text>📞</Text>} />
            <Input label="Email" placeholder="Enter your email address" leftIcon={<Text>✉️</Text>} />
            <Input label="Date of Birth" placeholder="DD / MM / YYYY" leftIcon={<Text>📅</Text>} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <Text style={styles.sectionSub}>Choose your vehicle and add registration details.</Text>
            <View style={styles.vehicleTypeTabs}>
               <View style={[styles.vehicleTab, styles.vehicleTabActive]}>
                  <Text style={styles.vehicleEmoji}>🏍️</Text>
                  <Text style={styles.vehicleTabTextActive}>Motorbike</Text>
               </View>
               <View style={styles.vehicleTab}>
                  <Text style={styles.vehicleEmoji}>🚲</Text>
                  <Text style={styles.vehicleTabText}>Bicycle</Text>
               </View>
               <View style={styles.vehicleTab}>
                  <Text style={styles.vehicleEmoji}>🚗</Text>
                  <Text style={styles.vehicleTabText}>Car</Text>
               </View>
            </View>
            <Input label="Vehicle Number" placeholder="Enter vehicle number" />
            <Text style={styles.uploadLabel}>Vehicle Registration</Text>
            <TouchableOpacity style={styles.uploadArea}>
              <View style={styles.uploadIconBg}>
                <Text style={{ fontSize: 16 }}>📤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadMainText}>Upload registration document</Text>
                <Text style={styles.uploadSubText}>PDF, JPG, or PNG up to 10MB</Text>
              </View>
              <View style={styles.uploadBtnSm}><Text style={styles.uploadBtnSmText}>Upload</Text></View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Upload</Text>
            <Text style={styles.sectionSub}>Complete all required documents to continue.</Text>
            
            <View style={styles.docRow}>
               <View style={styles.docIconBg}><Text>📸</Text></View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.docName}>Driving License</Text>
                 <Text style={styles.docDesc}>Front and back images</Text>
               </View>
               <Text style={styles.docStatusDone}>✓ Uploaded</Text>
            </View>

            <View style={styles.docRow}>
               <View style={styles.docIconBg}><Text>📸</Text></View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.docName}>National ID / Citizenship</Text>
                 <Text style={styles.docDesc}>Government issued identity proof</Text>
               </View>
               <View style={styles.uploadBtnSm}><Text style={styles.uploadBtnSmText}>Upload Document</Text></View>
            </View>

            <View style={styles.docRow}>
               <View style={styles.docIconBg}><Text>📸</Text></View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.docName}>Vehicle Insurance</Text>
                 <Text style={styles.docDesc}>Valid insurance certificate</Text>
               </View>
               <View style={styles.uploadBtnSm}><Text style={styles.uploadBtnSmText}>Upload Document</Text></View>
            </View>

             <View style={styles.docRow}>
               <View style={styles.docIconBg}><Text>👤</Text></View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.docName}>Profile Photo</Text>
                 <Text style={styles.docDesc}>Clear face photo for verification</Text>
               </View>
               <View style={styles.uploadBtnSm}><Text style={styles.uploadBtnSmText}>Upload Document</Text></View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank / Payment Details</Text>
            <Text style={styles.sectionSub}>Where should we send your earnings?</Text>
            <Input label="Bank Name" placeholder="Enter bank name" />
            <Input label="Account Number" placeholder="Enter account number" />
            <Input label="Account Holder Name" placeholder="Enter account holder name" />
          </View>

          <View style={[styles.section, styles.termsSection]}>
             <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
               <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                 {agreed && <Text style={styles.checkmark}>✓</Text>}
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.termsBold}>I agree to the Terms & Conditions</Text>
                  <Text style={styles.termsDesc}>By submitting, you confirm that all information provided is accurate.</Text>
               </View>
             </TouchableOpacity>
          </View>

          <Button 
             label="Submit Application"
             fullWidth 
             disabled={!agreed}
             style={{ marginBottom: 40 }}
          />

        </ScrollView>
      </KeyboardAvoidingView>
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  headerSub: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  placeholder: { width: 38 },
  container: { flex: 1 },
  scrollArea: { padding: 16 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#B45309', marginBottom: 4 },
  statusText: { fontSize: 12, color: '#B45309' },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  vehicleTypeTabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  vehicleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  vehicleTabActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  vehicleEmoji: { fontSize: 16 },
  vehicleTabText: { fontSize: 13, fontWeight: '600', color: Colors.textMedium },
  vehicleTabTextActive: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark },
  uploadLabel: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 6 },
  uploadArea: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: 12,
    gap: 12,
  },
  uploadIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadMainText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  uploadSubText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  uploadBtnSm: { backgroundColor: Colors.backgroundAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  uploadBtnSmText: { fontSize: 11, fontWeight: '600', color: Colors.textDark },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  docIconBg: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  docDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  docStatusDone: { fontSize: 12, fontWeight: '600', color: Colors.success },
  termsSection: { padding: 12 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  termsBold: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  termsDesc: { fontSize: 11, color: Colors.textSecondary },
});
