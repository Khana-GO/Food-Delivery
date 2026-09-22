import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

/**
 * Expo config.
 *
 * Derived from app.json so the static values stay in one place, with the one
 * value that cannot be hardcoded injected here: the Google iOS URL scheme.
 *
 * It used to be a literal placeholder
 * ("com.googleusercontent.apps.YOUR_IOS_CLIENT_ID_REVERSED") which silently
 * broke native iOS Google sign-in. It is now derived from
 * EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and omitted entirely when unset, so a
 * placeholder URL scheme can never ship.
 */
const IOS_CLIENT_SUFFIX = '.apps.googleusercontent.com';

export function iosUrlSchemeFromClientId(
  clientId: string | undefined,
): string | undefined {
  if (!clientId) return undefined;
  const trimmed = clientId.trim();
  if (!trimmed) return undefined;
  if (trimmed.endsWith(IOS_CLIENT_SUFFIX)) {
    return `com.googleusercontent.apps.${trimmed.slice(0, -IOS_CLIENT_SUFFIX.length)}`;
  }
  // Already reversed (or a custom scheme) — use as provided.
  return trimmed;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = appJson.expo as unknown as ExpoConfig;
  const iosUrlScheme = iosUrlSchemeFromClientId(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  );

  const plugins = ((base.plugins ?? []) as unknown[]).map((plugin) => {
    const isGoogleSignin =
      plugin === '@react-native-google-signin/google-signin' ||
      (Array.isArray(plugin) &&
        plugin[0] === '@react-native-google-signin/google-signin');

    if (!isGoogleSignin) return plugin;

    if (!iosUrlScheme) {
      // No configured scheme: register the plugin without a bogus option.
      return '@react-native-google-signin/google-signin';
    }

    return ['@react-native-google-signin/google-signin', { iosUrlScheme }];
  }) as ExpoConfig['plugins'];

  return {
    ...base,
    ...config,
    plugins,
  };
};
