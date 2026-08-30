import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  safe?: boolean;
  backgroundColor?: string;
}

export default function PageContainer({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  style,
  contentStyle,
  safe = true,
  backgroundColor = Colors.background,
}: Props) {
  const Wrapper: any = safe ? SafeAreaView : View;
  const wrapperProps = safe ? { edges: ['top'] as const, style: [styles.wrapper, { backgroundColor }, style] } : { style: [styles.wrapper, { backgroundColor }, style] };

  if (!scroll) {
    return <Wrapper {...wrapperProps}>{children}</Wrapper>;
  }

  return (
    <Wrapper {...wrapperProps}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, contentStyle]}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} /> : undefined
        }
        bounces
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </Wrapper>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.header, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Text onPress={onAction} style={styles.sectionAction}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.2 },
  sectionAction: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
