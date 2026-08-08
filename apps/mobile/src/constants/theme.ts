import { useColorScheme } from 'react-native';

export const LightColors = {
  primary: '#38BDF8',
  primaryDark: '#0284C7',
  pink: '#F472B6',
  pinkLight: '#FCE7F3',
  orange: '#FF5A1F',
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  cardBackground: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E2E8F0',
  inputBackground: '#F8FAFC',
  cardBorder: '#E2E8F0',
};

export const DarkColors = {
  primary: '#38BDF8',
  primaryDark: '#0284C7',
  pink: '#F472B6',
  pinkLight: '#831843',
  orange: '#FF5A1F',
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  cardBackground: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#334155',
  inputBackground: '#1E293B',
  cardBorder: '#334155',
};

export const Colors = LightColors;

export const useThemeColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkColors : LightColors;
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const TouchTarget = {
  minWidth: 48,
  minHeight: 48,
};

export const Radius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 30, lineHeight: 38, fontWeight: '800' as const },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  h3: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '700' as const },
};

export const Shadows = {
  soft: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};
