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
import { Colors, Radius, Spacing } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
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

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    // Simulate API call to send OTP
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    // Navigate to OTP screen
    router.push('/auth/otp' as any);
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
          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your phone number to continue.</Text>

            <View style={styles.fields}>
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

            <Button
              label="Continue"
              onPress={handleContinue}
              loading={loading}
              fullWidth
              style={styles.continueBtn}
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

            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/register' as any)}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  logoSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  logoEmoji: { fontSize: 30 },
  appName: { fontSize: 26, marginBottom: 4 },
  appNameBlack: { color: Colors.textDark, fontWeight: '800' },
  appNameOrange: { color: Colors.primary, fontWeight: '800' },
  appTagline: { fontSize: 14, color: Colors.textSecondary },
  form: {},
  title: { fontSize: 26, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  fields: { gap: 4, marginBottom: 8 },
  continueBtn: { marginTop: 12, marginBottom: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textSecondary },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
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
    backgroundColor: Colors.white,
  },
  socialIcon: { fontSize: 16, fontWeight: '700' },
  socialText: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPrompt: { fontSize: 14, color: Colors.textSecondary },
  signupLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
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
    resizeMode: 'contain',
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
