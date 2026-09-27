import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/owner/user/user.service';
import { getApiErrorMessage } from '@/lib/api-error';
import { sanitizePhone, validatePhone, PHONE_LENGTH } from '@/lib/phone';
import { goBack } from '@/lib/navigation';
import PremiumCard from '@/components/ui/PremiumCard';
import Button from '@/components/ui/Button';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { Colors, Radius, Shadow } from '@/constants/theme';

/**
 * Dedicated "add your mobile number" flow.
 *
 * Reached when a customer signs in with Google (accounts are created without a
 * phone number) and whenever ordering is blocked because the account has none.
 * `source` controls whether skipping is allowed — a fresh Google sign-in may
 * continue browsing, but a blocked checkout cannot proceed without a number.
 */
export default function AddPhoneScreen() {
  const { user, setUser } = useAuth();
  const params = useLocalSearchParams<{ source?: string; redirect?: string }>();
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState(user?.phone ?? '');
  const [error, setError] = useState<string | undefined>(undefined);

  const source = params?.source;
  const isCheckoutBlock = source === 'checkout' || source === 'cart';
  // Post-Google-login the number is recommended, not mandatory yet.
  const canSkip = source === 'google';

  const savePhone = useMutation({
    mutationFn: (value: string) => userService.updateProfile({ phone: value }),
    onSuccess: (updated) => {
      // The interceptor may unwrap or keep the envelope — handle both.
      const next = (updated as any)?.user ?? updated;
      if (next) setUser(next);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(err, '');
      if (/already (registered|taken)|phone number already/i.test(message)) {
        setError('That number is already linked to another account.');
        return;
      }
      if (/valid phone/i.test(message)) {
        setError('Enter a valid 10-digit mobile number that does not start with 0.');
        return;
      }
      setError(message || 'Could not save your number. Please try again.');
    },
  });

  const finish = useCallback(
    (mode: 'saved' | 'skipped') => {
      // The number is only optional right after a Google sign-in. Anywhere else
      // (cart, checkout, profile) the number is what unblocks ordering, so
      // leaving must return the customer to wherever they came from.
      if (mode === 'skipped' && !canSkip) {
        goBack('/(customer)/checkout');
        return;
      }

      const target = params?.redirect;
      if (target) {
        router.replace(target as any);
        return;
      }

      if (mode === 'saved') {
        goBack('/(customer)/(tabs)');
        return;
      }

      router.replace('/(customer)' as any);
    },
    [canSkip, params],
  );

  const handleSave = useCallback(() => {
    const message = validatePhone(phone);
    if (message) {
      setError(message);
      return;
    }
    setError(undefined);
    savePhone.mutate(phone.trim(), { onSuccess: () => finish('saved') });
  }, [finish, phone, savePhone]);

  const handleChange = useCallback((value: string) => {
    setError(undefined);
    setPhone(sanitizePhone(value));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => finish('skipped')}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Phone Number</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedPage slide>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Feather name="phone" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.heroTitle}>
                {isCheckoutBlock
                  ? 'One step before you order'
                  : 'Add your mobile number'}
              </Text>
              <Text style={styles.heroDesc}>
                {isCheckoutBlock
                  ? 'We could not place your order because your account has no mobile number yet. Add it to continue — it only takes a few seconds.'
                  : source === 'google'
                    ? 'You signed in with Google, so we do not have a phone number for you yet. Add one so restaurants and riders can reach you about your orders.'
                    : 'Your account has no mobile number yet. Add one so the restaurant and your rider can reach you when the order arrives.'}
              </Text>
            </View>

            <PremiumCard style={{ marginTop: 14 } as any}>
              <Text style={styles.sectionTitle}>Mobile number</Text>
              <Text style={styles.sectionHint}>
                The rider calls this number when they arrive.
              </Text>

              <View style={[styles.inputWrap, !!error && styles.inputError]}>
                <Feather name="phone" size={15} color="#94A3B8" />
                <TextInput
                  value={phone}
                  onChangeText={handleChange}
                  placeholder="98XXXXXXXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  maxLength={PHONE_LENGTH}
                  selectionColor="rgba(15,23,42,0.16)"
                  cursorColor="#334155"
                  style={styles.input}
                  autoFocus={!user?.phone}
                />
                {phone.length === PHONE_LENGTH && !error ? (
                  <Feather name="check-circle" size={16} color={Colors.success} />
                ) : null}
              </View>
              {error ? (
                <Text style={styles.error}>{error}</Text>
              ) : (
                <Text style={styles.hint}>
                  Must be exactly {PHONE_LENGTH} digits and cannot start with 0
                </Text>
              )}
            </PremiumCard>

            <View style={{ marginTop: 16 }}>
              <Button
                label={savePhone.isPending ? 'Saving...' : 'Save and continue'}
                onPress={handleSave}
                loading={savePhone.isPending}
                fullWidth
                size="lg"
                leftIcon={<Feather name="check" size={16} color={Colors.white} />}
              />
              {canSkip ? (
                <TouchableOpacity
                  onPress={() => finish('skipped')}
                  activeOpacity={0.7}
                  style={styles.skipBtn}
                >
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.footer}>
              Your number is only used for order updates and delivery support.
            </Text>
          </AnimatedPage>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    ...Shadow.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
  hero: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: Radius['2xl'],
    padding: 18,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  heroDesc: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.2 },
  sectionHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    height: 52,
  },
  inputError: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  input: { flex: 1, fontSize: 16, color: Colors.textDark, paddingVertical: 0, fontWeight: '600', letterSpacing: 1 },
  error: { fontSize: 11, color: Colors.error, marginTop: 6, fontWeight: '600' },
  hint: { fontSize: 11, color: Colors.textTertiary, marginTop: 6, fontWeight: '500' },
  skipBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  skipText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 18,
    fontWeight: '500',
    lineHeight: 16,
  },
});
