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
  tone?: 'danger' | 'warning' | 'info';
  busy?: boolean;
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
}: ConfirmDialogProps) {
  const t = TONE_MAP[tone];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Pressable
          style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: Colors.white,
            borderRadius: Radius['2xl'],
            padding: 28,
            alignItems: 'center',
            ...Shadow.xl,
          }}
          onPress={() => {}}
        >
          {/* Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: t.iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${t.iconColor}30`,
            }}
          >
            <Feather name={icon} size={28} color={t.iconColor} />
          </View>

          {/* Text */}
          <Text
            style={{
              marginTop: 18,
              fontSize: 18,
              fontWeight: '800',
              color: Colors.textDark,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: Colors.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' }}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                borderRadius: Radius.xl,
                backgroundColor: Colors.background,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textMedium }}>
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
                paddingVertical: 14,
                borderRadius: Radius.xl,
                backgroundColor: t.confirmBg,
                shadowColor: t.confirmBg,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {busy ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.white }}>
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
