import { Platform } from 'react-native';

// Premium Crimson Food Delivery App — Deep Crimson + Black + White Design System
export const Colors = {
  // Primary — Deep Crimson
  primary: '#B5122A',
  primaryDark: '#7F0D1D',
  primaryLight: '#D7193F',
  primaryMuted: '#FDECEE',
  primaryBg: '#FDECEE',

  // Secondary — Pure Black / Soft Black
  secondary: '#0A0A0A',
  secondarySoft: '#151515',

  // Rating Gold
  ratingGold: '#F4B740',
  ratingGoldLight: '#FEF9E7',

  // Success
  success: '#16834B',
  successLight: '#D5F5E3',
  successBg: '#E8F8F0',

  // Error
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorBg: '#FEF2F2',

  // Warning
  warning: '#D97706',
  warningLight: '#FEF3C7',

  // Surfaces — Layered System (Level 1, 2, 3)
  white: '#FFFFFF',
  background: '#F7F7F5',        // Level 1: Background
  backgroundAlt: '#EEEEEB',     // Slightly darker background
  backgroundElevated: '#FFFFFF', // Level 2: Cards
  surface: '#FFFFFF',
  surfaceHover: '#F7F7F5',
  surfacePressed: '#EEEEEB',
  border: '#E8E8E8',
  borderLight: '#F0F0ED',
  borderMedium: '#E8E8E8',
  overlay: 'rgba(10,10,10,0.5)',

  // Text
  textDark: '#0A0A0A',          // Pure Black
  textPrimary: '#151515',       // Soft Black
  textMedium: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textLight: '#CCCCCC',
  textMuted: '#BBBBBB',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Gradients
  gradientPrimary: ['#B5122A', '#7F0D1D'] as const,
  gradientPrimaryLight: ['#D7193F', '#B5122A'] as const,
  gradientSurface: ['#FFFFFF', '#F7F7F5'] as const,
  gradientHero: ['#7F0D1D', '#B5122A'] as const,
  gradientDark: ['#0A0A0A', '#151515'] as const,

  // Glass
  glass: 'rgba(255,255,255,0.9)',
  glassBorder: 'rgba(255,255,255,0.3)',
  glassDark: 'rgba(10,10,10,0.6)',

  // Light/Dark compatibility (using light theme only for this premium app)
  light: {
    text: '#0A0A0A',
    background: '#F7F7F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#FDECEE',
    textSecondary: '#666666',
    card: '#FFFFFF',
    border: '#E8E8E8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

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
  displayLarge: { fontSize: 34, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -1.0 },
  displayMedium: { fontSize: 28, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.6 },
  titleLarge: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.4 },
  titleMedium: { fontSize: 18, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2 },
  titleSmall: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 22, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, lineHeight: 20, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 22, fontWeight: '600' as const, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.3 },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.4 },
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
  xs: 8,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Premium elevation — subtle 3D with layered soft shadows
// Level 1: Background (no shadow)
// Level 2: Cards — very soft shadow
// Level 3: Floating controls — stronger shadow
export const Shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Level 2: Cards
  xs: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  // Level 3: Floating components
  lg: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 12,
  },
  floating: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 10,
  },
  // Primary accent shadows
  primary: {
    shadowColor: '#B5122A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryLg: {
    shadowColor: '#B5122A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
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
  tabBarHeight: 72,
  headerHeight: 56,
  cardPadding: 16,
  screenPadding: 16,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;