import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleIcon, AppleIcon, FacebookIcon } from '../../components/social-icons';

// ── Security helpers ──────────────────────────────────────────────────────────

/** Strip any HTML/script tags to prevent XSS in stored values */
function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email is too long'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(7, 'Enter a valid 10-digit phone number')
    .max(10, 'Phone number must be 10 digits'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

type LoginForm  = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;
type Tab = 'login' | 'signup';

/** Max submit attempts before a cooldown kicks in (brute-force protection) */
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS  = 30_000; // 30 seconds
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [tab, setTab]         = useState<Tab>('login');
  const [loading, setLoading] = useState(false);

  // Refs for focusing next inputs easily
  const loginPassRef = useRef<TextInput>(null);
  const signupEmailRef = useRef<TextInput>(null);
  const signupPhoneRef = useRef<TextInput>(null);
  const signupPassRef = useRef<TextInput>(null);

  const handleSocialLogin = async (provider: 'GOOGLE' | 'FACEBOOK') => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/social-login`, {
        provider,
        id: `${provider.toLowerCase()}_user_${Date.now()}`,
        email: `user_${provider.toLowerCase()}@khanago.com`,
        firstName: provider === 'GOOGLE' ? 'Google' : 'Facebook',
        lastName: 'User',
      });

      if (res.data?.accessToken) {
        router.replace('/(customer)');
      }
    } catch (err: any) {
      Alert.alert(
        `${provider} Auth`,
        err?.response?.data?.message || 'Social login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Brute-force rate limiting (client-side guard)
  const attemptCount = useRef(0);
  const cooldownUntil = useRef<number>(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);


  // ── react-hook-form for Login ───────────────────────────────────────────────
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  // ── react-hook-form for Signup ──────────────────────────────────────────────
  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { fullName: '', email: '', phone: '', password: '' },
  });

  // ── Tab switching (simple, reliable across platforms) ──────────────────────
  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
  };

  // ── Submission with rate-limit guard ────────────────────────────────────────
  const onLoginSubmit = async (data: LoginForm) => {
    if (!checkRateLimit()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: sanitize(data.email),
        password: data.password,
      });

      if (res.data?.requiresVerification) {
        router.push({
          pathname: '/auth/verify',
          params: { phone: res.data.phone, email: res.data.email },
        });
      } else if (res.data?.accessToken) {
        router.replace('/(customer)');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password.';
      Alert.alert('Login Failed', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupForm) => {
    if (!checkRateLimit()) return;
    setLoading(true);
    try {
      const nameParts = sanitize(data.fullName).split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      await axios.post(`${API_BASE}/auth/register`, {
        firstName,
        lastName,
        email: sanitize(data.email),
        phone: data.phone,
        password: data.password,
      });

      router.push({
        pathname: '/auth/verify',
        params: { phone: data.phone, email: data.email },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not create account.';
      Alert.alert('Registration Failed', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  function checkRateLimit(): boolean {
    const now = Date.now();
    if (now < cooldownUntil.current) return false;
    attemptCount.current += 1;
    if (attemptCount.current > MAX_ATTEMPTS) {
      cooldownUntil.current = now + COOLDOWN_MS;
      attemptCount.current = 0;
      let remaining = Math.ceil(COOLDOWN_MS / 1000);
      setCooldownLeft(remaining);
      const tick = setInterval(() => {
        remaining -= 1;
        setCooldownLeft(remaining);
        if (remaining <= 0) clearInterval(tick);
      }, 1000);
      return false;
    }
    return true;
  }

  const isCoolingDown = cooldownLeft > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Sign up or Login to your Account</Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggle}>
            <View style={[styles.pill, { left: tab === 'signup' ? '50%' : '0%' }]} pointerEvents="none" />
            <TouchableOpacity style={styles.toggleBtn} onPress={() => switchTab('login')} activeOpacity={0.8}>
              <Text style={[styles.toggleText, tab === 'login' && styles.toggleTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => switchTab('signup')} activeOpacity={0.8}>
              <Text style={[styles.toggleText, tab === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Rate-limit cooldown warning */}
          {isCoolingDown && (
            <View style={styles.rateLimitBanner}>
              <Text style={styles.rateLimitText}>
                Too many attempts. Please wait {cooldownLeft}s before trying again.
              </Text>
            </View>
          )}

          {/* Form Area */}
          <View style={styles.formArea}>
            {tab === 'login' ? (
              /* ── LOGIN FORM ── */
              <View style={styles.form}>
                <Text style={styles.label}>Email Address</Text>
                <Controller
                  control={loginForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <>
                      <View style={[styles.inputBox, fieldState.error && styles.inputError]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your Email"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="emailAddress"
                          value={field.value ?? ''}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          onSubmitEditing={() => loginPassRef.current?.focus()}
                          returnKeyType="next"
                        />
                      </View>
                      {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
                    </>
                  )}
                />

                <Text style={styles.label}>Password</Text>
                <Controller
                  control={loginForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <>
                      <View style={[styles.inputBox, fieldState.error && styles.inputError]}>
                        <TextInput
                          ref={loginPassRef}
                          style={styles.input}
                          placeholder="Enter your Password"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry
                          textContentType="password"
                          value={field.value ?? ''}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          onSubmitEditing={loginForm.handleSubmit(onLoginSubmit)}
                          returnKeyType="done"
                        />
                      </View>
                      {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
                    </>
                  )}
                />

                <TouchableOpacity style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <SocialSection label="Or Login Using:" onSocialLogin={handleSocialLogin} />
              </View>
            ) : (
              /* ── SIGNUP FORM ── */
              <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <Controller
                  control={signupForm.control}
                  name="fullName"
                  render={({ field, fieldState }) => (
                    <>
                      <View style={[styles.inputBox, fieldState.error && styles.inputError]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your Name"
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="words"
                          textContentType="name"
                          value={field.value ?? ''}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          onSubmitEditing={() => signupEmailRef.current?.focus()}
                          returnKeyType="next"
                        />
                      </View>
                      {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
                    </>
                  )}
                />

                <Text style={styles.label}>Email Address</Text>
                <Controller
                  control={signupForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <>
                      <View style={[styles.inputBox, fieldState.error && styles.inputError]}>
                        <TextInput
                          ref={signupEmailRef}
                          style={styles.input}
                          placeholder="Enter your Email"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="emailAddress"
                          value={field.value ?? ''}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          onSubmitEditing={() => signupPhoneRef.current?.focus()}
                          returnKeyType="next"
                        />
                      </View>
                      {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
                    </>
                  )}
                />

                <Text style={styles.label}>Phone Number</Text>
                <Controller
                  control={signupForm.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <>
                      <View style={[styles.phoneInputBox, fieldState.error && styles.inputError]}>
                        <Text style={styles.countryCode}>+977  ›</Text>
                        <View style={styles.phoneDivider} />
                        <TextInput
                          ref={signupPhoneRef}
                          style={styles.phoneInput}
                          placeholder="9800000000"
                          placeholderTextColor="#94A3B8"
                          keyboardType="number-pad"
                          maxLength={10}
                          textContentType="telephoneNumber"
                          value={field.value ?? ''}
                          onChangeText={(text) => field.onChange(text.replace(/[^0-9]/g, ''))}
                          onBlur={field.onBlur}
                          onSubmitEditing={() => signupPassRef.current?.focus()}
                          returnKeyType="next"
                        />
                      </View>
                      {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
                    </>
                  )}
                />

                <Text style={styles.label}>Create Password</Text>
                <Controller
                  control={signupForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <>
                      <View style={[styles.inputBox, fieldState.error && styles.inputError]}>
                        <TextInput
                          ref={signupPassRef}
                          style={styles.input}
                          placeholder="Min 8 chars, uppercase, number"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry
                          textContentType="newPassword"
                          value={field.value ?? ''}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          onSubmitEditing={signupForm.handleSubmit(onSignupSubmit)}
                          returnKeyType="done"
                        />
                      </View>
                      {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
                    </>
                  )}
                />

                <SocialSection label="Or Sign Up Using:" onSocialLogin={handleSocialLogin} />
              </View>
            )}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isCoolingDown && styles.actionBtnDisabled]}
            onPress={tab === 'login'
              ? loginForm.handleSubmit(onLoginSubmit)
              : signupForm.handleSubmit(onSignupSubmit)
            }
            activeOpacity={0.85}
            disabled={isCoolingDown}
          >
            <Text style={styles.actionBtnText}>
              {loading ? 'Please wait...' : isCoolingDown ? `Wait ${cooldownLeft}s` : tab === 'login' ? 'Login  ›' : 'Next  ›'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Shared social buttons section ─────────────────────────────────────────────
function SocialSection({
  label,
  onSocialLogin,
}: {
  label: string;
  onSocialLogin?: (provider: 'GOOGLE' | 'FACEBOOK') => void;
}) {
  return (
    <>
      <View style={styles.socialRow}>
        <Text style={styles.socialLabel}>{label}</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialButtons}>
        <SocialBtn
          icon={<GoogleIcon size={32} />}
          onPress={() => onSocialLogin?.('GOOGLE')}
        />
        <SocialBtn icon={<AppleIcon size={32} />} />
        <SocialBtn
          icon={<FacebookIcon size={32} />}
          onPress={() => onSocialLogin?.('FACEBOOK')}
        />
      </View>
    </>
  );
}

function SocialBtn({ icon, onPress }: { icon: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7} onPress={onPress}>
      {icon}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  header: { marginBottom: 28 },
  title: { fontSize: 36, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748B' },

  // Toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#FCE7F3',
    borderRadius: 50,
    padding: 4,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: '#F472B6',
    borderRadius: 50,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 50, zIndex: 1 },
  toggleText: { fontSize: 16, fontWeight: '600', color: '#F472B6' },
  toggleTextActive: { color: '#FFFFFF' },

  // Rate-limit banner
  rateLimitBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rateLimitText: { color: '#DC2626', fontSize: 13, fontWeight: '500', textAlign: 'center' },

  // Form Area
  formArea: { width: '100%' },
  form: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  
  inputBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    height: 52,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  phoneInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    height: 52,
    paddingLeft: 16,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  input: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E293B',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 14,
    marginLeft: 4,
  },
  countryCode: { fontSize: 15, color: '#1E293B', fontWeight: '600', marginRight: 8 },
  phoneDivider: { width: 1, height: 20, backgroundColor: '#CBD5E1', marginRight: 4 },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 24, marginTop: 4 },
  forgotText: { fontSize: 14, color: '#64748B', textDecorationLine: 'underline' },

  // Social
  socialRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 },
  socialLabel: { fontSize: 14, color: '#64748B', marginRight: 12 },
  divider: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  socialButtons: { flexDirection: 'row', gap: 16, marginBottom: 12, justifyContent: 'center' },
  socialBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  // CTA
  actionBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 30,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  actionBtnDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
  },
  actionBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
