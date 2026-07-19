import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

export interface TextProps extends RNTextProps {
  // Add any custom props here if needed later
}

export function Text(props: TextProps) {
  const { style, ...rest } = props;

  let fontFamily = 'Poppins_400Regular';
  let incomingFontWeight: string | undefined;

  if (style) {
    const flattened = StyleSheet.flatten(style);
    if (flattened.fontWeight) {
      incomingFontWeight = String(flattened.fontWeight);
    }
  }

  switch (incomingFontWeight) {
    case '100':
    case '200':
    case '300':
      fontFamily = 'Poppins_300Light';
      break;
    case '400':
    case 'normal':
      fontFamily = 'Poppins_400Regular';
      break;
    case '500':
      fontFamily = 'Poppins_500Medium';
      break;
    case '600':
      fontFamily = 'Poppins_600SemiBold';
      break;
    case 'bold':
    case '700':
      fontFamily = 'Poppins_700Bold';
      break;
    case '800':
      fontFamily = 'Poppins_800ExtraBold';
      break;
    case '900':
      fontFamily = 'Poppins_900Black';
      break;
  }

  const overrideStyle = { fontFamily };
  let finalStyle = [style, overrideStyle];
  
  if (incomingFontWeight) {
    const flattened = StyleSheet.flatten(style);
    const { fontWeight, ...styleWithoutWeight } = flattened as any;
    finalStyle = [styleWithoutWeight, overrideStyle];
  }

  return <RNText style={finalStyle} {...rest} />;
}
