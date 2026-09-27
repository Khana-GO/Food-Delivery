import React, { useCallback } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';

/**
 * Shown whenever a customer without a phone number tries to order.
 * Google sign-ups land with `phone === null`, and the API refuses to create an
 * order until a number exists, so we explain why and route to the add-phone
 * screen instead of failing with a generic error.
 */
export const PHONE_ROUTE = '/(customer)/profile/phone' as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Label for the dismiss action — "Not now" by default. */
  dismissLabel?: string;
  /** Hide the dismiss action when the number is already mandatory. */
  dismissible?: boolean;
  /** Forwarded to the add-phone screen so it can tailor its copy. */
  source?: 'checkout' | 'cart';
}

export function PhoneRequiredModal({
  visible,
  onClose,
  dismissLabel = 'Not now',
  dismissible = true,
  source = 'checkout',
}: Props) {
  const router = useRouter();

  const goAddPhone = useCallback(() => {
    onClose();
    router.push({ pathname: PHONE_ROUTE, params: { source } } as any);
  }, [onClose, router, source]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <Feather name="phone" size={26} color={Colors.warning} />
          </View>

          <Text style={styles.title}>Add your mobile number</Text>
          <Text style={styles.desc}>
            We need a phone number before we can place your order. The restaurant
            and your rider use it to confirm the delivery and reach you if
            something goes wrong.
          </Text>

          <Pressable
            onPress={goAddPhone}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Feather name="plus-circle" size={17} color={Colors.white} />
            <Text style={styles.primaryBtnText}>Add phone number</Text>
          </Pressable>

          {dismissible ? (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.dismissBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.dismissText}>{dismissLabel}</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </View>
    </Modal>
  );
}

/** Inline banner used on the cart / checkout screens. */
export function PhoneRequiredBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.banner, pressed && { opacity: 0.92 }]}>
      <View style={styles.bannerIcon}>
        <Feather name="alert-circle" size={15} color={Colors.warning} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>Phone number missing</Text>
        <Text style={styles.bannerDesc}>
          Add your mobile number to place this order. Tap to add it now.
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={Colors.warning} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    padding: 26,
    alignItems: 'center',
    ...Shadow.xl,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  desc: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  primaryBtn: {
    marginTop: 22,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    ...Shadow.primary,
  },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  dismissBtn: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 16 },
  dismissText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 12,
    borderRadius: Radius.xl,
  },
  bannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 12, fontWeight: '800', color: '#92400E' },
  bannerDesc: { fontSize: 11, color: '#92400E', marginTop: 1, fontWeight: '500', lineHeight: 15 },
});
