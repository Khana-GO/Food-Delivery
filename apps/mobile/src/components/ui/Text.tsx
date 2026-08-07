import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { Colors } from '../../constants/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption';
  weight?: 'regular' | 'medium' | 'bold' | 'black';
  color?: string;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'regular',
  color = Colors.text,
  className,
  style,
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'h1': return { fontSize: 32, lineHeight: 40, fontWeight: 'bold' as const };
      case 'h2': return { fontSize: 24, lineHeight: 32, fontWeight: 'bold' as const };
      case 'h3': return { fontSize: 20, lineHeight: 28, fontWeight: 'bold' as const };
      case 'h4': return { fontSize: 18, lineHeight: 24, fontWeight: 'bold' as const };
      case 'body': return { fontSize: 16, lineHeight: 24 };
      case 'bodySmall': return { fontSize: 14, lineHeight: 20 };
      case 'caption': return { fontSize: 12, lineHeight: 16 };
      default: return { fontSize: 16, lineHeight: 24 };
    }
  };

  const getWeightStyle = () => {
    switch (weight) {
      case 'regular': return { fontWeight: '400' as const };
      case 'medium': return { fontWeight: '500' as const };
      case 'bold': return { fontWeight: '700' as const };
      case 'black': return { fontWeight: '900' as const };
      default: return {};
    }
  };

  return (
    <RNText
      style={[
        getVariantStyles(),
        getWeightStyle(),
        { color },
        style,
      ]}
      className={className}
      {...props}
    >
      {children}
    </RNText>
  );
};
