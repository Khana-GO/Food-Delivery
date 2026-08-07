import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function PhoneVerificationScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onVerify = () => {
    router.replace('/(customer)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Phone Verification</Text>
          <Text style={styles.subtitle}>
            Enter your OTP code here
          </Text>

          <View style={styles.codeContainer}>
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(el) => (inputs.current[idx] = el)}
                style={[styles.codeInput, digit ? styles.codeInputActive : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, idx)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !digit && idx > 0) {
                    inputs.current[idx - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>

          <Text style={styles.resendText}>
            Didn't receive code? <Text style={styles.resendLink}>Resend again</Text>
          </Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.verifyBtn, code.join('').length === 4 ? styles.verifyBtnActive : null]}
            onPress={onVerify}
            disabled={code.join('').length !== 4}
          >
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backText: { fontSize: 15, color: '#1E293B' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 30, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 32 },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  codeInput: {
    flex: 1,
    height: 72,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  codeInputActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#FFFFFF',
  },
  resendText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
  },
  resendLink: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  verifyBtn: {
    backgroundColor: '#E2E8F0',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnActive: {
    backgroundColor: '#38BDF8',
  },
  verifyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
