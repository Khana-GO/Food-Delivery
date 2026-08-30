import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface Props {
  icon?: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export default function EmptyState({ icon = 'inbox', title, description, actionLabel, onAction, secondaryLabel, onSecondary }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={26} color={Colors.primary} />
        </View>
        <View style={styles.iconRingOuter} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.85} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>{actionLabel}</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <TouchableOpacity onPress={onSecondary} activeOpacity={0.7} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
        <Feather name="alert-triangle" size={24} color={Colors.error} />
      </View>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.desc}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.85} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 6,
  },
  iconRing: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    ...Shadow.sm,
  },
  iconRingOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginTop: 6, textAlign: 'center' },
  desc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, marginTop: 6, maxWidth: 320 },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Shadow.primary,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, letterSpacing: 0.2 },
  secondaryBtn: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryText: { color: Colors.textMedium, fontWeight: '600', fontSize: 13 },
});
