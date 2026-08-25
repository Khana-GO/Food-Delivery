import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';

// Nativewind only patches react-native core components automatically.
// Third-party components must be registered explicitly or `className`
// props are silently ignored (images render with zero size).
cssInterop(Image, {
  className: 'style',
});
