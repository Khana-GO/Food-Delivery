import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function PhoneVerificationScreen() {
  const { phone, email } = useLocalSearchParams<{ phone?: string; email?: string }>();
  const { width } = useWindowDimensions();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [resendSec, setResendSec] = useState(RESEND_COOLDOWN);
  const inputs = useRef<Array<TextInput | null>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown for resend button
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setResendSec((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleDigitChange = useCallback((text: string, idx: number) => {
    // Accept only digits; handle paste of full OTP
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length > 1) {
      // User pasted the full code — fill all boxes
      const pasted = cleaned.slice(0, OTP_LENGTH).split('');
      setDigits([...pasted, ...Array(OTP_LENGTH - pasted.length).fill('')]);
      inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    setError('');
    const newDigits = [...digits];
    newDigits[idx] = cleaned;
    setDigits(newDigits);

    if (cleaned && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  }, [digits]);

  const handleKeyPress = useCallback((key: string, idx: number) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      const newDigits = [...digits];
      newDigits[idx - 1] = '';
      setDigits(newDigits);
      inputs.current[idx - 1]?.focus();
    }
  }, [digits]);

  const otp = digits.join('');
  const isFull = otp.length === OTP_LENGTH;

  // ── Call the real API ───────────────────────────────────────────────────────
  const onVerify = async () => {
    if (!isFull || loading) return;
    if (!phone && !email) { setError('Account detail missing. Please go back and try again.'); return; }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE}/auth/verify-otp`, { phone, email, otp });
      router.replace('/(customer)');
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ??
        'Invalid or expired code. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
      // Clear the boxes so user can re-enter
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const onResend = async () => {
    if (resendSec > 0 || (!phone && !email)) return;
    try {
      await axios.post(`${API_BASE}/auth/login`, { phone, email });
      // Reset countdown
      setResendSec(RESEND_COOLDOWN);
      timerRef.current = setInterval(() => {
        setResendSec((s) => {
          if (s <= 1) { clearInterval(timerRef.current!); return 0; }
          return s - 1;
        });
      }, 1000);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      inputs.current[0]?.focus();
    } catch {
      setError('Could not resend code. Please try again.');
    }
  };

  const boxSize = Math.min((width - 48 - (OTP_LENGTH - 1) * 10) / OTP_LENGTH, 56);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to your email address.{'\n'}
            Enter it below — it's valid for 10 minutes.
          </Text>

          {/* OTP boxes */}
          <View style={styles.boxRow}>
            {digits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(el) => { inputs.current[idx] = el; }}
                style={[
                  styles.box,
                  { width: boxSize, height: boxSize },
                  digit ? styles.boxFilled : null,
                  error ? styles.boxError : null,
                ]}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH} // allow paste
                value={digit}
                onChangeText={(t) => handleDigitChange(t, idx)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          {/* Inline error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive it? </Text>
            <TouchableOpacity onPress={onResend} disabled={resendSec > 0}>
              <Text style={[styles.resendLink, resendSec > 0 && styles.resendDisabled]}>
                {resendSec > 0 ? `Resend in ${resendSec}s` : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verify button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.verifyBtn, isFull && !loading ? styles.verifyBtnActive : null]}
            onPress={onVerify}
            disabled={!isFull || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.verifyText}>
                  {isFull ? 'Verify  ›' : `Enter all ${OTP_LENGTH} digits`}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  backText: { fontSize: 15, color: '#1E293B', fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22, marginBottom: 40 },

  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  boxFilled: {
    borderColor: '#38BDF8',
    backgroundColor: '#FFFFFF',
    // subtle glow
    boxShadow: '0 0 0 3px rgba(56,189,248,0.15)',
  } as any,
  boxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },

  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  resendLabel: { fontSize: 14, color: '#6B7280' },
  resendLink: { fontSize: 14, color: '#38BDF8', fontWeight: '700' },
  resendDisabled: { color: '#94A3B8' },

  footer: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 },
  verifyBtn: {
    backgroundColor: '#E2E8F0',
    height: 58,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnActive: {
    backgroundColor: '#38BDF8',
    boxShadow: '0 4px 12px rgba(56,189,248,0.35)',
  } as any,
  verifyText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
