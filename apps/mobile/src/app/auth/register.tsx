import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterScreen() {
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
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>🍜</Text>
            </View>
            <Text style={styles.appName}>
              <Text style={styles.appNameBlack}>Khana</Text>
              <Text style={styles.appNameOrange}>Go</Text>
            </Text>
            <Text style={styles.appTagline}>Delicious Food, Delivered Fast.</Text>
          </View>

          {/* Form */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join KhanaGo and start ordering your favourites.
          </Text>

          <View style={styles.fields}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
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
              &amp;
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <Button
            label="Continue"
            onPress={handleSignUp}
            loading={loading}
            disabled={!agreed}
            fullWidth
            style={styles.signUpBtn}
          />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  logoSection: { alignItems: 'center', paddingTop: 28, paddingBottom: 20 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 26 },
  appName: { fontSize: 22, marginBottom: 3 },
  appNameBlack: { color: Colors.textDark, fontWeight: '800' },
  appNameOrange: { color: Colors.primary, fontWeight: '800' },
  appTagline: { fontSize: 13, color: Colors.textSecondary },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  fields: { gap: 4 },
  icon: { fontSize: 16 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  termsText: { fontSize: 13, color: Colors.textSecondary, flex: 1, flexWrap: 'wrap' },
  termsLink: { color: Colors.textDark, fontWeight: '700' },
  signUpBtn: { marginBottom: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textSecondary },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  socialIcon: { fontSize: 16, fontWeight: '700' },
  socialText: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginPrompt: { fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  countryFlagImg: {
    width: 20,
    height: 14,
    marginRight: 6,
    borderRadius: 2,
    marginLeft: 4,
  },
  countryCode: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textDark,
  },
  verticalDivider: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB', // light gray
    marginLeft: 10,
    borderRadius: 2,
  },
});
