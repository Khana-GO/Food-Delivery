import { AxiosError } from 'axios';

/**
 * NestJS returns `message` as a string for most errors but as an array of
 * strings for ValidationPipe (400) errors. Passing an array straight to
 * Alert.alert() crashes on Android with:
 *   "value for message cannot be cast from ReadableNativeArray to string"
 * This always returns a displayable string.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  const data = (error as AxiosError)?.response?.data as
    | { message?: string | string[] }
    | undefined;

  const message = data?.message;

  if (Array.isArray(message)) {
    return message.join('\n');
  }
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  const raw = (error as Error)?.message;
  if (typeof raw === 'string' && raw.length > 0 && raw !== 'Network Error') {
    return raw;
  }

  return fallback;
};
