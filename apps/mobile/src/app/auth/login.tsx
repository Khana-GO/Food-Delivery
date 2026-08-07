import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  useWindowDimensions,
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
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long'),
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

const ANIM_DURATION = 220;
/** Max submit attempts before a cooldown kicks in (brute-force protection) */
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS  = 30_000; // 30 seconds
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const [tab, setTab]         = useState<Tab>('login');
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider: 'GOOGLE' | 'FACEBOOK') => {
    setLoading(true);
    try {
      // Sends social authentication payload to backend which creates/fetches user & stores in PostgreSQL DB
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

  // Animated values
  const slideX  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const pillX   = useRef(new Animated.Value(0)).current;

  // ── react-hook-form for Login ───────────────────────────────────────────────
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  // ── react-hook-form for Signup ──────────────────────────────────────────────
  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
    defaultValues: { fullName: '', email: '', phone: '', password: '' },
  });

  // ── Tab animation ───────────────────────────────────────────────────────────
  const switchTab = useCallback(
    (next: Tab) => {
      if (next === tab) return;
      const goingRight = next === 'signup';
      Animated.parallel([
        Animated.timing(slideX, { toValue: goingRight ? -width * 0.15 : width * 0.15, duration: ANIM_DURATION, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
      ]).start(() => {
        setTab(next);
        slideX.setValue(goingRight ? width * 0.15 : -width * 0.15);
        Animated.parallel([
          Animated.timing(slideX, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: true }),
        ]).start();
      });
      Animated.timing(pillX, { toValue: goingRight ? 1 : 0, duration: ANIM_DURATION, useNativeDriver: false }).start();
    },
    [tab, width, slideX, opacity, pillX]
  );

  // ── Submission with rate-limit guard ────────────────────────────────────────
  const onLoginSubmit = async (data: LoginForm) => {
    if (!checkRateLimit()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: data.email,
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
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      const res = await axios.post(`${API_BASE}/auth/register`, {
        firstName,
        lastName,
        email: data.email,
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
    if (now < cooldownUntil.current) return false; // still in cooldown
    attemptCount.current += 1;
    if (attemptCount.current > MAX_ATTEMPTS) {
      cooldownUntil.current = now + COOLDOWN_MS;
      attemptCount.current = 0;
      // Show countdown
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

  const pillTranslate = pillX.interpolate({ inputRange: [0, 1], outputRange: ['0%', '50%'] });

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

          {/* Animated Toggle */}
          <View style={styles.toggle}>
            <Animated.View style={[styles.pill, { left: pillTranslate }]} />
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

          {/* Animated Form Area */}
          <Animated.View style={{ transform: [{ translateX: slideX }], opacity }}>

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
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
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
                          style={styles.input}
                          placeholder="Enter your Password"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry
                          textContentType="password"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
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
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
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
                          style={styles.input}
                          placeholder="Enter your Email"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="emailAddress"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
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
                      <View style={[styles.inputBox, fieldState.error && styles.inputError]}>
                        <Text style={styles.countryCode}>+977  ›</Text>
                        <View style={styles.phoneDivider} />
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="9800000000"
                          placeholderTextColor="#94A3B8"
                          keyboardType="phone-pad"
                          textContentType="telephoneNumber"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
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
                          style={styles.input}
                          placeholder="Min 8 chars, uppercase, number"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry
                          textContentType="newPassword"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </View>
                      {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
                    </>
                  )}
                />

                <SocialSection label="Or Sign Up Using:" onSocialLogin={handleSocialLogin} />
              </View>
            )}
          </Animated.View>

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

  // Form
  form: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  input: { flex: 1, fontSize: 15, color: '#1E293B' },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 14,
    marginLeft: 4,
  },
  countryCode: { fontSize: 15, color: '#1E293B', fontWeight: '600', marginRight: 8 },
  phoneDivider: { width: 1, height: 20, backgroundColor: '#CBD5E1', marginRight: 12 },
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
    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)',
  } as any,
  actionBtnDisabled: {
    backgroundColor: '#94A3B8',
    boxShadow: 'none',
  } as any,
  actionBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
