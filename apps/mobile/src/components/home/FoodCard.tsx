import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Radius, Shadow } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.4;

interface FoodItem {
  id: string;
  name: string;
  price: number | string;
  imageUrl?: string;
  restaurantId?: string;
}

interface FoodCardProps {
  food: FoodItem;
}

export function FoodCard({ food }: FoodCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {food.imageUrl ? (
          <Image source={{ uri: food.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={{ fontSize: 32 }}>🍲</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favBtn}>
          <Text>🤍</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
        <Text style={styles.price}>Rs. {food.price}</Text>
        
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginRight: 12,
    ...Shadow.sm,
  },
  imageContainer: {
    height: 100,
    width: '100%',
    backgroundColor: Colors.backgroundAlt,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  placeholderImage: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
