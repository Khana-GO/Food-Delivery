import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface HomeSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function HomeSearchBar({ value, onChangeText }: HomeSearchBarProps) {
  return (
    <View style={styles.searchBar}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants, foods..."
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity style={styles.micBtn}>
        <Text>🎙️</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterBtn}>
        <Text>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    height: 48,
    ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textDark },
  micBtn: { paddingHorizontal: 8 },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
