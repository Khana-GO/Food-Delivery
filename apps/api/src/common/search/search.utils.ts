/* eslint-disable no-control-regex */
// Note: control characters are stripped on purpose (they must never reach SQL
// patterns or prompts), which is why the no-control-regex rule is disabled here.

/**
 * Shared search/relevance engine used by restaurant search, menu-item search and
 * the unified /search endpoint.
 *
 * Design notes:
 * - Postgres `ILIKE '%term%'` alone cannot express synonyms, plurals or typos and
 *   orders results by insertion date (= arbitrary relevance). This module turns a
 *   raw user query into a set of *variants* that are used for the (indexed) SQL
 *   prefilter, then scores the bounded candidate set in JS so the final ordering
 *   reflects real relevance.
 * - Nothing here touches the database, so it is pure and unit-testable.
 */

/** Maximum number of characters accepted from a query (defensive). */
export const MAX_QUERY_LENGTH = 80;

/** Hard cap on SQL wildcard variants per token — keeps the prefilter index-friendly. */
export const MAX_VARIANTS_PER_TOKEN = 4;

/**
 * Canonical synonym groups. Each group lists terms that should be treated as the
 * same intent in both directions (momo <-> dumpling, chowmein <-> chow min).
 * Normalization only — no duplicate database rows are ever created.
 */
export const SYNONYM_GROUPS: string[][] = [
  [
    'momo',
    'momos',
    'mo mo',
    'dumpling',
    'dumplings',
    'dumpling momo',
    'kothey',
  ],
  [
    'chowmein',
    'chow mein',
    'chowmin',
    'chowmeen',
    'chowmein noodles',
    'noodles',
    'noodle',
  ],
  ['burger', 'burgers', 'hamburger', 'cheeseburger'],
  ['fries', 'fry', 'french fries', 'french fry', 'chips'],
  ['coffee', 'cafe', 'cafes', 'espresso', 'cappuccino', 'latte', 'americano'],
  ['tea', 'chiya', 'chai', 'milk tea', 'masala tea'],
  ['biryani', 'biriyani', 'biryanis', 'briyani'],
  ['pizza', 'pizzas', 'piza'],
  ['chicken', 'chiken', 'murgh', 'kukhura'],
  ['mutton', 'goat', 'lamb', 'khasi'],
  ['sekuwa', 'sekwa', 'sekuwaa', 'grill', 'grilled', 'bbq', 'barbecue'],
  ['thali', 'thakali', 'khana set', 'khana', 'set'],
  ['newari', 'newa', 'khaja', 'samay baji'],
  ['dhido', 'dhindo', 'fapar', 'kodo'],
  ['naan', 'nan', 'roti', 'tandoori roti'],
  ['tandoori', 'tandoor', 'tanduri'],
  ['bakery', 'bakeries', 'pastry', 'patisserie', 'cake', 'cakes'],
  ['dessert', 'desserts', 'sweet', 'sweets', 'mithai', 'ice cream'],
  ['lassi', 'buttermilk', 'mohi'],
  ['nepali', 'nepal', 'local'],
  ['indian', 'india', 'desi'],
  ['chinese', 'chinease', 'chinese food', 'indo chinese'],
  ['tibetan', 'tibet'],
  ['continental', 'italian', 'italian american'],
  ['fast food', 'fastfood', 'junk food', 'quick bite'],
  ['street food', 'streetfood', 'chowk food'],
  [
    'drink',
    'drinks',
    'beverage',
    'beverages',
    'mocktail',
    'cooler',
    'juice',
    'shake',
    'milkshake',
  ],
  ['soft drink', 'soda', 'coke', 'coca cola', 'pepsi'],
  ['buff', 'buffalo'],
  ['fish', 'machha', 'seafood'],
  ['kebab', 'kebabs', 'seekh', 'sikhar'],
  ['roll', 'rolls', 'kathi roll', 'spring roll'],
  ['sandwich', 'sandwiches', 'panini', 'sub'],
  ['soup', 'thukpa', 'broth'],
  ['burger house', 'burgerhub'],
];

/** term -> all other terms in the same group. Built once at module load. */
const SYNONYM_INDEX: Map<string, Set<string>> = (() => {
  const index = new Map<string, Set<string>>();
  for (const group of SYNONYM_GROUPS) {
    const normalized = group.map((term) => normalizeText(term));
    for (const term of normalized) {
      const bucket = index.get(term) ?? new Set<string>();
      for (const other of normalized) {
        if (other !== term) bucket.add(other);
      }
      index.set(term, bucket);
    }
  }
  return index;
})();

