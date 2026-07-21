import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Shadow } from '@/constants/theme';
import { router } from 'expo-router';
import { LocationGeocodedAddress } from 'expo-location';
import { useAuthStore } from '@/store/authStore';

interface HomeHeaderProps {
  address: LocationGeocodedAddress | null;
}

export function HomeHeader({ address }: HomeHeaderProps) {
  const { user } = useAuthStore();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayAddress = address 
    ? `${address.city || ''}${address.district ? `, ${address.district}` : ''}`
    : 'Fetching location...';

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.firstName || 'User'} 👋</Text>
        <TouchableOpacity style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>{displayAddress}</Text>
          <Text style={styles.locationChevron}> ˅</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/(customer)/notifications' as any)}
        >
          <Text style={styles.iconBtnText}>🔔</Text>
          <View style={styles.notifBadge} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnGreen]}
          onPress={() => router.push('/(customer)/chat' as any)}
        >
          <Text style={styles.iconBtnText}>💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationPin: { fontSize: 13 },
  locationText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  locationChevron: { fontSize: 13, color: Colors.textSecondary },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  iconBtnGreen: { backgroundColor: '#D1FAE5' },
  iconBtnText: { fontSize: 18 },
  notifBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
