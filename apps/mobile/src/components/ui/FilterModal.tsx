import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FilterOptions {
  sortBy: string;
  cuisines: string[];
  dietary: string[];
  priceRange: string[];
  maxDeliveryTime: number | null;
  minRating: number | null;
  onlyDiscounts: boolean;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { id: 'popularity', label: 'Most Popular', icon: 'flame-outline' },
  { id: 'rating', label: 'Highest Rated', icon: 'star-outline' },
  { id: 'fastest', label: 'Fastest Delivery', icon: 'flash-outline' },
  { id: 'distance', label: 'Distance (Nearest)', icon: 'navigate-outline' },
  { id: 'price_low', label: 'Price: Low to High', icon: 'arrow-down-outline' },
];

const CUISINE_OPTIONS = [
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'asian', label: 'Asian & Sushi', emoji: '🍣' },
  { id: 'salads', label: 'Salads & Healthy', emoji: '🥗' },
  { id: 'sweets', label: 'Sweets & Bakery', emoji: '🍩' },
  { id: 'mexican', label: 'Mexican', emoji: '🌮' },
  { id: 'fastfood', label: 'Fast Food', emoji: '🍟' },
];

const DIETARY_OPTIONS = [
  { id: 'veg', label: 'Vegetarian', emoji: '🥗' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'gf', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'halal', label: 'Halal', emoji: '🌙' },
  { id: 'df', label: 'Dairy-Free', emoji: '🥛' },
];

const PRICE_RANGES = ['$ ', '$$ ', '$$$ ', '$$$$ '];