/**
 * Stop-words that carry no discovery signal on their own.
 *
 * Deliberately conservative: venue and food-type nouns (cafe, restaurant, hotel)
 * are NOT stop-words because "cafe" / "restaurant" are legitimate discovery
 * queries in this domain. When every token is a stop-word the raw tokens are
 * used instead (see `tokenize`), so "near me" still searches something.
 */
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'me',
  'my',
  'i',
  'is',
  'are',
  'am',
  'do',
  'does',
  'can',
  'could',
  'you',
  'your',
  'please',
  'pls',
  'want',
  'need',
  'get',
  'find',
  'search',
  'show',
  'for',
  'of',
  'in',
  'on',
  'at',
  'to',
  'with',
  'and',
  'or',
  'some',
  'any',
  'it',
  'near',
  'nearby',
  'around',
  'best',
  'top',
  'good',
  'cheap',
  'cheapest',
  'budget',
  'available',
  'open',
  'now',
  'right',
  'today',
  'deliver',
  'delivery',
  'order',
  'buy',
  'give',
  'item',
  'items',
  'dish',
  'dishes',
]);

/**
 * Lowercases, strips diacritics/punctuation/control characters and collapses
 * whitespace. Also normalizes common romanized Nepali variants so a single
 * canonical form drives both SQL patterns and scoring.
 */
export function normalizeText(input?: string | null): string {
  if (!input) return '';
  return (
    String(input)
      .slice(0, 400)
      .toLowerCase()
      .normalize('NFD')
      // strip combining diacritical marks
      .replace(/[\u0300-\u036f]/g, '')
      // strip control chars
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      // punctuation -> space (keeps intra-word hyphens as separators too)
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Lightweight stemming: handles the plural forms users actually type. */
export function singularize(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith('ies') && token.length > 4)
    return `${token.slice(0, -3)}y`;
  if (token.endsWith('ses') || token.endsWith('xes') || token.endsWith('zes')) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

/** Splits a normalized query into meaningful tokens (stop-words removed). */
export function tokenize(input?: string | null): string[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  const tokens = normalized.split(' ').filter(Boolean);
  const meaningful = tokens.filter((t) => !STOP_WORDS.has(t));
  // Never return an empty token list for a query that only had stop-words
  // (e.g. "near me") — fall back to the raw tokens so we still search something.
  return meaningful.length ? meaningful : tokens;
}

/** All known variants of a single token: the token, its singular/plural and synonyms. */
export function expandToken(token: string): string[] {
  const out = new Set<string>();
  const base = normalizeText(token);
  if (!base) return [];

  out.add(base);
  const singular = singularize(base);
  out.add(singular);
  if (singular !== base) out.add(singular);

  for (const key of [base, singular]) {
    const group = SYNONYM_INDEX.get(key);
    if (group) {
      for (const synonym of group) {
        out.add(synonym);
        out.add(singularize(synonym));
      }
    }
  }

  return [...out].filter((v) => v.length >= 2 || v === base);
}

/** Classic Levenshtein distance with an early-exit band (cheap for short tokens). */
export function levenshtein(a: string, b: string, maxDistance = 3): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;

  let previous = new Array<number>(b.length + 1);
  let current = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) previous[j] = j;

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    const swap = previous;
    previous = current;
    current = swap;
  }
  return previous[b.length];
}

/**
 * Typo budget scales with token length so short words ("piza" -> "pizza") accept
 * one edit while long words accept two.
 */
export function typoBudget(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 6) return 1;
  return 2;
}

/** True when `candidate` is within the typo budget of `token`. */
export function isFuzzyMatch(token: string, candidate: string): boolean {
  const budget = typoBudget(token);
  if (budget === 0) return false;
  // The first character must match. That keeps "piza" -> "pizza" and
  // "mommo" -> "momo" working while avoiding noise such as "momo" -> "tomo".
  // Dropped first letters are already covered by substring matching ("izza"
  // matches "Pizza" via ILIKE '%izza%'), so nothing is lost.
  if (token[0] !== candidate[0]) return false;
  if (Math.abs(token.length - candidate.length) > budget) return false;
  return levenshtein(token, candidate, budget) <= budget;
}

