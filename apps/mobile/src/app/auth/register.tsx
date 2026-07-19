import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.35;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    if (phone.length < 7) {
      setPhoneError('Please enter a valid phone number.');
      valid = false;
    } else {
      setPhoneError('');
    }
    return valid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      const apiUrl = Platform.OS === 'web' 
        ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
        : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';
      
      const fullPhone = `+977${phone}`;
      
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'NA';
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName,
          lastName,
          phone: fullPhone 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        setPhoneError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push({ pathname: '/auth/otp', params: { phone: fullPhone } } as any);
    } catch (e) {
      setPhoneError('Network error. Is the backend running?');
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.screen}>
      {/* Solid Color Header */}
      <View style={[styles.headerContainer, { backgroundColor: Colors.primary }]}>
        <View style={[styles.headerOverlay, { paddingTop: Math.max(insets.top, 20) }]}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🍔</Text>
          </View>
          <Text style={styles.headerTitle}>KhanaGo</Text>
          <Text style={styles.headerSubtitle}>Craving something? We've got it.</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Overlapping Card */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join KhanaGo and discover your next favorite meal.
            </Text>

            <View style={styles.fields}>
              <Input
                label="Full Name"
                placeholder="Anish Shrestha"
                value={fullName}
                onChangeText={setFullName}
                leftIcon={<Text style={styles.icon}>👤</Text>}
              />

              <Input
                label="Mobile Number"
                placeholder="9800000000"
                value={phone}
                onChangeText={setPhone}
                error={phoneError}
                keyboardType="phone-pad"
                leftIcon={
                  <View style={styles.countryCodeContainer}>
                    <Image source={{ uri: 'https://flagcdn.com/w40/np.png' }} style={styles.countryFlagImg} resizeMode="contain" />
                    <Text style={styles.countryCode}>+977</Text>
                    <View style={styles.verticalDivider} />
                  </View>
                }
              />
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms</Text>
                &nbsp;&amp;&nbsp;
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button
              label="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              disabled={!agreed}
              fullWidth
              style={styles.signUpBtn}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  headerContainer: {
    width: '100%',
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerImg: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoBadge: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoEmoji: { fontSize: 24 },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: HEADER_HEIGHT - 30, // Overlap effect
  },
  formCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
    ...Platform.select({
      web: {
        boxShadow: '0px -10px 30px rgba(0,0,0,0.1)' as any,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
      },
    }),
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28, lineHeight: 22 },
  fields: { gap: 8 },
  icon: { fontSize: 16 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  termsText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  termsLink: { color: Colors.textDark, fontWeight: '700' },
  signUpBtn: { marginBottom: 24 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  dividerText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  socialRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialIcon: { fontSize: 18, fontWeight: '700' },
  socialText: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginPrompt: { fontSize: 15, color: Colors.textSecondary },
  loginLink: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  countryFlagImg: {
    width: 22,
    height: 16,
    marginRight: 6,
    borderRadius: 2,
    marginLeft: 4,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  verticalDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginLeft: 10,
    borderRadius: 2,
  },
});
