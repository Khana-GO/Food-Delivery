declare module '@expo/vector-icons' {
  import * as React from 'react';
  export const MaterialCommunityIcons: React.ComponentType<any>;
  export const Ionicons: React.ComponentType<any>;
  export const Feather: React.ComponentType<any>;
}

declare module '@react-native-async-storage/async-storage' {
  export function getItem(key: string): Promise<string | null>;
  export function setItem(key: string, value: string): Promise<void>;
  export function removeItem(key: string): Promise<void>;
  export default {
    getItem: (key: string) => Promise.resolve<string | null>(null),
    setItem: (key: string, value: string) => Promise.resolve(),
    removeItem: (key: string) => Promise.resolve(),
  };
}