/** Vocabulary of real terms harvested from the database, used for fuzzy lookups. */
export interface SearchVocabulary {
  restaurantTerms: string[];
  dishTerms: string[];
  all: string[];
}

/**
 * Fuzzy-expands a token against a vocabulary. Returns vocabulary terms within the
 * typo budget, best (closest) first. Without a vocabulary the token is returned
 * unchanged, which keeps the engine useful even before the vocabulary is built.
 */
export function fuzzyExpand(
  token: string,
  vocabulary: string[] | undefined,
  max = 3,
): string[] {
  if (!vocabulary?.length || typoBudget(token) === 0) return [];
  const scored: { term: string; distance: number }[] = [];
  for (const candidate of vocabulary) {
    if (candidate === token) continue;
    if (candidate[0] !== token[0]) continue;
    if (Math.abs(candidate.length - token.length) > typoBudget(token)) continue;
    const distance = levenshtein(token, candidate, typoBudget(token));
    if (distance <= typoBudget(token))
      scored.push({ term: candidate, distance });
  }
  scored.sort(
    (a, b) => a.distance - b.distance || a.term.length - b.term.length,
  );
  return scored.slice(0, max).map((s) => s.term);
}

/** A resolved query: tokens plus every variant the SQL prefilter should look for. */
export interface SearchPlan {
  /** Normalized user query (trimmed to MAX_QUERY_LENGTH). */
  query: string;
  tokens: string[];
  /** One entry per token: every acceptable variant for that token. */
  tokenVariants: string[][];
  /** Flat, deduped list for building SQL ILIKE patterns. */
  allVariants: string[];
  /** Terms the user's spelling was corrected to (drives "did you mean"). */
  corrections: string[];
}

/**
 * Builds a SearchPlan, optionally typo-expanding tokens against a vocabulary.
 * `tokenVariants[n]` always contains the original token first.
 */
export function buildSearchPlan(
  rawQuery?: string | null,
  vocabulary?: string[],
): SearchPlan {
  const query = normalizeText(rawQuery).slice(0, MAX_QUERY_LENGTH);
  const tokens = tokenize(query);
  const corrections: string[] = [];

  const tokenVariants = tokens.map((token) => {
    const variants = expandToken(token);
    const fuzzy = fuzzyExpand(token, vocabulary);
    if (fuzzy.length) corrections.push(fuzzy[0]);
    for (const f of fuzzy) variants.push(f);
    // Deduplicate, keep order, drop single characters (noisy in ILIKE patterns).
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const v of variants) {
      if (v.length < 2 || seen.has(v)) continue;
      seen.add(v);
      ordered.push(v);
      if (ordered.length >= MAX_VARIANTS_PER_TOKEN) break;
    }
    return ordered.length ? ordered : [token];
  });

  const allVariants = [...new Set(tokenVariants.flat())];

  return { query, tokens, tokenVariants, allVariants, corrections };
}

