import {
  buildSearchPlan,
  compareRelevance,
  didYouMean,
  distanceKm,
  expandToken,
  fuzzyExpand,
  ilikePattern,
  isFuzzyMatch,
  levenshtein,
  normalizeText,
  scoreDish,
  scoreRestaurant,
  tokenize,
} from './search.utils';
import { FOOD_VOCABULARY_UNIQUE } from './search.vocabulary';

describe('search.utils', () => {
  describe('normalization', () => {
    it('lowercases, strips punctuation and collapses whitespace', () => {
      expect(normalizeText('  Chicken   Momo!! ')).toBe('chicken momo');
      expect(normalizeText('Café')).toBe('cafe');
      expect(normalizeText("Roadhouse's Pizza")).toBe('roadhouse s pizza');
      expect(normalizeText(null)).toBe('');
      expect(normalizeText(undefined)).toBe('');
    });

    it('strips control characters so prompt/SQL payloads stay clean', () => {
      expect(normalizeText('momo\u0000\u001f pizza')).toBe('momo pizza');
    });
  });

  describe('tokenize', () => {
    it('drops filler words but keeps the food intent', () => {
      expect(tokenize('I want some chicken momo near me')).toEqual([
        'chicken',
        'momo',
      ]);
      expect(tokenize('show me cafes')).toEqual(['cafes']);
    });

    it('never returns an empty token list for a non-empty query', () => {
      expect(tokenize('near me')).toEqual(['near', 'me']);
      expect(tokenize('')).toEqual([]);
    });
  });

  describe('synonyms & plurals', () => {
    it('expands known food variants both ways', () => {
      expect(expandToken('momo')).toEqual(
        expect.arrayContaining(['momo', 'momos', 'dumplings']),
      );
      expect(expandToken('chowmin')).toEqual(
        expect.arrayContaining(['chowmein']),
      );
      expect(expandToken('fries')).toEqual(
        expect.arrayContaining(['french fries']),
      );
      expect(expandToken('tea')).toEqual(expect.arrayContaining(['chiya']));
      expect(expandToken('coffee')).toEqual(expect.arrayContaining(['cafe']));
      expect(expandToken('biriyani')).toEqual(
        expect.arrayContaining(['biryani']),
      );
    });

    it('handles simple plurals even without an explicit synonym', () => {
      expect(expandToken('wings')).toEqual(expect.arrayContaining(['wing']));
    });
  });

  describe('typo tolerance', () => {
    it('computes edit distance', () => {
      expect(levenshtein('momo', 'momo')).toBe(0);
      expect(levenshtein('mommo', 'momo')).toBe(1);
      expect(levenshtein('piza', 'pizza')).toBe(1);
      expect(levenshtein('coffe', 'coffee')).toBe(1);
      expect(levenshtein('chiken', 'chicken')).toBe(1);
    });

    it('tolerates transpositions and single edits for longer words', () => {
      expect(isFuzzyMatch('chowmin', 'chowmein')).toBe(true);
      expect(isFuzzyMatch('piza', 'pizza')).toBe(true);
      // Very short tokens get no typo budget: "tea" must not match "pea"/"sea".
      expect(isFuzzyMatch('tea', 'pea')).toBe(false);
      expect(isFuzzyMatch('momo', 'tomo')).toBe(false);
    });

    it('expands a misspelling against the lexicon', () => {
      expect(fuzzyExpand('mommo', FOOD_VOCABULARY_UNIQUE)).toContain('momo');
      expect(fuzzyExpand('piza', FOOD_VOCABULARY_UNIQUE)).toContain('pizza');
      expect(fuzzyExpand('coffe', FOOD_VOCABULARY_UNIQUE)).toContain('coffee');
      expect(fuzzyExpand('chiken', FOOD_VOCABULARY_UNIQUE)).toContain(
        'chicken',
      );
      // Exact words are not "corrected".
      expect(fuzzyExpand('momo', FOOD_VOCABULARY_UNIQUE)).not.toContain('momo');
    });
  });

  describe('buildSearchPlan', () => {
    it('builds variants per token and records corrections', () => {
      const plan = buildSearchPlan('mommo', FOOD_VOCABULARY_UNIQUE);
      expect(plan.query).toBe('mommo');
      expect(plan.corrections).toContain('momo');

      const variants = plan.tokenVariants[0];
      expect(variants[0]).toBe('mommo');
      expect(variants).toContain('momo');
      expect(plan.allVariants).toContain('momo');
    });

    it('keeps every token of a multi-word query', () => {
      const plan = buildSearchPlan('chicken momo', FOOD_VOCABULARY_UNIQUE);
      expect(plan.tokens).toEqual(['chicken', 'momo']);
      expect(plan.tokenVariants).toHaveLength(2);
      expect(plan.tokenVariants[1]).toContain('momos');
    });

    it('caps the number of SQL variants per token', () => {
      const plan = buildSearchPlan('drinks', FOOD_VOCABULARY_UNIQUE);
      for (const variants of plan.tokenVariants) {
        expect(variants.length).toBeLessThanOrEqual(4);
      }
    });

    it('drops stop-words so "momo near me" still searches momo', () => {
      const plan = buildSearchPlan('momo near me', FOOD_VOCABULARY_UNIQUE);
      expect(plan.tokens).toEqual(['momo']);
    });

    it('is bounded for very long input', () => {
      const plan = buildSearchPlan('m'.repeat(500), FOOD_VOCABULARY_UNIQUE);
      expect(plan.query.length).toBeLessThanOrEqual(80);
    });
  });

  describe('sql pattern safety', () => {
    it('escapes LIKE wildcards', () => {
      expect(ilikePattern('50%')).toBe('%50\\%%');
      expect(ilikePattern('a_b')).toBe('%a\\_b%');
    });
  });

  describe('restaurant ranking', () => {
    const plan = buildSearchPlan('chicken momo', FOOD_VOCABULARY_UNIQUE);

    it('ranks an exact name match above a partial match', () => {
      const exact = scoreRestaurant(
        { name: 'Chicken Momo', isOpen: true },
        plan,
      );
      const partial = scoreRestaurant(
        { name: 'Hamro Momo Hub', description: 'chicken dishes', isOpen: true },
        plan,
      );
      expect(exact).toBeGreaterThan(partial);
    });

    it('ranks a dish-serving restaurant above one that only mentions the word', () => {
      const serves = scoreRestaurant(
        {
          name: 'Hamro Momo Hub',
          cuisineType: 'Momo, Nepali',
          isOpen: true,
          matchedMenuTerms: 2,
        },
        plan,
      );
      const mentions = scoreRestaurant(
        {
          name: 'Random Cafe',
          description: 'we used to serve chicken momo long ago',
          isOpen: true,
          matchedMenuTerms: 0,
        },
        plan,
      );
      expect(serves).toBeGreaterThan(mentions);
    });

    it('matches cuisine and location text, not just the name', () => {
      const cuisine = scoreRestaurant(
        { name: 'Roadhouse Cafe', cuisineType: 'Italian, Pizza', isOpen: true },
        buildSearchPlan('pizza', FOOD_VOCABULARY_UNIQUE),
      );
      const address = scoreRestaurant(
        {
          name: 'Roadhouse Cafe',
          address: 'Pizza Street, Butwal',
          isOpen: true,
        },
        buildSearchPlan('pizza', FOOD_VOCABULARY_UNIQUE),
      );
      expect(cuisine).toBeGreaterThan(address);
      expect(address).toBeGreaterThan(0);
    });

    it('deprioritizes closed venues without hiding them', () => {
      const open = scoreRestaurant({ name: 'Momo Hub', isOpen: true }, plan, {
        openFirst: true,
      });
      const closed = scoreRestaurant(
        { name: 'Momo Hub', isOpen: false },
        plan,
        {
          openFirst: true,
        },
      );
      expect(open).toBeGreaterThan(closed);
      expect(closed).toBeGreaterThan(0);
    });

    it('rewards rating, popularity and proximity as tie-breakers', () => {
      const base = { name: 'Momo Hub', isOpen: true, matchedMenuTerms: 1 };
      const low = scoreRestaurant(
        { ...base, averageRating: 3, totalReviews: 2 },
        plan,
      );
      const high = scoreRestaurant(
        { ...base, averageRating: 4.9, totalReviews: 300 },
        plan,
      );
      expect(high).toBeGreaterThan(low);

      const origin = { lat: 27.7, lng: 83.46 };
      const near = scoreRestaurant(
        { ...base, latitude: 27.701, longitude: 83.461 },
        plan,
        { origin },
      );
      const far = scoreRestaurant(
        { ...base, latitude: 27.9, longitude: 83.9 },
        plan,
        { origin },
      );
      expect(near).toBeGreaterThan(far);
    });
  });

  describe('dish ranking', () => {
    const plan = buildSearchPlan('chicken momo', FOOD_VOCABULARY_UNIQUE);

    it('ranks the exact dish above a description-only mention', () => {
      const exact = scoreDish(
        { name: 'Chicken Momo', restaurantIsOpen: true },
        plan,
      );
      const described = scoreDish(
        {
          name: 'Thakali Thali',
          description: 'served with chicken momo',
          restaurantIsOpen: true,
        },
        plan,
      );
      expect(exact).toBeGreaterThan(described);
    });

    it('ranks a dish name hit above a category-only hit', () => {
      const nameHit = scoreDish(
        { name: 'Steamed Chicken Momo', restaurantIsOpen: true },
        plan,
      );
      const categoryHit = scoreDish(
        { name: 'Cola', categoryName: 'Chicken Momos', restaurantIsOpen: true },
        plan,
      );
      expect(nameHit).toBeGreaterThan(categoryHit);
    });

    it('uses the selling restaurant quality and proximity as tie-breakers', () => {
      const base = { name: 'Chicken Momo', restaurantIsOpen: true };
      expect(
        scoreDish({ ...base, restaurantRating: 4.9 }, plan),
      ).toBeGreaterThan(scoreDish({ ...base, restaurantRating: 3.1 }, plan));

      const origin = { lat: 27.7, lng: 83.46 };
      expect(
        scoreDish(
          { ...base, restaurantLatitude: 27.702, restaurantLongitude: 83.461 },
          plan,
          {
            origin,
          },
        ),
      ).toBeGreaterThan(
        scoreDish(
          { ...base, restaurantLatitude: 28.2, restaurantLongitude: 84.0 },
          plan,
          {
            origin,
          },
        ),
      );
    });
  });

  describe('didYouMean', () => {
    it('suggests the closest real term for a misspelling', () => {
      expect(didYouMean('piza', FOOD_VOCABULARY_UNIQUE)).toContain('pizza');
      expect(didYouMean('mommo', FOOD_VOCABULARY_UNIQUE)).toContain('momo');
      expect(didYouMean('chiken', FOOD_VOCABULARY_UNIQUE)).toContain('chicken');
    });

    it('stays silent for correctly spelled single terms', () => {
      expect(didYouMean('momo', FOOD_VOCABULARY_UNIQUE)).toEqual([]);
      expect(didYouMean('pizza', FOOD_VOCABULARY_UNIQUE)).toEqual([]);
    });

    it('returns nothing without a vocabulary or query', () => {
      expect(didYouMean('piza', [])).toEqual([]);
      expect(didYouMean('', FOOD_VOCABULARY_UNIQUE)).toEqual([]);
    });
  });

  describe('helpers', () => {
    it('sorts by score, then rating, then reviews, then name (never insertion order)', () => {
      const items = [
        { score: 10, secondary: 4.0, tertiary: 10, label: 'B' },
        { score: 10, secondary: 4.5, tertiary: 5, label: 'A' },
        { score: 12, secondary: 1, tertiary: 1, label: 'C' },
      ];
      const sorted = [...items].sort(compareRelevance);
      expect(sorted.map((i) => i.label)).toEqual(['C', 'A', 'B']);
    });

    it('computes real distances in km', () => {
      // Two Butwal points roughly 1 km apart.
      expect(distanceKm(27.7, 83.46, 27.709, 83.46)).toBeCloseTo(1.0, 1);
      expect(distanceKm(null, 83.46, 27.7, 83.46)).toBeNull();
    });
  });
});
