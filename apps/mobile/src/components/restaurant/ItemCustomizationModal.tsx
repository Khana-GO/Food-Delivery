import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuantityStepper } from '../ui/QuantityStepper';

export interface MenuItemData {
  id: string;
  name: string;
  price: number;
  calories?: string;
  image?: string;
  restaurantId: string;
  restaurantName: string;
}

interface ItemCustomizationModalProps {
  visible: boolean;
  item: MenuItemData | null;
  onClose: () => void;
  onAddToCart: (customizedItem: {
    item: MenuItemData;
    customizations: string[];
    specialInstructions: string;
    finalPrice: number;
    qty: number;
  }) => void;
}

const SIDE_OPTIONS = [
  { id: 'french_fries', label: 'French Fries', extraPrice: 0 },
  { id: 'onion_rings', label: 'Crispy Onion Rings', extraPrice: 1.5 },
  { id: 'side_salad', label: 'Garden Side Salad', extraPrice: 1.0 },
];

const DRINK_OPTIONS = [
  { id: 'coke', label: 'Coca-Cola (500ml)', extraPrice: 0 },
  { id: 'sprite', label: 'Sprite (500ml)', extraPrice: 0 },
  { id: 'diet_coke', label: 'Diet Coke (500ml)', extraPrice: 0 },
  { id: 'iced_tea', label: 'Lemon Iced Tea', extraPrice: 0.5 },
];

const TOPPING_OPTIONS = [
  { id: 'extra_cheese', label: 'Extra Melted Cheddar', extraPrice: 1.0 },
  { id: 'bacon', label: 'Crispy Bacon Strip', extraPrice: 1.5 },
  { id: 'jalapeno', label: 'Pickled Jalapeños', extraPrice: 0.75 },
  { id: 'extra_sauce', label: 'House Secret Sauce', extraPrice: 0.5 },
];

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({
  visible,
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [selectedSide, setSelectedSide] = useState(SIDE_OPTIONS[0].id);
  const [selectedDrink, setSelectedDrink] = useState(DRINK_OPTIONS[0].id);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Calculate extra cost
  const sideExtra = SIDE_OPTIONS.find((s) => s.id === selectedSide)?.extraPrice || 0;
  const drinkExtra = DRINK_OPTIONS.find((d) => d.id === selectedDrink)?.extraPrice || 0;
  const toppingsExtra = selectedToppings.reduce((sum, tid) => {
    const top = TOPPING_OPTIONS.find((t) => t.id === tid);
    return sum + (top ? top.extraPrice : 0);
  }, 0);

  const unitPrice = item.price + sideExtra + drinkExtra + toppingsExtra;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const sideObj = SIDE_OPTIONS.find((s) => s.id === selectedSide);
    const drinkObj = DRINK_OPTIONS.find((d) => d.id === selectedDrink);
    const toppingsList = selectedToppings.map(
      (tid) => TOPPING_OPTIONS.find((t) => t.id === tid)?.label || tid
    );

    const customizations = [
      `Side: ${sideObj?.label}`,
      `Drink: ${drinkObj?.label}`,
      ...toppingsList,
    ];

    onAddToCart({
      item,
      customizations,
      specialInstructions: instructions,
      finalPrice: unitPrice,
      qty: quantity,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Food Header Info */}
            <View style={styles.itemHeaderRow}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={styles.placeholderImg}>
                  <Text style={{ fontSize: 32 }}>🍔</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {!!item.calories && <Text style={styles.itemCal}>{item.calories}</Text>}
                <Text style={styles.itemBasePrice}>${item.price.toFixed(2)}</Text>
              </View>
            </View>

            {/* Required Side Choice */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Side</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>REQUIRED</Text>
              </View>
            </View>

            <View style={styles.optionsGroup}>
              {SIDE_OPTIONS.map((side) => {
                const selected = selectedSide === side.id;
                return (
                  <TouchableOpacity
                    key={side.id}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => setSelectedSide(side.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      {side.label}
                    </Text>
                    {side.extraPrice > 0 && (
                      <Text style={styles.extraPriceText}>+${side.extraPrice.toFixed(2)}</Text>
                    )}
                    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Required Drink Choice */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Drink</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>REQUIRED</Text>
              </View>
            </View>

            <View style={styles.optionsGroup}>
              {DRINK_OPTIONS.map((drink) => {
                const selected = selectedDrink === drink.id;
                return (
                  <TouchableOpacity
                    key={drink.id}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => setSelectedDrink(drink.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      {drink.label}
                    </Text>
                    {drink.extraPrice > 0 && (
                      <Text style={styles.extraPriceText}>+${drink.extraPrice.toFixed(2)}</Text>
                    )}
                    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional Toppings */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add Extras &amp; Toppings</Text>
              <Text style={styles.optionalSub}>Optional</Text>
            </View>

            <View style={styles.optionsGroup}>
              {TOPPING_OPTIONS.map((top) => {
                const selected = selectedToppings.includes(top.id);
                return (
                  <TouchableOpacity
                    key={top.id}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => toggleTopping(top.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      {top.label}
                    </Text>
                    <Text style={styles.extraPriceText}>+${top.extraPrice.toFixed(2)}</Text>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Special Instructions Input */}
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.inputBox}>
              <Ionicons name="chatbox-outline" size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="E.g., No onions, extra crispy fries, sauce on side"
                placeholderTextColor="#94A3B8"
                value={instructions}
                onChangeText={setInstructions}
                multiline
              />
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.sheetFooter}>
            <QuantityStepper
              value={quantity}
              onIncrement={() => setQuantity((q) => q + 1)}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
              min={1}
              size="large"
            />

            <TouchableOpacity style={styles.addBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Add to Cart</Text>
              <Text style={styles.addBtnPrice}>${totalPrice.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  placeholderImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  itemCal: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemBasePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  requiredBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  optionalSub: {
    fontSize: 12,
    color: '#94A3B8',
  },

  optionsGroup: {
    gap: 8,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionRowSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  optionLabelSelected: {
    color: '#0284C7',
    fontWeight: '700',
  },
  extraPriceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#38BDF8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
    minHeight: 80,
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    textAlignVertical: 'top',
  },

  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addBtnPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38BDF8',
  },
});
