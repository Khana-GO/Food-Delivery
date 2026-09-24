import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useCartStore } from '@/stores/customer/cartStore';
import type { DishSearchResult } from '@/services/customer/search.service';

interface DishSearchCardProps {
  item: DishSearchResult;
  variant?: 'card' | 'row';
}

export const DishSearchCard: React.FC<DishSearchCardProps> = ({ item, variant = 'row' }) => {
  const { items: cartItems, addItem, removeItem, restaurantId } = useCartStore();
  const cartItem = cartItems.find((ci) => ci.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e: any) => {
    e.stopPropagation?.();
    if (!item.isAvailable || !item.restaurantIsOpen) return;

    if (restaurantId && item.restaurantId && restaurantId !== item.restaurantId) {
      Alert.alert(
        'Replace cart items?',
        `Your cart contains items from another restaurant. Do you want to reset your cart to add items from ${item.restaurantName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Replace',
            style: 'destructive',
            onPress: () => {
              useCartStore.getState().clearCart().then(() => {
                addItem({
                  menuItemId: item.id,
                  name: item.name,
                  price: Number(item.price),
                  imageUrl: item.imageUrl,
                  isAvailable: item.isAvailable,
                  restaurantId: item.restaurantId || null,
                });
              });
            },
          },
        ]
      );
      return;
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      restaurantId: item.restaurantId || null,
    });
  };

  const handleRemove = (e: any) => {
    e.stopPropagation?.();
    removeItem(item.id);
  };

  const isClosedOrUnavailable = !item.isAvailable || !item.restaurantIsOpen;

  if (variant === 'card') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push(`/(customer)/menu/${item.id}` as any)}
        style={styles.gridCard}
      >
        <View style={styles.gridImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.imageFull}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7Rj~qofM{WB' }}
            />
          ) : (
            <Text style={{ fontSize: 32 }}>{getCategoryIcon(item.categoryName || item.name)}</Text>
          )}

          {isClosedOrUnavailable ? (
            <View style={styles.badgeClosed}>
              <Text style={styles.badgeClosedText}>
                {!item.restaurantIsOpen ? 'Closed' : 'Sold Out'}
              </Text>
            </View>
          ) : null}

          <View style={styles.priceTag}>
            <Text style={styles.priceText}>Rs. {item.price}</Text>
          </View>
        </View>

        <View style={{ padding: 12 }}>
          <Text numberOfLines={1} style={styles.dishName}>
            {item.name}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              if (item.restaurantId) {
                router.push(`/(customer)/restaurant/${item.restaurantId}` as any);
              }
            }}
            style={styles.restaurantRow}
          >
            <Feather name="map-pin" size={10} color={Colors.textTertiary} />
            <Text numberOfLines={1} style={styles.restaurantName}>
              {item.restaurantName}
            </Text>
          </TouchableOpacity>

          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              {item.restaurantRating > 0 ? (
                <View style={styles.ratingBadge}>
                  <Feather name="star" size={10} color="#D97706" />
                  <Text style={styles.ratingText}>{Number(item.restaurantRating).toFixed(1)}</Text>
                </View>
              ) : null}
              {item.restaurantEstimatedDeliveryTime ? (
                <Text style={styles.etaText}>{item.restaurantEstimatedDeliveryTime} min</Text>
              ) : null}
            </View>

            {/* Add / Stepper Button */}
            {!isClosedOrUnavailable ? (
              quantity > 0 ? (
                <View style={styles.stepperContainerSmall}>
                  <TouchableOpacity onPress={handleRemove} hitSlop={4} style={styles.stepperBtnSmall}>
                    <Feather name="minus" size={12} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.stepperCountSmall}>{quantity}</Text>
                  <TouchableOpacity onPress={handleAdd} hitSlop={4} style={styles.stepperBtnSmall}>
                    <Feather name="plus" size={12} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={handleAdd} activeOpacity={0.8} style={styles.addBtnSmall}>
                  <Text style={styles.addBtnTextSmall}>+ ADD</Text>
                </TouchableOpacity>
              )
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Row layout (Default)
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/(customer)/menu/${item.id}` as any)}
      style={styles.rowCard}
    >
      <View style={styles.rowImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.imageFull}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7Rj~qofM{WB' }}
          />
        ) : (
          <Text style={{ fontSize: 28 }}>{getCategoryIcon(item.categoryName || item.name)}</Text>
        )}
        {isClosedOrUnavailable ? (
          <View style={styles.badgeClosedRow}>
            <Text style={styles.badgeClosedRowText}>
              {!item.restaurantIsOpen ? 'Closed' : 'Sold Out'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.rowInfo}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.dishName}>
            {item.name}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              if (item.restaurantId) {
                router.push(`/(customer)/restaurant/${item.restaurantId}` as any);
              }
            }}
            style={styles.restaurantRow}
          >
            <Feather name="map-pin" size={11} color={Colors.textTertiary} />
            <Text numberOfLines={1} style={styles.restaurantName}>
              {item.restaurantName}
            </Text>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            {item.restaurantRating > 0 ? (
              <View style={styles.ratingBadge}>
                <Feather name="star" size={10} color="#D97706" />
                <Text style={styles.ratingText}>{Number(item.restaurantRating).toFixed(1)}</Text>
              </View>
            ) : null}
            {item.restaurantEstimatedDeliveryTime ? (
              <Text style={styles.etaText}>{item.restaurantEstimatedDeliveryTime} min delivery</Text>
            ) : null}
            {item.categoryName ? (
              <Text style={styles.categoryPill} numberOfLines={1}>
                {item.categoryName}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rowRight}>
          <Text style={styles.priceRow}>Rs. {item.price}</Text>

          {!isClosedOrUnavailable ? (
            quantity > 0 ? (
              <View style={styles.stepperContainer}>
                <TouchableOpacity onPress={handleRemove} hitSlop={6} style={styles.stepperBtn}>
                  <Feather name="minus" size={13} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperCount}>{quantity}</Text>
                <TouchableOpacity onPress={handleAdd} hitSlop={6} style={styles.stepperBtn}>
                  <Feather name="plus" size={13} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleAdd} activeOpacity={0.8} style={styles.addBtn}>
                <Feather name="plus" size={13} color={Colors.primary} />
                <Text style={styles.addBtnText}>ADD</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.disabledBtn}>
              <Text style={styles.disabledBtnText}>Unavailable</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    width: 172,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  gridImageContainer: {
    height: 120,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Shadow.sm,
  },
  rowImageContainer: {
    width: 90,
    height: 90,
    borderRadius: Radius.lg,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageFull: {
    width: '100%',
    height: '100%',
  },
  badgeClosed: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeClosedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeClosedRow: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  badgeClosedRowText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dishName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  restaurantName: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  etaText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  categoryPill: {
    fontSize: 10,
    color: Colors.textSecondary,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    maxWidth: 120,
  },
  rowInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
    gap: 6,
  },
  priceRow: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  addBtnSmall: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  addBtnTextSmall: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 6,
  },
  stepperBtn: {
    padding: 3,
  },
  stepperCount: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    minWidth: 14,
    textAlign: 'center',
  },
  stepperContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  stepperBtnSmall: {
    padding: 2,
  },
  stepperCountSmall: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    minWidth: 12,
    textAlign: 'center',
  },
  disabledBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  disabledBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
});
