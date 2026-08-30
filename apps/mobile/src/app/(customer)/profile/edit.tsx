import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/user/useUpdateProfile';
import PremiumCard from '@/components/ui/PremiumCard';
import Button from '@/components/ui/Button';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { Colors, Radius, Shadow } from '@/constants/theme';

const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'At least 2 characters').max(50),
  lastName: z.string().trim().min(2, 'At least 2 characters').max(50),
  email: z.string().trim().email('Invalid email'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9]{10}$/.test(v), 'Phone must be 10 digits'),
});

type FormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [form, setForm] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  const validate = () => {
    try {
      profileSchema.parse(form);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: any = {};
        (err as any).issues?.forEach((e: any) => { if (e.path[0]) fe[e.path[0]] = e.message; });
        // fallback for older zod .errors
        (err as any).errors?.forEach((e: any) => { if (e.path[0]) fe[e.path[0]] = e.message; });
        setErrors(fe);
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: any = {};
    if (form.firstName !== user?.firstName) payload.firstName = form.firstName.trim();
    if (form.lastName !== user?.lastName) payload.lastName = form.lastName.trim();
    if (form.email !== user?.email) payload.email = form.email.trim().toLowerCase();
    if ((form.phone || '').trim() !== (user?.phone || '').trim()) {
      const p = (form.phone || '').trim();
      if (p) payload.phone = p;
    }
    if (Object.keys(payload).length === 0) {
      router.back();
      return;
    }
    updateProfile(payload);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <AnimatedPage slide>
            <View style={styles.heroNote}>
              <Feather name="shield" size={14} color={Colors.primary} />
              <Text style={styles.heroNoteText}>Your info is private and only used for orders & support</Text>
            </View>

            <PremiumCard style={{ marginTop: 14 } as any}>
              <Text style={styles.sectionTitle}>Personal info</Text>
              <Text style={styles.sectionHint}>Update your name, email and phone</Text>

              <Field label="First Name *" error={errors.firstName} value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} placeholder="Enter first name" icon="user" />
              <Field label="Last Name *" error={errors.lastName} value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} placeholder="Enter last name" icon="user" />
              <Field label="Email *" error={errors.email} value={form.email ?? ''} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" icon="mail" keyboardType="email-address" autoCapitalize="none" />
              <Field label="Phone" error={errors.phone} value={form.phone ?? ''} onChange={(v) => setForm({ ...form, phone: v.replace(/[^0-9]/g, '').slice(0, 10) })} placeholder="98XXXXXXXX" icon="phone" keyboardType="phone-pad" />
            </PremiumCard>

            <View style={{ marginTop: 16 }}>
              <Button label={isPending ? 'Saving...' : 'Save Changes'} onPress={handleSubmit} loading={isPending} fullWidth size="lg" />
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>Changes will be reflected instantly across your account.</Text>
          </AnimatedPage>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  error,
  value,
  onChange,
  placeholder,
  icon,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, !!error && styles.inputError]}>
        {icon ? <Feather name={icon} size={15} color="#94A3B8" /> : null}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          selectionColor={Colors.primary}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  heroNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  heroNoteText: { flex: 1, fontSize: 12, color: '#991B1B', fontWeight: '600', lineHeight: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.2 },
  sectionHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '700', color: Colors.textDark, marginBottom: 6, letterSpacing: 0.2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  input: { flex: 1, fontSize: 15, color: Colors.textDark, paddingVertical: 0, fontWeight: '500' },
  error: { fontSize: 11, color: '#EF4444', marginTop: 6, fontWeight: '600' },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  footer: { textAlign: 'center', fontSize: 11, color: Colors.textTertiary, marginTop: 16, fontWeight: '500' },
});
