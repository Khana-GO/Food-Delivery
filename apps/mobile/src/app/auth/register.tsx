import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
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
            <Text style={styles.headerSubtitle}>Join KhanaGo and discover your next favorite meal.</Text>
          </View>

          <View style={styles.formContainer}>
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
                onChangeText={(text) => {
                  setPhone(text);
                  setPhoneError('');
                }}
                error={phoneError}
                keyboardType="phone-pad"
                leftIcon={<Text style={styles.countryCode}>+977</Text>}
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

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
                <Text style={styles.footerLink}>Log In</Text>
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
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  fields: {
    gap: 16,
  },
  icon: { fontSize: 16 },
  countryCode: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginRight: 8,
  },
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
  signUpBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
