import { Platform } from 'react-native';

// KhanaGo Premium Design System — Clean, Minimal, Slightly 3D, Apple-inspired
export const Colors = {
  // Primary — deeper premium red
  primary: '#B91C1C',
  primaryDark: '#7F1D1D',
  primaryLight: '#FEE2E2',
  primaryBg: '#FEF2F2',
  primaryMuted: '#FEF2F2',
  primaryHover: '#991B1B',

  // Accent — warm amber for highlights
  accent: '#F59E0B',
  accentLight: '#FEF3C7',

  // Semantic
  success: '#15803D',
  successLight: '#DCFCE7',
  successBg: '#F0FDF4',
  error: '#B91C1C',
  errorLight: '#FEE2E2',
  errorBg: '#FEF2F2',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  info: '#2563EB',
  infoLight: '#EFF6FF',

  // Surfaces — layered system
  white: '#FFFFFF',
  background: '#FAFAFB',
  backgroundAlt: '#F3F4F6',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  surfacePressed: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderMedium: '#D1D5DB',
  overlay: 'rgba(15,23,42,0.4)',

  // Text
  textDark: '#0F172A',
  textPrimary: '#111827',
  textMedium: '#334155',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textLight: '#94A3B8',
  textMuted: '#CBD5E1',
  textInverse: '#FFFFFF',

  // Gradients metadata (for StyleSheet usage)
  gradientPrimary: ['#B91C1C', '#991B1B'] as const,
  gradientSurface: ['#FFFFFF', '#FAFAFB'] as const,
  gradientHero: ['#FEF2F2', '#FFFFFF'] as const,

  // Glass
  glass: 'rgba(255,255,255,0.7)',
  glassBorder: 'rgba(255,255,255,0.5)',
  glassDark: 'rgba(15,23,42,0.6)',

  // Light/Dark compatibility
  light: {
    text: '#0F172A',
    background: '#FAFAFB',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E5E7EB',
    textSecondary: '#64748B',
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
    card: '#1E293B',
    border: '#334155',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  displayLarge: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.8 },
  displayMedium: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const, letterSpacing: -0.6 },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.4 },
  titleMedium: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const, letterSpacing: -0.2 },
  titleSmall: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.3 },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const, letterSpacing: 0.4 },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  full: 9999,
} as const;

// Premium elevation — subtle 3D with layered shadows
export const Shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
  },
  primary: {
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryLg: {
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export const Animation = {
  fast: 140,
  normal: 220,
  slow: 320,
  spring: { damping: 18, stiffness: 220, mass: 0.8 },
  gentle: { damping: 20, stiffness: 160, mass: 1 },
} as const;

export const Layout = {
  maxWidth: 640,
  maxWidthWide: 800,
  tabBarHeight: 62,
  headerHeight: 56,
  cardPadding: 16,
  screenPadding: 16,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