/** Normalized SQL ILIKE pattern for a variant. */
export function ilikePattern(variant: string): string {
  return `%${variant.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
}

/** Words inside a field, used for word-prefix (not substring) matching. */
function fieldWords(field: string): string[] {
  return field.split(' ').filter(Boolean);
}

/**
 * Scores one field against one token's variants.
 * 100 exact field == token, 80 a whole word equals a variant, 55 a whole word
 * starts with a variant, 35 any substring hit, 0 no match.
 */
export function scoreField(
  field: string | null | undefined,
  variants: string[],
): number {
  const normalized = normalizeText(field);
  if (!normalized) return 0;

  let best = 0;
  const words = fieldWords(normalized);

  for (const variant of variants) {
    if (normalized === variant) return 100;
    if (words.some((w) => w === variant)) best = Math.max(best, 80);
    else if (words.some((w) => w.startsWith(variant)))
      best = Math.max(best, 55);
    else if (normalized.includes(variant)) best = Math.max(best, 35);
  }
  return best;
}

/**
 * Scores every token against a field and returns the *average* so that matching
 * more of a multi-word query always beats matching one word strongly
 * ("chicken momo" > "chicken" for a two-token query).
 */
export function scoreTokensAcrossField(
  field: string | null | undefined,
  tokenVariants: string[][],
): number {
  if (!tokenVariants.length) return 0;
  let total = 0;
  for (const variants of tokenVariants) total += scoreField(field, variants);
  return total / tokenVariants.length;
}

/** Haversine distance in km, rounded to 0.1 km. */
export function distanceKm(
  lat1?: number | null,
  lng1?: number | null,
  lat2?: number | null,
  lng2?: number | null,
): number | null {
  if (
    typeof lat1 !== 'number' ||
    typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lng2 !== 'number' ||
    Number.isNaN(lat1) ||
    Number.isNaN(lng1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lng2)
  ) {
    return null;
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const km = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  return Math.round(km * 10) / 10;
}

/** Numeric helper: tolerates numeric columns returned as strings by Postgres. */
export function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Popularity signal from review volume — log-scaled so 300 reviews != 10x 30. */
export function popularityScore(totalReviews: unknown): number {
  const reviews = toNumber(totalReviews, 0);
  if (reviews <= 0) return 0;
  return Math.min(60, Math.log10(reviews + 1) * 30);
}

export interface RestaurantRankInput {
  name?: string | null;
  cuisineType?: string | null;
  description?: string | null;
  address?: string | null;
  isOpen?: boolean | null;
  averageRating?: unknown;
  totalReviews?: unknown;
  deliveryFee?: unknown;
  estimatedDeliveryTime?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  /** Names/categories of this restaurant's dishes that matched the query. */
  matchedMenuTerms?: number;
}

export interface RankOptions {
  origin?: { lat: number; lng: number } | null;
  /** Force "open first" ordering regardless of the text score. */
  openFirst?: boolean;
}

/**
 * Relevance score for a restaurant. Text match dominates; quality, popularity,
 * availability and distance only break ties between comparably relevant results.
 */
export function scoreRestaurant(
  restaurant: RestaurantRankInput,
  plan: SearchPlan,
  options: RankOptions = {},
): number {
  let score = 0;
  const name = normalizeText(restaurant.name);

  if (plan.query) {
    if (name === plan.query) score += 1000;
    else if (name.startsWith(plan.query)) score += 620;

    const nameScore = scoreTokensAcrossField(
      restaurant.name,
      plan.tokenVariants,
    );
    const cuisineScore = scoreTokensAcrossField(
      restaurant.cuisineType,
      plan.tokenVariants,
    );
    const descriptionScore = scoreTokensAcrossField(
      restaurant.description,
      plan.tokenVariants,
    );
    const addressScore = scoreTokensAcrossField(
      restaurant.address,
      plan.tokenVariants,
    );

    score += nameScore * 6; // name relevance is the strongest signal
    score += cuisineScore * 3.4;
    score += descriptionScore * 1.1;
    score += addressScore * 0.6;

    // A restaurant that actually cooks the searched dish outranks one that only
    // mentions the word somewhere in its description.
    if (restaurant.matchedMenuTerms) {
      score += 260 * Math.min(restaurant.matchedMenuTerms, 2);
    }
  }

  score += Math.min(toNumber(restaurant.averageRating, 0), 5) * 22;
  score += popularityScore(restaurant.totalReviews);

  // Availability: available venues are easier to discover. Closed restaurants are
  // deprioritized (ordering only) instead of hidden, matching existing behaviour.
  if (restaurant.isOpen) score += 90;
  else if (options.openFirst) score -= 120;

  const eta = restaurant.estimatedDeliveryTime;
  if (typeof eta === 'number' && eta > 0)
    score += Math.max(0, 30 - Math.min(eta, 60)) * 0.6;

  const fee = toNumber(restaurant.deliveryFee, 0);
  if (fee === 0) score += 18;
  else if (fee > 0) score += Math.max(0, 12 - fee / 4);

  if (options.origin) {
    const km = distanceKm(
      options.origin.lat,
      options.origin.lng,
      restaurant.latitude,
      restaurant.longitude,
    );
    if (km !== null) score += Math.max(0, 60 - km * 20);
  }

  return Math.round(score * 100) / 100;
}

export interface DishRankInput {
  name?: string | null;
  description?: string | null;
  categoryName?: string | null;
  restaurantName?: string | null;
  restaurantCuisineType?: string | null;
  restaurantIsOpen?: boolean | null;
  restaurantRating?: unknown;
  restaurantEstimatedDeliveryTime?: number | null;
  restaurantLatitude?: number | null;
  restaurantLongitude?: number | null;
}

/** Relevance score for a menu item (dish). */
export function scoreDish(
  dish: DishRankInput,
  plan: SearchPlan,
  options: RankOptions = {},
): number {
  let score = 0;
  const name = normalizeText(dish.name);

  if (plan.query) {
    if (name === plan.query) score += 1200;
    else if (name.startsWith(plan.query)) score += 820;

    const nameScore = scoreTokensAcrossField(dish.name, plan.tokenVariants);
    const categoryScore = scoreTokensAcrossField(
      dish.categoryName,
      plan.tokenVariants,
    );
    const descriptionScore = scoreTokensAcrossField(
      dish.description,
      plan.tokenVariants,
    );
    const restaurantScore = scoreTokensAcrossField(
      dish.restaurantName,
      plan.tokenVariants,
    );
    const cuisineScore = scoreTokensAcrossField(
      dish.restaurantCuisineType,
      plan.tokenVariants,
    );

    score += nameScore * 7;
    score += categoryScore * 3;
    score += descriptionScore * 1.3;
    score += restaurantScore * 1.2;
    score += cuisineScore * 0.9;

    // All query tokens present in the dish name is a very strong signal.
    const nameWords = fieldWords(name);
    const allTokensInName = plan.tokenVariants.every((variants) =>
      variants.some((v) => nameWords.some((w) => w.startsWith(v))),
    );
    if (allTokensInName && plan.tokenVariants.length > 1) score += 400;
  }

  score += Math.min(toNumber(dish.restaurantRating, 0), 5) * 16;

  if (dish.restaurantIsOpen) score += 70;
  else if (options.openFirst) score -= 100;

  const eta = dish.restaurantEstimatedDeliveryTime;
  if (typeof eta === 'number' && eta > 0)
    score += Math.max(0, 30 - Math.min(eta, 60)) * 0.5;

  if (options.origin) {
    const km = distanceKm(
      options.origin.lat,
      options.origin.lng,
      dish.restaurantLatitude,
      dish.restaurantLongitude,
    );
    if (km !== null) score += Math.max(0, 50 - km * 18);
  }

  return Math.round(score * 100) / 100;
}

/**
 * "Did you mean X?" — returns the closest vocabulary term(s) to the query when
 * the query itself looks misspelled. Returns null when the query is already a
 * known term (or too short to guess).
 */
export function didYouMean(
  rawQuery: string | undefined | null,
  vocabulary: string[],
  max = 2,
): string[] {
  const query = normalizeText(rawQuery);
  if (!query || vocabulary.length === 0) return [];

  const words = query.split(' ').filter(Boolean);
  // Only suggest when the user typed something the vocabulary does not contain.
  if (words.length === 1 && vocabulary.includes(query)) return [];

  const suggestions: { term: string; distance: number }[] = [];

  for (const word of words) {
    if (word.length < 4) continue;
    const budget = typoBudget(word) + 1; // one extra edit for a suggestion
    let best: { term: string; distance: number } | null = null;
    for (const candidate of vocabulary) {
      if (candidate === word) {
        best = { term: candidate, distance: 0 };
        break;
      }
      if (candidate.length < 3) continue;
      if (candidate[0] !== word[0]) continue;
      if (Math.abs(candidate.length - word.length) > budget) continue;
      // Only compare against single words and the first word of multi-word terms.
      const candidateHead = candidate.split(' ')[0];
      if (candidateHead !== candidate && candidateHead !== word) continue;
      const distance = levenshtein(word, candidate, budget);
      if (distance <= budget && (!best || distance < best.distance)) {
        best = { term: candidate, distance };
      }
    }
    if (best && best.distance > 0) suggestions.push(best);
  }

  suggestions.sort((a, b) => a.distance - b.distance);
  return [...new Set(suggestions.map((s) => s.term))].slice(0, max);
}

/**
 * Stable comparator: highest relevance first, then rating, then review volume,
 * then name (deterministic — never insertion order).
 */
export function compareRelevance(
  a: { score: number; secondary?: number; tertiary?: number; label?: string },
  b: { score: number; secondary?: number; tertiary?: number; label?: string },
): number {
  if (b.score !== a.score) return b.score - a.score;
  if ((b.secondary ?? 0) !== (a.secondary ?? 0)) {
    return (b.secondary ?? 0) - (a.secondary ?? 0);
  }
  if ((b.tertiary ?? 0) !== (a.tertiary ?? 0)) {
    return (b.tertiary ?? 0) - (a.tertiary ?? 0);
  }
  return (a.label ?? '').localeCompare(b.label ?? '');
}
