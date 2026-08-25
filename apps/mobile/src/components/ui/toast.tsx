import React, { useCallback, useRef } from 'react';
import { create } from 'zustand';
import {
  Animated,
  Text,
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ──────────────────────────────────────────────────────────────────────────
// Toast store
// ──────────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'loading';

export interface ToastOptions {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ActiveToast extends Required<Omit<ToastOptions, 'title'>> {
  id: number;
  title?: string;
}

interface ToastState {
  toast: ActiveToast | null;
  show: (options: ToastOptions) => void;
  dismiss: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (options) =>
    set({
      toast: {
        id: nextId++,
        title: options.title,
        message: options.message,
        variant: options.variant ?? 'info',
        duration: options.duration ?? (options.variant === 'loading' ? 15000 : 2600),
      },
    }),
  dismiss: () => set({ toast: null }),
}));

const dismissTimer: Record<string, ReturnType<typeof setTimeout>> = {};

/** Show a professional toast. Returns nothing; auto-dismisses. */
export const toast = {
  success: (message: string, title?: string) => useToastStore.getState().show({ message, title, variant: 'success' }),
  error: (message: string, title?: string) => useToastStore.getState().show({ message, title, variant: 'error', duration: 3400 }),
  info: (message: string, title?: string) => useToastStore.getState().show({ message, title, variant: 'info' }),
  loading: (message: string, title?: string) => useToastStore.getState().show({ message, title, variant: 'loading', duration: 15000 }),
  dismiss: () => useToastStore.getState().dismiss(),
};

// ──────────────────────────────────────────────────────────────────────────
// Visual config
// ──────────────────────────────────────────────────────────────────────────

const VARIANT_META: Record<
  ToastVariant,
  { icon: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }
> = {
  success: { icon: 'check-circle', color: '#16A34A', bg: '#F0FDF4' },
  error: { icon: 'alert-circle', color: '#DC2626', bg: '#FEF2F2' },
  info: { icon: 'info', color: '#2563EB', bg: '#EFF6FF' },
  loading: { icon: 'loader', color: '#E23744', bg: '#FEF2F2' },
};

// ──────────────────────────────────────────────────────────────────────────
// Host — mount once near the root; renders the current toast
// ──────────────────────────────────────────────────────────────────────────

export function ToastHost() {
  const current = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const spin = useRef(
    Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 900, useNativeDriver: true })),
  ).current;
  const shownId = useRef<number | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const animateOut = useCallback(
    (after?: () => void) => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -24, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) after?.();
      });
    },
    [translateY, opacity],
  );

  React.useEffect(() => {
    if (!current) {
      return;
    }

    // A newer toast arrived mid-animation — snap to it.
    const isNew = shownId.current !== current.id;
    shownId.current = current.id;

    Object.values(dismissTimer).forEach(clearTimeout);

    if (isNew) {
      translateY.setValue(-24);
      opacity.setValue(0);
    }

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      animateOut(() => {
        if (shownId.current === current.id) {
          shownId.current = null;
          dismiss();
        }
      });
    }, current.duration);

    if (current.variant === 'loading') {
      spin.start();
    }

    dismissTimer[current.id] = t;
    return () => {
      clearTimeout(t);
      spin.stop();
    };
  }, [current, dismiss, animateOut, opacity, translateY, spin]);

  if (!current) return null;

  const meta = VARIANT_META[current.variant];

  return (
    <Animated.View
      pointerEvents={current.variant === 'loading' ? 'none' : 'box-none'}
      style={[styles.host, { top: insets.top + 8, width: Math.min(width - 24, 480), opacity, transform: [{ translateY }] }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Pressable
        onPress={() => {
          clearTimeout(dismissTimer[current.id]);
          animateOut(() => {
            shownId.current = null;
            dismiss();
          });
        }}
        style={styles.card}
      >
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Feather name={meta.icon} size={16} color={meta.color} />
        </View>
        <View style={styles.textWrap}>
          {current.title ? (
            <Text numberOfLines={1} style={styles.title}>
              {current.title}
            </Text>
          ) : null}
          <Text numberOfLines={2} style={styles.message}>
            {current.message}
          </Text>
        </View>
        {current.variant === 'loading' ? (
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              marginRight: 10,
            }}
          >
            <Feather name="loader" size={15} color="#94A3B8" />
          </Animated.View>
        ) : (
          <Feather name="x" size={15} color="#CBD5E1" />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 11,
    paddingLeft: 12,
    paddingRight: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  message: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#475569',
    marginTop: 1,
  },
});
