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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
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
    try {
      const apiUrl = Platform.OS === 'web' 
        ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
        : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';
      
      const fullPhone = `+977${phone}`;
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        setPhoneError(data.message || 'Login failed');
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
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.headerContainer}>
            <Image 
              source={require('../../../assets/images/app_logo.png')} 
              style={styles.logoBadge} 
            />
            <Text style={styles.headerTitle}>KhanaGo</Text>
            <Text style={styles.headerSubtitle}>Welcome back! Please login to continue.</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Phone Number"
              placeholder="e.g. 9800000000"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setPhoneError('');
              }}
              keyboardType="phone-pad"
              error={phoneError}
              leftIcon={<Text style={styles.countryCode}>+977</Text>}
            />

            <Button 
              label="Continue" 
              onPress={handleLogin} 
              loading={loading}
              fullWidth
              style={styles.loginBtn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to KhanaGo? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
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
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPrompt: { fontSize: 15, color: Colors.textSecondary },
  signupLink: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
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
