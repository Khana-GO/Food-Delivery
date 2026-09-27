/**
 * Shared mobile-number rules for customer accounts.
 *
 * Customers who sign in with Google are created without a phone number, so the
 * "add your number" flow can be reached from several places (post-login
 * onboarding, cart, checkout). Keeping the validation here means all of them
 * behave identically and stay aligned with the API's
 * `/^\+?[1-9]\d{1,14}$/` rule in `update-user.dto.ts`.
 */
export const PHONE_LENGTH = 10;

export const PHONE_REGEX = /^[0-9]{10}$/;

/** Digits only, capped at PHONE_LENGTH — used while the user is typing. */
export const sanitizePhone = (value: string): string =>
  value.replace(/[^0-9]/g, '').slice(0, PHONE_LENGTH);

/**
 * Returns an error message, or null when the number is acceptable.
 * Rejects a leading zero because the API only accepts numbers starting 1-9.
 */
export const validatePhone = (value: string): string | null => {
  const phone = (value ?? '').trim();
  if (!phone) return 'Phone number is required';
  if (!/^[0-9]+$/.test(phone)) return 'Phone number can only contain digits';
  if (!PHONE_REGEX.test(phone)) return `Phone number must be exactly ${PHONE_LENGTH} digits`;
  if (phone.startsWith('0')) return 'Phone number cannot start with 0';
  return null;
};

/** Ordering is gated on the account having a phone number. */
export const hasPhone = (user?: { phone?: string | null } | null): boolean =>
  !!user?.phone?.trim();

/** Masks all but the last 4 digits, e.g. 98XXXXXXXX -> ******7890 */
export const maskPhone = (value?: string | null): string => {
  const phone = (value ?? '').trim();
  if (!phone) return '';
  if (phone.length <= 4) return phone;
  return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`;
};
