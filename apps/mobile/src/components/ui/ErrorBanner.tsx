import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="warning-outline" size={24} color="#EF4444" style={{ marginTop: 2 }} />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Ionicons name="refresh" size={14} color="#DC2626" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  message: {
    fontSize: 13,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
});
