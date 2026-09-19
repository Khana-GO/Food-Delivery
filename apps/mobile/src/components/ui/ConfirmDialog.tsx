import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  tone?: 'danger' | 'warning' | 'info' | 'success';
  busy?: boolean;
  confirmBg?: string;
  compact?: boolean;
}

const TONE_MAP = {
  danger: {
    iconBg: Colors.errorLight,
    iconColor: Colors.error,
    confirmBg: Colors.error,
  },
  warning: {
    iconBg: Colors.warningLight,
    iconColor: Colors.warning,
    confirmBg: Colors.warning,
  },
  info: {
    iconBg: Colors.primaryMuted,
    iconColor: Colors.primary,
    confirmBg: Colors.primary,
  },
  success: {
    iconBg: Colors.successLight,
    iconColor: Colors.success,
    confirmBg: Colors.success,
  },
} as const;

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  icon = 'alert-triangle',
  tone = 'danger',
  busy = false,
  confirmBg,
  compact = false,
}: ConfirmDialogProps) {
  const t = TONE_MAP[tone];
  const confirmColor = confirmBg || t.confirmBg;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Pressable
          style={{
            width: '100%',
            maxWidth: compact ? 280 : 340,
            backgroundColor: Colors.white,
            borderRadius: Radius['2xl'],
            padding: compact ? 20 : 28,
            alignItems: 'center',
            ...Shadow.xl,
          }}
          onPress={() => {}}
        >
          {/* Icon */}
          <View
            style={{
              width: compact ? 48 : 64,
              height: compact ? 48 : 64,
              borderRadius: compact ? 24 : 32,
              backgroundColor: t.iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${t.iconColor}30`,
            }}
          >
            <Feather name={icon} size={compact ? 20 : 28} color={t.iconColor} />
          </View>

          {/* Text */}
          <Text
            style={{
              marginTop: compact ? 12 : 18,
              fontSize: compact ? 15 : 18,
              fontWeight: '800',
              color: Colors.textDark,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              marginTop: compact ? 6 : 8,
              fontSize: compact ? 12 : 14,
              color: Colors.textSecondary,
              textAlign: 'center',
              lineHeight: compact ? 17 : 20,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: compact ? 10 : 12, marginTop: compact ? 16 : 24, width: '100%' }}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: compact ? 10 : 14,
                borderRadius: Radius.xl,
                backgroundColor: Colors.white,
                borderWidth: 1.5,
                borderColor: compact ? Colors.primary : Colors.border,
              }}
            >
              <Text style={{ fontSize: compact ? 12 : 14, fontWeight: '800', color: compact ? Colors.primary : Colors.textMedium }}>
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={busy}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: compact ? 10 : 14,
                borderRadius: Radius.xl,
                backgroundColor: compact ? Colors.primary : confirmColor,
                shadowColor: confirmColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {busy ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={{ fontSize: compact ? 12 : 14, fontWeight: '800', color: Colors.white }}>
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}
