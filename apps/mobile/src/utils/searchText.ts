/**
 * Client-side search text helpers.
 *
 * The API is the source of truth for search (relevance, ranking, typo tolerance,
 * suggestions). These helpers exist only for the *local* filtering the app already
 * does on data it has in memory (Home's inline search, category matching, filter
 * pills) so on-device matching behaves the same way as the backend:
 * partial words ("mom"), plurals ("momos") and common variants ("chow min").
 *
 * Keep the synonym groups aligned with
 * apps/api/src/common/search/search.utils.ts (normalization only — never used to
 * create or rename data).
 */

const SYNONYM_GROUPS: string[][] = [
  ['momo', 'momos', 'dumpling', 'dumplings', 'kothey'],
  ['chowmein', 'chow mein', 'chowmin', 'chowmeen', 'noodles', 'noodle'],
  ['burger', 'burgers', 'hamburger'],
  ['fries', 'french fries', 'chips'],
  ['coffee', 'cafe', 'espresso', 'cappuccino', 'latte'],
  ['tea', 'chiya', 'chai'],
  ['biryani', 'biriyani'],
  ['pizza', 'pizzas'],
  ['chicken', 'kukhura'],
  ['mutton', 'goat', 'khasi'],
  ['sekuwa', 'sekwa', 'bbq', 'grill'],
  ['thali', 'thakali', 'khana set'],
  ['newari', 'khaja', 'samay baji'],
  ['dhido', 'dhindo', 'fapar', 'kodo'],
  ['naan', 'nan', 'roti'],
  ['tandoori', 'tandoor'],
  ['bakery', 'pastry', 'patisserie'],
  ['dessert', 'desserts', 'sweet', 'ice cream'],
  ['drink', 'drinks', 'beverage', 'milkshake', 'shake', 'mocktail'],
  ['nepali', 'nepal'],
  ['indian', 'mughlai', 'tandoori'],
  ['chinese', 'schezwan', 'manchurian'],
  ['fast food', 'fastfood'],
  ['street food', 'streetfood'],
  ['breakfast', 'nasta'],
];

const SYNONYM_INDEX: Map<string, string[]> = (() => {
  const index = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    const normalized = group.map((t) => normalizeSearchText(t));
    for (const term of normalized) {
      index.set(
        term,
        normalized.filter((other) => other !== term),
      );
    }
  }
  return index;
})();

/** Lowercase, strip accents/punctuation, collapse whitespace. */
export function normalizeSearchText(input?: string | null): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Simple plural stemming so "momos" matches "momo". */
export function singularizeToken(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

/** All acceptable forms of a token (itself, its singular and its synonyms). */
export function expandSearchToken(token: string): string[] {
  const base = normalizeSearchText(token);
  if (!base) return [];
  const out = new Set<string>([base]);
  const singular = singularizeToken(base);
  out.add(singular);
  for (const key of [base, singular]) {
    for (const synonym of SYNONYM_INDEX.get(key) ?? []) {
      out.add(synonym);
      out.add(singularizeToken(synonym));
    }
  }
  return [...out];
}

/** Query tokens with synonyms already applied. */
export function expandSearchQuery(query?: string | null): string[][] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((token) => expandSearchToken(token));
}

/**
 * True when every query token is found (prefix or substring) in at least one of
 * the supplied fields. Matching is normalization + synonym aware, so
 * `matchesQuery(['Chicken Momo'], 'mom')` is true.
 */
export function matchesQuery(
  fields: Array<string | null | undefined>,
  query?: string | null,
): boolean {
  const tokenVariants = expandSearchQuery(query);
  if (!tokenVariants.length) return true;

  const haystack = fields
    .map((f) => normalizeSearchText(f))
    .filter(Boolean)
    .join(' ');
  if (!haystack) return false;

  const words = haystack.split(' ');
  return tokenVariants.every((variants) =>
    variants.some(
      (variant) =>
        haystack.includes(variant) ||
        words.some((word) => word.startsWith(variant)),
    ),
  );
}

/** Convenience helper for a restaurant search across its discovery fields. */
export function restaurantMatchesQuery(
  restaurant: {
    name?: string | null;
    cuisineType?: string | null;
    description?: string | null;
    address?: string | null;
  },
  query?: string | null,
): boolean {
  return matchesQuery(
    [
      restaurant.name,
      restaurant.cuisineType,
      restaurant.description,
      restaurant.address,
    ],
    query,
  );
}

/** Convenience helper for a dish search (name, description, selling venue). */
export function dishMatchesQuery(
  item: {
    name?: string | null;
    description?: string | null;
    restaurantName?: string | null;
    categoryName?: string | null;
  },
  query?: string | null,
): boolean {
  return matchesQuery(
    [item.name, item.description, item.restaurantName, item.categoryName],
    query,
  );
}

/**
 * True when a term matches a category name, tolerating plurals and partial words
 * ("Momo" vs "Momos & Noodles", "Cafe" vs "Cafes & Bakeries").
 */
export function matchesCategoryName(
  categoryName?: string | null,
  term?: string | null,
): boolean {
  const haystack = normalizeSearchText(categoryName);
  const needle = normalizeSearchText(term);
  if (!haystack || !needle) return false;
  if (haystack === needle || haystack.includes(needle) || needle.includes(haystack)) {
    return true;
  }
  const haystackSingular = singularizeToken(haystack);
  const needleSingular = singularizeToken(needle);
  if (needleSingular.length >= 3 && haystack.includes(needleSingular)) return true;
  if (haystackSingular.length >= 3 && needle.includes(haystackSingular)) return true;
  return expandSearchToken(needle).some(
    (variant) => variant.length >= 3 && haystack.includes(variant),
  );
}
