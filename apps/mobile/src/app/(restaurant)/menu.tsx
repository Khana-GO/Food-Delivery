import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  priceNpr: number;
  inStock: boolean;
  image: string;
}

const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Western BBQ Cheeseburger',
    category: 'Burgers',
    priceNpr: 669,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop',
  },
  {
    id: 'm2',
    name: 'Double Angus Classic',
    category: 'Burgers',
    priceNpr: 599,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop',
  },
  {
    id: 'm3',
    name: 'Crispy Onion Rings',
    category: 'Sides',
    priceNpr: 250,
    inStock: false,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&auto=format&fit=crop',
  },
];

export default function RestaurantMenuScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Burgers');

  const toggleStock = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  };

  const handleAddItem = () => {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert('Missing Info', 'Please enter item name and price.');
      return;
    }

    const newItem: MenuItem = {
      id: 'm_' + Date.now(),
      name: newName.trim(),
      category: newCategory,
      priceNpr: parseFloat(newPrice) || 300,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop',
    };

    setMenuItems([newItem, ...menuItems]);
    setAddModalOpen(false);
    setNewName('');
    setNewPrice('');
    Alert.alert('Item Added 🍔', `"${newItem.name}" added to menu!`);
  };

  const handleDeleteItem = (id: string, name: string) => {
    Alert.alert('Delete Dish', `Remove "${name}" from menu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setMenuItems((prev) => prev.filter((i) => i.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalOpen(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 14 }}>
        <View style={styles.itemsList}>
          {menuItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImg} />

              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>Rs. {item.priceNpr}</Text>
              </View>

              <View style={styles.stockControl}>
                <Text style={[styles.stockText, { color: item.inStock ? '#166534' : '#991B1B' }]}>
                  {item.inStock ? 'IN STOCK' : 'OUT'}
                </Text>
                <Switch
                  value={item.inStock}
                  onValueChange={() => toggleStock(item.id)}
                  trackColor={{ false: '#FEE2E2', true: '#DCFCE7' }}
                  thumbColor={item.inStock ? '#22C55E' : '#EF4444'}
                />

                <TouchableOpacity
                  onPress={() => handleDeleteItem(item.id, item.name)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add New Item Modal */}
      <Modal visible={addModalOpen} animationType="slide" transparent onRequestClose={() => setAddModalOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Add New Menu Item</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Image Upload Trigger */}
            <TouchableOpacity style={styles.imagePickerBox} onPress={() => Alert.alert('Image Selected 📸', 'Sample image attached!')}>
              <Ionicons name="camera-outline" size={28} color="#38BDF8" />
              <Text style={styles.imagePickerText}>Tap to Upload Dish Photo</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Dish Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Spicy Chicken Burger"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.label}>Price (NPR Rs.)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 450"
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.catRow}>
              {['Burgers', 'Pizza', 'Sides', 'Drinks'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, newCategory === cat && styles.catChipSelected]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.catChipText, newCategory === cat && styles.catChipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveItemBtn} onPress={handleAddItem}>
              <Text style={styles.saveItemText}>Save Menu Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B', flex: 1, marginLeft: 12 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  itemsList: { paddingHorizontal: 16, gap: 12 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  itemImg: { width: 64, height: 64, borderRadius: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  itemCategory: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '800', color: '#38BDF8', marginTop: 4 },

  stockControl: { alignItems: 'flex-end', gap: 4 },
  stockText: { fontSize: 10, fontWeight: '800' },
  deleteBtn: { padding: 4, marginTop: 4 },

  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },

  imagePickerBox: {
    height: 100,
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  imagePickerText: { fontSize: 13, color: '#0284C7', fontWeight: '700' },

  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, height: 46, fontSize: 14, color: '#1E293B' },

  catRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  catChipSelected: { backgroundColor: '#1E293B' },
  catChipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  catChipTextSelected: { color: '#FFFFFF' },

  saveItemBtn: { backgroundColor: '#1E293B', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  saveItemText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
