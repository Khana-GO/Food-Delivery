import React from 'react';
import { View, ViewProps, TouchableOpacity } from 'react-native';

interface CardProps extends ViewProps {
  onPress?: () => void;
  className?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  className = '',
  style,
  elevation = 'sm',
  ...props
}) => {
  const getElevationStyle = () => {
    switch (elevation) {
      case 'none': return {};
      case 'sm': return { shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 };
      case 'md': return { shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 };
      case 'lg': return { shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 };
      default: return {};
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      className={`bg-white rounded-[16px] overflow-hidden ${className}`}
      style={[getElevationStyle(), style]}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      {...(props as any)}
    >
      {children}
    </Container>
  );
};
