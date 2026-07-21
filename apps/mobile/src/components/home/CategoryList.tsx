import React from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Shadow } from '@/constants/theme';

interface Category {
  id: string;
  name: string;
  icon?: string;
  emoji?: string;
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  // Add some fallback emojis for UI since backend might not have them initially
  const fallbacks = ['🥟', '🍕', '🍔', '🍱', '🥤', '🍦', '🍩', '🥗', '☕', '🍲'];
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((cat, index) => (
        <TouchableOpacity key={cat.id} style={styles.categoryItem}>
          <View style={styles.categoryIconBg}>
            <Text style={styles.categoryEmoji}>{cat.emoji || fallbacks[index % fallbacks.length]}</Text>
          </View>
          <Text style={styles.categoryName}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  categoryItem: { alignItems: 'center', gap: 6 },
  categoryIconBg: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  categoryEmoji: { fontSize: 26 },
  categoryName: { fontSize: 12, color: Colors.textMedium, fontWeight: '500' },
});
