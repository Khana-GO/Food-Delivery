import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NetworkBannerProps {
  isOffline?: boolean;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({ isOffline = false }) => {
  const [offlineState, setOfflineState] = useState(isOffline);
  const slideAnim = useState(new Animated.Value(-50))[0];

  useEffect(() => {
    setOfflineState(isOffline);

    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  if (!offlineState) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
      <Text style={styles.bannerText}>
        You're currently offline. Viewing cached menus &amp; saved orders.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 999,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
