import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface Props {
  onEdit: () => void;
  onRemovePhoto?: () => void;
  canRemovePhoto?: boolean;
  top?: number;
  right?: number;
}

export const ProfileActionsMenu = ({
  onEdit,
  onRemovePhoto,
  canRemovePhoto,
  top,
  right,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    setOpen(false);
    onEdit();
  };

  const handleRemove = () => {
    setOpen(false);
    onRemovePhoto?.();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={[styles.dotBtn, { top: top ?? insets.top + 6, right: right ?? 16 }]}
      >
        <Feather name="more-horizontal" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <TouchableOpacity style={styles.row} onPress={handleEdit} activeOpacity={0.7}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="edit-2" size={16} color={Colors.primary} />
              </View>
              <Text style={[styles.rowText, { color: Colors.textDark }]}>Edit Profile</Text>
            </TouchableOpacity>

            {canRemovePhoto && onRemovePhoto ? (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.row} onPress={handleRemove} activeOpacity={0.7}>
                  <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </View>
                  <Text style={[styles.rowText, { color: '#EF4444' }]}>Remove Photo</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.row, { justifyContent: 'center' }]}
              onPress={() => setOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowText, { color: Colors.textSecondary, fontWeight: '700' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dotBtn: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    paddingVertical: 6,
    paddingHorizontal: 10,
    ...Shadow.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowText: { fontSize: 15, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EEF2F7', marginHorizontal: 10 },
});