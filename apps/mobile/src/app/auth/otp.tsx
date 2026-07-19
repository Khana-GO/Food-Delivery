import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function OTPScreen() {
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';
  const { login } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text.length === 1 && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      setError('Please enter the full 4-digit code.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const apiUrl = Platform.OS === 'web' 
        ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
        : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';
      
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Verification failed');
        setLoading(false);
        return;
      }
      
      // Save the user data to context
      login(data.user);
      
      // On success, navigate to dashboard
      router.replace('/(customer)' as any);
    } catch (e) {
      setError('Network error. Is the backend running?');
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
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Verify Phone</Text>
            <Text style={styles.subtitle}>
              Code sent to <Text style={styles.boldText}>{phone || '+977 9800000000'}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  error ? styles.otpInputError : null
                ]}
                value={digit}
                onChangeText={(text) => handleChangeText(text.replace(/[^0-9]/g, ''), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />

          <Button
            label="Verify"
            onPress={handleVerify}
            loading={loading}
            fullWidth
            style={styles.verifyBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backIcon: { fontSize: 24, color: Colors.textDark, marginTop: -4 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  boldText: { fontWeight: '700', color: Colors.textDark },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 65,
    height: 65,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  otpInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  resendText: { fontSize: 15, color: Colors.textSecondary },
  resendLink: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  spacer: { flex: 1, minHeight: 40 },
  verifyBtn: { marginBottom: 20 },
});
