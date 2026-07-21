import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuthStore, AuthRole } from '@/store/authStore';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export function RoleSwitcher() {
  const { activeRole, availableRoles, switchRole } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  // If user only has 1 role, don't show the switcher
  if (!availableRoles || availableRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = (role: AuthRole) => {
    if (role === activeRole) {
      setModalVisible(false);
      return;
    }
    
    switchRole(role);
    setModalVisible(false);

    // Navigate to the correct stack
    if (role === 'RESTAURANT_OWNER') {
      router.replace('/(restaurant)' as any);
    } else if (role === 'DRIVER') {
      router.replace('/(driver)' as any);
    } else if (role === 'ADMIN') {
      router.replace('/(admin)' as any);
    } else {
      router.replace('/(customer)' as any);
    }
  };

  const getRoleDisplayName = (role: AuthRole) => {
    switch (role) {
      case 'CUSTOMER': return 'Customer';
      case 'RESTAURANT_OWNER': return 'Restaurant Owner';
      case 'DRIVER': return 'Delivery Partner';
      case 'ADMIN': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.switchButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.switchButtonText}>Switch Role (Current: {getRoleDisplayName(activeRole)})</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Choose your role</Text>
            
            {availableRoles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleItem,
                  activeRole === role && styles.roleItemActive
                ]}
                onPress={() => handleRoleSwitch(role)}
              >
                <Text style={[
                  styles.roleItemText,
                  activeRole === role && styles.roleItemTextActive
                ]}>
                  {getRoleDisplayName(role)}
                </Text>
                {activeRole === role && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  switchButton: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: Radius.xl,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    ...Shadow.sm,
  },
  switchButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: 24,
    paddingBottom: 40,
    width: '100%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 16,
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    marginBottom: 8,
    backgroundColor: Colors.backgroundAlt,
  },
  roleItemActive: {
    backgroundColor: Colors.primary + '1A', // 10% opacity
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  roleItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  roleItemTextActive: {
    color: Colors.primary,
  },
  checkIcon: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
