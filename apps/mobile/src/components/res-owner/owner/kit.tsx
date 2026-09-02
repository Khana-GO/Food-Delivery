import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput as RNTextInput,
  ActivityIndicator,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// ──────────────────────────────────────────────────────────────────────────
// Design tokens
// ──────────────────────────────────────────────────────────────────────────

export const BRAND = '#B91C1C'; // darker red — was #E23744
export const GREEN = '#15803D'; // darker green — was #16A34A

/** Formats a number as Nepali Rupees, e.g. rs(12500) -> "Rs. 12,500" */
export const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

// ──────────────────────────────────────────────────────────────────────────
// Responsive helpers function
// ──────────────────────────────────────────────────────────────────────────

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  return { width, isTablet, isDesktop };
}

/**
 * Wraps scroll content so it stays centered with a comfortable max width
 * on tablets / landscape instead of stretching edge to edge.
 * Pass a huge max (e.g. 9999) on phone layouts.
 */
export const ContentWidth = (max: number) => ({
  alignSelf: 'center' as const,
  width: '100%' as const,
  maxWidth: max,
});

// ──────────────────────────────────────────────────────────────────────────
// Screen header — safe-area aware, consistent across every owner page
// ──────────────────────────────────────────────────────────────────────────

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  tone?: 'light' | 'brand';
}

export function ScreenHeader({ title, subtitle, back = true, right, tone = 'light' }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isBrand = tone === 'brand';

  return (
    <View
      className={isBrand ? 'bg-primary' : 'bg-white border-b border-gray-100'}
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center h-16 px-4">
        <View className="flex-row items-center flex-1" style={{ maxWidth: 688 }}>
          {back && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              className={`mr-1 h-10 w-10 -ml-2 items-center justify-center rounded-full ${
                isBrand ? 'bg-white/15 active:bg-white/25' : 'active:bg-gray-100'
              }`}
            >
              <Feather name="arrow-left" size={22} color={isBrand ? '#FFFFFF' : '#0F172A'} />
            </Pressable>
          )}
          <View className="flex-1">
            <Text
              className={`text-lg font-bold ${isBrand ? 'text-white' : 'text-gray-900'}`}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text className={`text-xs ${isBrand ? 'text-white/80' : 'text-gray-500'}`} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right ? <View className="pl-2">{right}</View> : null}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Section header with optional action link
// ──────────────────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-base font-bold text-gray-900">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable hitSlop={8} onPress={onAction} className="active:opacity-60">
          <Text className="text-sm font-semibold text-green-600">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Stat card — icon tile + value + label (+ optional trend badge)
// ──────────────────────────────────────────────────────────────────────────

type Tone = 'brand' | 'green' | 'amber' | 'slate';

const TONE_STYLES: Record<Tone, { chip: string; text: string }> = {
  brand: { chip: 'bg-red-50', text: 'text-primary' },
  green: { chip: 'bg-green-50', text: 'text-green-600' },
  amber: { chip: 'bg-amber-50', text: 'text-amber-600' },
  slate: { chip: 'bg-slate-100', text: 'text-slate-600' },
};

const TONE_ICONS: Record<Tone, React.ComponentProps<typeof Feather>['name']> = {
  brand: 'shopping-bag',
  green: 'trending-up',
  amber: 'clock',
  slate: 'activity',
};

const TONE_ICON_COLORS: Record<Tone, string> = {
  brand: BRAND,
  green: GREEN,
  amber: '#D97706',
  slate: '#475569',
};

