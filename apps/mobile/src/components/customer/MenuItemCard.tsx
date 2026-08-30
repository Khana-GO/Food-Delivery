import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MenuItem } from '@food_delivery/types';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface Props {
  item: MenuItem;
  quantity?: number;
  onAdd: (item: MenuItem) => void;
  onRemove?: (itemId: string) => void;
}

export const MenuItemCard = ({ item, quantity = 0, onAdd, onRemove }: Props) => {
  const isAvailable = item.isAvailable !== false;
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 28 }}>🍽️</Text>
          </View>
        )}
        {!isAvailable ? (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {/** Hot/spicy marker if name contains */}
        </View>
        <Text style={styles.desc} numberOfLines={2}>{item.description || 'Freshly prepared with premium ingredients'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>Rs. {item.price}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, borderWidth: StyleSheet.hairlineWidth, borderColor: '#BBF7D0' }}>
            <Feather name="shield" size={10} color="#15803D" />
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#15803D' }}>Fresh</Text>
          </View>
        </View>
      </View>

      <View style={{ marginLeft: 8, alignItems: 'center' }}>
        {isAvailable ? (
          quantity > 0 ? (
            <View style={styles.qtyWrap}>
              <TouchableOpacity onPress={() => onRemove?.(item.id)} activeOpacity={0.85} style={styles.qtyMinus}>
                <Feather name="minus" size={14} color={Colors.textDark} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity onPress={() => onAdd(item)} activeOpacity={0.85} style={styles.qtyPlus}>
                <Feather name="plus" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => onAdd(item)} activeOpacity={0.85} style={styles.addBtn}>
              <Feather name="plus" size={14} color="#FFFFFF" />
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.outPill}>
            <Text style={styles.outText}>Out</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  imageWrap: {
    width: 78,
    height: 78,
    borderRadius: Radius.lg,
    backgroundColor: '#FFF7ED',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  unavailableOverlay: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, backgroundColor: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999 },
  name: { flex: 1, fontSize: 14, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
  desc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 16, fontWeight: '500' },
  pricePill: { backgroundColor: Colors.textDark, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  priceText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
    gap: 6,
  },
  qtyMinus: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' },
  qtyPlus: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: '800', color: Colors.textDark, minWidth: 14, textAlign: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    ...Shadow.primary,
  },
  addText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  outPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0' },
  outText: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary },
});