const DELIVERY_TIMES = [
  { value: 20, label: '< 20 min' },
  { value: 30, label: '< 30 min' },
  { value: 45, label: '< 45 min' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters: initialFilters,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(initialFilters);

  const toggleCuisine = (id: string) => {
    setLocalFilters((prev) => {
      const exists = prev.cuisines?.includes(id);
      const current = prev.cuisines || [];
      return {
        ...prev,
        cuisines: exists ? current.filter((c) => c !== id) : [...current, id],
      };
    });
  };

  const toggleDietary = (id: string) => {
    setLocalFilters((prev) => {
      const exists = prev.dietary.includes(id);
      return {
        ...prev,
        dietary: exists ? prev.dietary.filter((d) => d !== id) : [...prev.dietary, id],
      };
    });
  };

  const togglePrice = (price: string) => {
    setLocalFilters((prev) => {
      const exists = prev.priceRange.includes(price);
      return {
        ...prev,
        priceRange: exists ? prev.priceRange.filter((p) => p !== price) : [...prev.priceRange, price],
      };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetState: FilterOptions = {
      sortBy: 'popularity',
      cuisines: [],
      dietary: [],
      priceRange: [],
      maxDeliveryTime: null,
      minRating: null,
      onlyDiscounts: false,
    };
    setLocalFilters(resetState);
    onReset();
  };

  const activeFilterCount =
    (localFilters.sortBy !== 'popularity' ? 1 : 0) +
    (localFilters.cuisines?.length || 0) +
    localFilters.dietary.length +
    localFilters.priceRange.length +
    (localFilters.maxDeliveryTime ? 1 : 0) +
    (localFilters.minRating ? 1 : 0) +
    (localFilters.onlyDiscounts ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerTitleRow}>
              <Text style={styles.title}>Filter &amp; Sort</Text>
              {activeFilterCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeFilterCount}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Sort By Section */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.sortList}>
              {SORT_OPTIONS.map((opt) => {
                const selected = localFilters.sortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.sortRow, selected && styles.sortRowSelected]}
                    onPress={() => setLocalFilters({ ...localFilters, sortBy: opt.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sortLabelRow}>
                      <Ionicons
                        name={opt.icon as any}
                        size={18}
                        color={selected ? '#38BDF8' : '#64748B'}
                      />
                      <Text style={[styles.sortText, selected && styles.sortTextSelected]}>
                        {opt.label}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Special Offers & Discounts Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>🔥 Special Offers &amp; Discounts</Text>

                <Text style={styles.toggleSub}>Only show restaurants with active deals</Text>
              </View>
              <Switch
                value={localFilters.onlyDiscounts}
                onValueChange={(val) => setLocalFilters({ ...localFilters, onlyDiscounts: val })}
                trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
                thumbColor={localFilters.onlyDiscounts ? '#38BDF8' : '#94A3B8'}
              />
            </View>

            {/* Cuisine Categories */}
            <Text style={styles.sectionTitle}>Cuisine Category</Text>
            <View style={styles.chipGrid}>
              {CUISINE_OPTIONS.map((c) => {
                const selected = localFilters.cuisines?.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.filterChip, selected && styles.filterChipSelected]}
                    onPress={() => toggleCuisine(c.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipEmoji}>{c.emoji}</Text>
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                      {c.label}
                    </Text>
                    {selected && <Ionicons name="checkmark" size={14} color="#38BDF8" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dietary Preferences Section */}
            <Text style={styles.sectionTitle}>Dietary Preferences</Text>
            <View style={styles.chipGrid}>
              {DIETARY_OPTIONS.map((item) => {
                const selected = localFilters.dietary.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.filterChip, selected && styles.filterChipSelected]}
                    onPress={() => toggleDietary(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipEmoji}>{item.emoji}</Text>
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                      {item.label}
                    </Text>
                    {selected && <Ionicons name="checkmark" size={14} color="#38BDF8" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Price Range Section */}
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              {PRICE_RANGES.map((price) => {
                const selected = localFilters.priceRange.includes(price);
                return (
                  <TouchableOpacity
                    key={price}
                    style={[styles.priceBox, selected && styles.priceBoxSelected]}
                    onPress={() => togglePrice(price)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.priceText, selected && styles.priceTextSelected]}>
                      {price.trim()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Max Delivery Time */}
            <Text style={styles.sectionTitle}>Max Delivery Time</Text>
            <View style={styles.deliveryTimeRow}>
              {DELIVERY_TIMES.map((time) => {
                const selected = localFilters.maxDeliveryTime === time.value;
                return (
                  <TouchableOpacity
                    key={time.value}
                    style={[styles.timeChip, selected && styles.timeChipSelected]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        maxDeliveryTime: selected ? null : time.value,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="timer-outline"
                      size={16}
                      color={selected ? '#38BDF8' : '#64748B'}
                    />
                    <Text style={[styles.timeChipText, selected && styles.timeChipTextSelected]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Minimum Rating */}
            <Text style={styles.sectionTitle}>Minimum Rating</Text>
            <View style={styles.ratingRow}>
              {[4.5, 4.0, 3.5].map((rating) => {
                const selected = localFilters.minRating === rating;
                return (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingChip, selected && styles.ratingChipSelected]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        minRating: selected ? null : rating,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={[styles.ratingText, selected && styles.ratingTextSelected]}>
                      {rating}+ Stars
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Apply Filters</Text>
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
    maxHeight: '85%',
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 12,
  },
  headerTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  badge: {
    backgroundColor: '#38BDF8',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 12,
  },
  sortList: {
    gap: 8,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortRowSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  sortLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  sortTextSelected: {
    color: '#0284C7',
    fontWeight: '700',
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

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
  },
  toggleTitle: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  toggleSub: { fontSize: 12, color: '#B45309', marginTop: 2 },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  chipEmoji: {
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextSelected: {
    color: '#0284C7',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priceBox: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBoxSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  priceTextSelected: {
    color: '#FFFFFF',
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  timeChipSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  timeChipTextSelected: {
    color: '#0284C7',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  ratingChipSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  ratingTextSelected: {
    color: '#92400E',
    fontWeight: '700',
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
    gap: 12,
  },
  resetBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