export function StatCard({
  icon,
  label,
  value,
  trend,
  tone = 'brand',
}: {
  icon?: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string | number;
  trend?: string;
  tone?: Tone;
}) {
  const t = TONE_STYLES[tone];
  const positiveTrend = trend?.startsWith('+');
  const negativeTrend = trend?.startsWith('-');
  return (
    <View className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl shadow-gray-100">
      <View className="flex-row items-start justify-between">
        <View className={`h-10 w-10 items-center justify-center rounded-xl ${t.chip}`}>
          <Feather name={icon || TONE_ICONS[tone]} size={18} color={TONE_ICON_COLORS[tone]} />
        </View>
        {trend ? (
          <View
            className={`rounded-full px-2 py-0.5 ${
              positiveTrend ? 'bg-green-50' : negativeTrend ? 'bg-red-50' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-[11px] font-bold ${
                positiveTrend ? 'text-green-600' : negativeTrend ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {trend}
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-3 text-xl font-extrabold tracking-tight text-gray-900">{value}</Text>
      <Text className="mt-0.5 text-xs font-medium text-gray-500">{label}</Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Order status pill (green / amber / red / neutral system)
// ──────────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

const STATUS_META: Record<OrderStatus, { label: string; chip: string; text: string; dot: string }> = {
  pending: { label: 'Pending', chip: 'bg-amber-50 border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
  preparing: { label: 'Preparing', chip: 'bg-orange-50 border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' },
  ready: { label: 'Ready', chip: 'bg-blue-50 border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
  delivered: { label: 'Delivered', chip: 'bg-green-50 border-green-200', text: 'text-green-600', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled', chip: 'bg-red-50 border-red-200', text: 'text-red-500', dot: 'bg-red-500' },
};

export function StatusPill({ status, size = 'sm' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status] ?? STATUS_META.delivered;
  return (
    <View className={`flex-row items-center rounded-full border px-2.5 py-1 ${meta.chip}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <Text
        className={`${meta.text} ml-1.5 font-bold ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}
      >
        {meta.label}
      </Text>
    </View>
  );
}

export const statusMeta = STATUS_META;

// ──────────────────────────────────────────────────────────────────────────
// Filter chips (horizontal scroller)
// ──────────────────────────────────────────────────────────────────────────

export function FilterChip({
  label,
  active,
  count,
  onPress,
}: {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 flex-row items-center rounded-full px-4 py-2 ${
        active ? 'bg-primary' : 'border border-gray-200 bg-white'
      }`}
    >
      <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
      {typeof count === 'number' ? (
        <View className={`ml-1.5 rounded-full px-1.5 py-px ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
          <Text className={`text-[10px] font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Search bar
// ──────────────────────────────────────────────────────────────────────────

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const TextInput = RNTextInput;
  return (
    <View className="flex-row items-center h-12 px-4 bg-white border border-gray-200 rounded-2xl">
      <Feather name="search" size={18} color="#94A3B8" />
      <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
        className="flex-1 ml-3 text-sm text-gray-900"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable hitSlop={8} onPress={() => onChange('')} className="p-1">
          <Feather name="x-circle" size={18} color="#94A3B8" />
        </Pressable>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center justify-center px-8 py-12 bg-white border border-gray-200 border-dashed rounded-3xl">
      <View className="items-center justify-center w-20 h-20 rounded-full bg-green-50">
        <Feather name={icon} size={34} color={GREEN} />
      </View>
      <Text className="mt-4 text-base font-bold text-gray-900">{title}</Text>
      {message ? (
        <Text className="mt-1 text-sm leading-5 text-center text-gray-500">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="flex-row items-center px-6 py-3 mt-5 bg-green-600 rounded-full active:bg-green-700"
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text className="ml-1.5 text-sm font-bold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Confirmation dialog (delete / logout / generic)
// ──────────────────────────────────────────────────────────────────────────

type DialogTone = 'danger' | 'success' | 'brand';

const DIALOG_TONES: Record<DialogTone, { iconBg: string; btn: string; iconColor: string }> = {
  danger: { iconBg: 'bg-[#FEE2E2]', btn: 'bg-[#B91C1C] active:bg-[#7F1D1D]', iconColor: '#B91C1C' },
  success: { iconBg: 'bg-[#DCFCE7]', btn: 'bg-[#15803D] active:bg-[#14532D]', iconColor: GREEN },
  brand: { iconBg: 'bg-[#FEE2E2]', btn: 'bg-[#B91C1C] active:bg-[#7F1D1D]', iconColor: BRAND },
};

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  icon = 'alert-triangle',
  tone = 'danger',
  busy = false,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  tone?: DialogTone;
  busy?: boolean;
}) {
  const t = DIALOG_TONES[tone];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 px-6 bg-black/50" onPress={onClose}>
        <View className="items-center justify-center flex-1">
          <Pressable className="w-full max-w-sm p-6 bg-white rounded-3xl" onPress={() => {}}>
            <View className="items-center">
              <View className={`h-16 w-16 items-center justify-center rounded-full ${t.iconBg}`}>
                <Feather name={icon} size={28} color={t.iconColor} />
              </View>
              <Text className="mt-4 text-lg font-bold text-gray-900">{title}</Text>
              <Text className="mt-1.5 text-center text-sm leading-5 text-gray-500">{message}</Text>
            </View>
            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={onClose}
                disabled={busy}
                className="flex-1 items-center rounded-2xl bg-gray-100 py-3.5 active:bg-gray-200"
              >
                <Text className="text-sm font-bold text-gray-700">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                disabled={busy}
                className={`flex-1 items-center rounded-2xl py-3.5 ${t.btn}`}
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-bold text-white">{confirmLabel}</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Primary button
// ──────────────────────────────────────────────────────────────────────────

export function PrimaryButton({
  label,
  onPress,
  loading,
  variant = 'brand',
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'brand' | 'green' | 'outline';
  icon?: React.ComponentProps<typeof Feather>['name'];
}) {
  const styles = {
    brand: 'bg-primary',
    green: 'bg-green-600',
    outline: 'border border-gray-300 bg-white',
  }[variant];
  const textColor = variant === 'outline' ? 'text-gray-800' : 'text-white';
  const iconColor = variant === 'outline' ? '#1E293B' : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`items-center justify-center rounded-2xl py-4 ${styles} ${loading ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? '#1E293B' : '#FFFFFF'} />
      ) : (
        <View className="flex-row items-center">
          {icon ? <Feather name={icon} size={17} color={iconColor} /> : null}
          <Text className={`ml-1.5 text-sm font-bold tracking-wide ${textColor}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Info row (icon + label + value)
// ──────────────────────────────────────────────────────────────────────────

export function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-3 ${last ? '' : 'border-b border-gray-50'}`}
    >
      <View className="items-center justify-center rounded-full h-9 w-9 bg-gray-50">
        <Feather name={icon} size={16} color="#64748B" />
      </View>
      <Text className="w-24 ml-3 text-xs font-medium text-gray-400">{label}</Text>
      <Text className="flex-1 text-sm font-semibold text-right text-gray-800" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Form field
// ──────────────────────────────────────────────────────────────────────────

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-semibold text-slate-700">
        {label}
        {required ? <Text className="text-[#B91C1C]"> *</Text> : null}
      </Text>
      {children}
      {error ? <Text className="mt-1 text-xs font-normal text-[#B91C1C]">{error}</Text> : null}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Toggle switch — large, accessible thumb with an in-progress spinner
// ──────────────────────────────────────────────────────────────────────────

const TOGGLE_W = 60;
const TOGGLE_H = 34;
const THUMB = 28;
const PADDING = 3;

export function Toggle({
  checked,
  onChange,
  disabled,
  loading = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [checked, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [PADDING, TOGGLE_W - THUMB - PADDING],
  });

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled || loading}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked, busy: loading, disabled: disabled || loading }}
      style={{
        width: TOGGLE_W,
        height: TOGGLE_H,
        borderRadius: TOGGLE_H / 2,
        padding: PADDING,
        justifyContent: 'center',
        backgroundColor: checked ? GREEN : '#CBD5E1',
        opacity: disabled || loading ? 0.75 : 1,
      }}
    >
      {loading && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: (TOGGLE_W - TOGGLE_H) / 2 + PADDING,
            top: PADDING,
            height: THUMB,
            width: THUMB,
            borderRadius: THUMB / 2,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <ActivityIndicator size="small" color={checked ? '#FFFFFF' : '#64748B'} />
        </View>
      )}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          transform: [{ translateX }],
          backgroundColor: '#FFFFFF',
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 4,
          elevation: 3,
        }}
      />
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Shared screen-level loading & error views
// ──────────────────────────────────────────────────────────────────────────

export function LoadingScreen() {
  return (
    <View className="items-center justify-center flex-1 bg-gray-50">
      <ActivityIndicator size="large" color={BRAND} />
      <Text className="mt-3 text-sm text-gray-400">Loading…</Text>
    </View>
  );
}
