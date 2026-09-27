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

/**
 * The API rejects order creation with a `PHONE_REQUIRED` error code when the
 * account has no phone number (e.g. a Google sign-up). Callers use this to send
 * the customer to the "add phone number" flow instead of a generic error alert.
 */
export const isPhoneRequiredError = (error: unknown): boolean => {
  const data = (error as AxiosError)?.response?.data as
    | { errorCode?: string; message?: string | string[] }
    | undefined;

  if (data?.errorCode === 'PHONE_REQUIRED') return true;

  // Fall back to matching the message in case a proxy strips the error code.
  const messages = Array.isArray(data?.message)
    ? data!.message as string[]
    : typeof data?.message === 'string'
      ? [data!.message as string]
      : [];
  return messages.some((m) => /phone number is required/i.test(m));
};
