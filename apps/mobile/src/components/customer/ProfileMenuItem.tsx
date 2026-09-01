import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

interface Props {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  badge?: number;
  rightIcon?: React.ReactNode;
  customIcon?: React.ReactNode;
}

export const ProfileMenuItem = ({ icon, label, onPress, badge, rightIcon, customIcon }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={styles.iconWrap}>
        {customIcon || <Feather name={icon} size={16} color={Colors.primary} />}
      </View>
      <Text style={styles.label}>{label}</Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
      {rightIcon || <Feather name="chevron-right" size={16} color="#CBD5E1" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FEE2E2',
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark, letterSpacing: -0.1 },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginRight: 4,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
