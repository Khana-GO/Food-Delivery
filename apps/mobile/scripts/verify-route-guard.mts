/* Temporary verification harness for resolveRouteGuard (ERR-024). */
import { resolveRouteGuard } from '../src/lib/roles';

type Case = {
  name: string;
  input: {
    segments: string[];
    isAuthenticated: boolean;
    role: 'ADMIN' | 'CUSTOMER' | 'DRIVER' | 'RESTAURANT_OWNER' | null;
    isInitializing: boolean;
  };
  expected: string | null;
};

const authed = (role: Case['input']['role']) => ({
  isAuthenticated: true as const,
  role,
  isInitializing: false as const,
});

const cases: Case[] = [
  {
    name: 'customer stays in customer group',
    input: { segments: ['(customer)', 'orders'], ...authed('CUSTOMER') },
    expected: null,
  },
  {
    name: 'customer deep-links into admin screens',
    input: { segments: ['(admin)', 'users'], ...authed('CUSTOMER') },
    expected: '/(customer)',
  },
  {
    name: 'driver deep-links into owner screens',
    input: { segments: ['(restaurant-owner)', 'menu'], ...authed('DRIVER') },
    expected: '/(driver)',
  },
  {
    name: 'admin deep-links into customer screens',
    input: { segments: ['(customer)', 'cart'], ...authed('ADMIN') },
    expected: '/(admin)',
  },
  {
    name: 'expired session on a customer screen',
    input: {
      segments: ['(customer)', 'orders'],
      isAuthenticated: false,
      role: null,
      isInitializing: false,
    },
    expected: '/(auth)/login',
  },
  {
    name: 'expired session on an admin screen',
    input: {
      segments: ['(admin)', 'users'],
      isAuthenticated: false,
      role: null,
      isInitializing: false,
    },
    expected: '/(auth)/login',
  },
  {
    name: 'authenticated user sitting on the login screen',
    input: { segments: ['(auth)', 'login'], ...authed('CUSTOMER') },
    expected: '/(customer)',
  },
  {
    name: 'splash while the session is restoring',
    input: {
      segments: [],
      isAuthenticated: false,
      role: null,
      isInitializing: true,
    },
    expected: null,
  },
  {
    name: 'splash after restore, logged in',
    input: { segments: [], ...authed('DRIVER') },
    expected: null,
  },
  {
    name: 'splash when signed out',
    input: {
      segments: [],
      isAuthenticated: false,
      role: null,
      isInitializing: false,
    },
    expected: null,
  },
  {
    name: 'onboarding when signed out',
    input: {
      segments: ['onboarding'],
      isAuthenticated: false,
      role: null,
      isInitializing: false,
    },
    expected: null,
  },
  {
    name: 'login screen when signed out',
    input: {
      segments: ['(auth)', 'login'],
      isAuthenticated: false,
      role: null,
      isInitializing: false,
    },
    expected: null,
  },
  {
    name: 'onboarding when logged in',
    input: { segments: ['onboarding'], ...authed('RESTAURANT_OWNER') },
    expected: null,
  },
];

let failures = 0;
for (const testCase of cases) {
  const actual = resolveRouteGuard(testCase.input);
  const ok = actual === testCase.expected;
  if (!ok) failures++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${testCase.name} => ${actual}${
      ok ? '' : `  (expected ${testCase.expected})`
    }`,
  );
}

console.log(
  failures === 0
    ? `ALL ${cases.length} GUARD CASES PASS`
    : `${failures} FAILURES`,
);
process.exit(failures === 0 ? 0 : 1);
