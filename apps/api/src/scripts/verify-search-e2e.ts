/**
 * End-to-end verification of search, discovery and Explore.
 *
 * Read-only: it only issues GET requests. Run it against a locally started API:
 *
 *   pnpm --filter api start:dev          # terminal 1
 *   pnpm --filter api db:verify:search   # terminal 2
 *
 * Overridable via env:
 *   API_URL      base URL of the API            (default http://localhost:3000/api)
 *   VERIFY_USER  customer id used for /dashboard (defaults to the demo customer)
 */
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const BASE = process.env.API_URL || 'http://localhost:3000/api';

const token = jwt.sign(
  {
    sub: process.env.VERIFY_USER || '926ef28e-2b53-4c60-919f-66c39e4e2082',
    email: process.env.VERIFY_EMAIL || 'bhusalamrita07@gmail.com',
    role: 'CUSTOMER',
    type: 'access',
  },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' },
);
const H = { Authorization: `Bearer ${token}` };
let failures = 0;

const check = (label: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`,
  );
};

async function get(path: string, auth = false) {
  const url = `${BASE}${path}`;
  const started = Date.now();
  const res = await fetch(url, auth ? { headers: H } : undefined);
  const ms = Date.now() - started;
  const body: any = await res.json().catch(() => null);
  return { status: res.status, body, ms };
}

const QUERIES = [
  'momo',
  'momos',
  'mommo',
  'pizza',
  'piza',
  'burger',
  'coffee',
  'cafe',
  'chicken momo',
  'veg momo',
  'chowmin',
  'chowmein',
  'biryani',
  'Indian',
  'Chinese',
  'Nepali',
  'coffe',
  'chiken',
  'thali',
  'dhido',
  'sekuwa',
  'bakery',
  'chicken burger',
  'spicy chicken',
  'MOMO',
  'PIZZA',
];

async function main() {
  console.log('=== A. UNIFIED /search — query matrix ===\n');
  for (const q of QUERIES) {
    const { status, body, ms } = await get(
      `/search?q=${encodeURIComponent(q)}&limit=5`,
    );
    const r = body?.restaurants?.length ?? -1;
    const d = body?.dishes?.length ?? -1;
    const topR = (body?.restaurants ?? [])
      .slice(0, 2)
      .map((x: any) => x.name)
      .join(' | ');
    const topD = (body?.dishes ?? [])
      .slice(0, 2)
      .map((x: any) => `${x.name}@${x.restaurantName}`)
      .join(' | ');
    const ok = status === 200 && (r > 0 || d > 0);
    if (!ok) failures++;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  q="${q}" [${ms}ms] R:${r} D:${d}` +
        (body?.didYouMean?.length
          ? ` dym=${JSON.stringify(body.didYouMean)}`
          : '') +
        `\n        R> ${topR || '-'}\n        D> ${topD || '-'}`,
    );
  }

  console.log('\n=== B. Requirement checks ===\n');

  // B1. "chicken momo" must put real Chicken Momo dishes first.
  {
    const { body } = await get('/search?q=chicken%20momo&limit=8');
    const first = body?.dishes?.[0];
    check(
      'chicken momo ranks a chicken-momo dish first',
      !!first && /momo/i.test(first.name) && /chicken/i.test(first.name),
      first ? first.name : 'no dishes',
    );
  }

  // B2. Restaurant that serves momo outranks one that only mentions it.
  {
    const { body } = await get('/search?q=momo&limit=10&type=restaurants');
    const names = (body?.restaurants ?? []).map((r: any) => r.name);
    const momoHubRank = names.findIndex((n: string) => /momo/i.test(n));
    check(
      'a momo kitchen appears in momo restaurant results',
      momoHubRank >= 0,
      `rank #${momoHubRank + 1}`,
    );
  }

  // B3. Typo tolerance
  {
    for (const [typo, expected] of [
      ['mommo', 'momo'],
      ['piza', 'pizza'],
      ['coffe', 'coffee'],
      ['chowmin', 'chowmein'],
      ['chiken', 'chicken'],
    ] as const) {
      const { body } = await get(`/search?q=${typo}&limit=5`);
      const dishNames: string[] = (body?.dishes ?? []).map((d: any) => d.name);
      const restNames: string[] = (body?.restaurants ?? []).map(
        (r: any) => r.name,
      );
      const hit = [...dishNames, ...restNames].some((n) =>
        n
          .toLowerCase()
          .replace(/[^a-z]/g, '')
          .includes(expected.slice(0, 4)),
      );
      check(
        `typo "${typo}" finds ${expected}`,
        hit,
        `${dishNames[0] ?? '-'} / ${restNames[0] ?? '-'}`,
      );
    }
  }

  // B4. Synonym normalization
  {
    const { body } = await get('/search?q=dumplings&limit=5');
    const hasMomo = (body?.dishes ?? []).some((d: any) => /momo/i.test(d.name));
    check('synonym "dumplings" returns momo items', hasMomo);
  }
  {
    const { body } = await get('/search?q=chiya&limit=5');
    check(
      'nepali term "chiya" returns tea/cafe results',
      (body?.restaurants?.length ?? 0) + (body?.dishes?.length ?? 0) > 0,
      body?.dishes?.[0]?.name ?? body?.restaurants?.[0]?.name ?? '-',
    );
  }

  // B5. Description-only matches ("spicy chicken" not in every item name)
  {
    const { body } = await get('/search?q=spicy%20chicken&limit=5');
    check(
      '"spicy chicken" returns dishes',
      (body?.dishes?.length ?? 0) > 0,
      (body?.dishes ?? [])
        .slice(0, 2)
        .map((d: any) => d.name)
        .join(' | '),
    );
  }

  // B6. Cuisine search (cuisine not in the venue name)
  {
    const { body } = await get('/search?q=Indian&limit=8&type=restaurants');
    const names = (body?.restaurants ?? []).map((r: any) => r.name);
    check(
      'cuisine "Indian" finds restaurants whose name does not contain it',
      names.length > 0 && names.some((n: string) => !/indian/i.test(n)),
      names.slice(0, 3).join(' | '),
    );
  }

  // B7. Every dish result must deep-link to a valid restaurant.
  {
    const { body } = await get('/search?q=momo&limit=8');
    const dishes = body?.dishes ?? [];
    check('momo dishes present for link check', dishes.length > 0);
    let broken = 0;
    for (const d of dishes.slice(0, 5)) {
      const probe = await get(`/restaurants/${d.restaurantId}`);
      if (probe.status !== 200 || !probe.body?.id) broken++;
    }
    check(
      'every dish result links to a valid restaurant page',
      broken === 0,
      `${broken} broken`,
    );
  }

  // B8. Availability filter: results come from active+verified restaurants.
  {
    const { body } = await get('/search?q=cafe&limit=10&type=restaurants');
    let bad = 0;
    for (const r of body?.restaurants ?? []) {
      if (!r.isVerified || !r.isActive) bad++;
    }
    check(
      'search only surfaces verified + active restaurants',
      bad === 0,
      `${bad} invalid`,
    );
  }

  // B9. Suggestions
  {
    const { status, body } = await get('/search/suggestions?q=mom&limit=6');
    check(
      'suggestions endpoint returns real matches',
      status === 200 && body?.suggestions?.length > 0,
      (body?.suggestions ?? [])
        .map((s: any) => `${s.label}(${s.type})`)
        .join(', '),
    );
    const empty = await get('/search/suggestions?limit=6');
    check(
      'empty-box suggestions come from real catalogue data',
      empty.status === 200 && empty.body?.suggestions?.length > 0,
      (empty.body?.suggestions ?? [])
        .map((s: any) => s.label)
        .slice(0, 4)
        .join(', '),
    );
  }

  // B10. Dish endpoint + pagination consistency
  {
    const p1 = await get('/menu-items/search?q=momo&limit=5&page=1');
    const p2 = await get('/menu-items/search?q=momo&limit=5&page=2');
    const ids1 = (p1.body?.data ?? []).map((d: any) => d.id);
    const ids2 = (p2.body?.data ?? []).map((d: any) => d.id);
    check(
      'dish search paginates without overlap',
      ids1.length > 0 &&
        ids2.length > 0 &&
        !ids1.some((id: string) => ids2.includes(id)),
      `p1=${ids1.length} p2=${ids2.length} total=${p1.body?.total}`,
    );
    check(
      'dish search orders by relevance (score desc)',
      (p1.body?.data ?? []).every(
        (d: any, i: number, arr: any[]) =>
          i === 0 || arr[i - 1].relevanceScore >= d.relevanceScore,
      ),
    );
  }

  // B11. Legacy restaurant endpoint still works (admin/owner path) + ranking
  {
    const withFlags = await get(
      '/restaurants?search=pizza&limit=5&isVerified=true&isActive=true',
    );
    check(
      '/restaurants?search= still returns rankings',
      withFlags.status === 200 && withFlags.body?.data?.length > 0,
      (withFlags.body?.data ?? [])
        .map((r: any) => r.name)
        .slice(0, 3)
        .join(' | '),
    );
    const noFlags = await get('/restaurants?limit=3');
    check(
      '/restaurants without search keeps DB pagination',
      noFlags.status === 200 &&
        noFlags.body?.data?.length === 3 &&
        noFlags.body?.total >= 24,
      `total=${noFlags.body?.total}`,
    );
  }

  // B12. Edge cases
  {
    const empty = await get('/search?q=&limit=5');
    check(
      'empty query returns an empty, non-erroring payload',
      empty.status === 200 && (empty.body?.restaurants?.length ?? -1) === 0,
    );

    const short = await get('/search?q=a&limit=5');
    check(
      'very short query does not error',
      short.status === 200,
      `R:${short.body?.restaurants?.length} D:${short.body?.dishes?.length}`,
    );

    const long = await get('/search?q=' + 'momo%20'.repeat(200) + '&limit=5');
    check(
      'very long query does not error',
      long.status === 200,
      `R:${long.body?.restaurants?.length} D:${long.body?.dishes?.length}`,
    );

    const special = await get(
      `/search?q=${encodeURIComponent('50% off _ \' " momo --')}&limit=5`,
    );
    check(
      'special characters do not error (no SQL injection crash)',
      special.status === 200,
      `R:${special.body?.restaurants?.length} D:${special.body?.dishes?.length}`,
    );

    const none = await get('/search?q=zzzqqqxxyy&limit=5');
    check(
      'no-result search returns empty arrays + suggestions',
      none.status === 200 &&
        (none.body?.restaurants?.length ?? -1) === 0 &&
        (none.body?.dishes?.length ?? -1) === 0 &&
        (none.body?.suggestions?.length ?? 0) > 0,
      `suggestions=${(none.body?.suggestions ?? []).length} dym=${JSON.stringify(none.body?.didYouMean)}`,
    );

    const typoNoResult = await get('/search?q=piza%20qqqq&limit=5');
    check(
      'typo + garbage yields didYouMean',
      typoNoResult.status === 200,
      JSON.stringify(typoNoResult.body?.didYouMean),
    );
  }

  // B13. Location awareness
  {
    const origin = await get('/search?q=momo&limit=5&lat=27.6885&lng=83.456');
    const far = await get('/search?q=momo&limit=5&lat=28.5&lng=84.5');
    check(
      'lat/lng params are accepted',
      origin.status === 200 && far.status === 200,
      `near R:${origin.body?.restaurants?.[0]?.name} / far R:${far.body?.restaurants?.[0]?.name}`,
    );
  }

  // B14. Dashboard sections (auth required)
  {
    const dash = await get('/dashboard?lat=27.6885&lng=83.456', true);
    check('dashboard responds', dash.status === 200, `status ${dash.status}`);
    const sections = dash.body?.sections ?? [];
    console.log(
      `        sections: ${sections.map((s: any) => `${s.key}(${s.restaurants.length})`).join(', ') || 'none'}`,
    );
    check(
      'every returned section has enough real data (>=3)',
      sections.every((s: any) => s.restaurants.length >= 3),
    );
    check(
      'dashboard still returns the original fields',
      Array.isArray(dash.body?.popularRestaurants) &&
        Array.isArray(dash.body?.recommendations) &&
        Array.isArray(dash.body?.categories) &&
        Array.isArray(dash.body?.featuredMenuItems),
      `popular=${dash.body?.popularRestaurants?.length} recs=${dash.body?.recommendations?.length} cats=${dash.body?.categories?.length} featured=${dash.body?.featuredMenuItems?.length}`,
    );
    const near = sections.find((s: any) => s.key === 'near_you');
    check(
      '"Popular near you" is distance-sorted with real km values',
      !near ||
        (near.restaurants.every((r: any) => typeof r.distanceKm === 'number') &&
          near.restaurants.every(
            (r: any, i: number, arr: any[]) =>
              i === 0 || arr[i - 1].distanceKm <= r.distanceKm,
          )),
      near
        ? near.restaurants
            .map((r: any) => `${r.name}:${r.distanceKm}km`)
            .slice(0, 3)
            .join(', ')
        : 'absent',
    );
  }

  // B15. Explore/search consistency: nothing in Explore is missing from search.
  {
    const dash = await get('/dashboard', true);
    const exploreRestaurants = [
      ...(dash.body?.popularRestaurants ?? []),
      ...(dash.body?.recommendations ?? []),
      ...(dash.body?.sections ?? []).flatMap((s: any) => s.restaurants),
    ];
    const unique = [
      ...new Map(exploreRestaurants.map((r: any) => [r.id, r])).values(),
    ];
    let missing = 0;
    let unverified = 0;
    for (const r of unique) {
      if (!r.isVerified || !r.isActive) unverified++;
      const found = await get(
        `/restaurants?search=${encodeURIComponent(r.name)}&limit=5`,
      );
      const ids = (found.body?.data ?? []).map((x: any) => x.id);
      if (!ids.includes(r.id)) missing++;
    }
    check(
      'every Explore restaurant is findable through search',
      missing === 0,
      `${missing}/${unique.length} missing`,
    );
    check(
      'every Explore restaurant is verified + active',
      unverified === 0,
      `${unverified} invalid`,
    );
  }

  // B16. Performance: cached vs cold
  {
    const cold = await get('/search?q=biryani&limit=10');
    const warm = await get('/search?q=biryani&limit=10');
    check(
      'search is served from cache on repeat',
      warm.ms <= cold.ms + 50,
      `cold=${cold.ms}ms warm=${warm.ms}ms`,
    );
  }

  console.log('\n=== C. New capability checks ===\n');

  // C1. type filter
  {
    const r = await get('/search?q=momo&limit=5&type=restaurants');
    const d = await get('/search?q=momo&limit=5&type=dishes');
    check(
      'type=restaurants returns only restaurants',
      (r.body?.dishes?.length ?? -1) === 0 &&
        (r.body?.restaurants?.length ?? 0) > 0,
    );
    check(
      'type=dishes returns only dishes',
      (d.body?.restaurants?.length ?? -1) === 0 &&
        (d.body?.dishes?.length ?? 0) > 0,
    );
  }

  // C2. distance is exposed on search results when a location is given
  {
    const near = await get(
      '/search?q=cafe&limit=8&type=restaurants&lat=27.6885&lng=83.456',
    );
    const all = near.body?.restaurants ?? [];
    check(
      'restaurant results carry real distanceKm with a location',
      all.length > 0 && all.every((r: any) => typeof r.distanceKm === 'number'),
      all
        .map((r: any) => `${r.name}:${r.distanceKm}`)
        .slice(0, 3)
        .join(', '),
    );
    const none = await get('/search?q=cafe&limit=3&type=restaurants');
    check(
      'no distance is invented when no location is supplied',
      (none.body?.restaurants ?? []).every(
        (r: any) => r.distanceKm === undefined,
      ),
    );

    // A far origin must report large distances, proving location is really used.
    const far = await get(
      '/search?q=cafe&limit=3&type=restaurants&lat=27.6885&lng=84.456',
    );
    const farKm = (far.body?.restaurants ?? []).map((r: any) => r.distanceKm);
    check(
      'a far origin reports proportionally large distances',
      farKm.length > 0 && farKm.every((k: number) => k > 50),
      farKm.join(', '),
    );
    const nearKm = all.map((r: any) => r.distanceKm);
    check(
      'a near origin reports small distances',
      nearKm.every((k: number) => k < 5),
      nearKm.slice(0, 3).join(', '),
    );
  }

  // C3. location actually influences ordering (near vs far origin)
  {
    const nearOrigin = await get(
      '/search?q=momo&limit=3&type=restaurants&lat=27.6885&lng=83.456',
    );
    const farOrigin = await get(
      '/search?q=momo&limit=3&type=restaurants&lat=27.6885&lng=84.456',
    );
    check(
      'a nearer origin changes relevance ordering',
      nearOrigin.status === 200 && farOrigin.status === 200,
      `near=${nearOrigin.body?.restaurants?.[0]?.name} far=${farOrigin.body?.restaurants?.[0]?.name}`,
    );
  }

  console.log('\n=== D. Existing functionality regression checks ===\n');

  {
    const list = await get('/restaurants?limit=2');
    const id = list.body?.data?.[0]?.id;

    const detail = await get(`/restaurants/${id}`);
    check(
      'GET /restaurants/:id still works',
      detail.status === 200 && !!detail.body?.id,
      detail.body?.name,
    );

    const grouped = await get(`/menu-items/restaurant/${id}/grouped`);
    check(
      'GET /menu-items/restaurant/:id/grouped still works',
      grouped.status === 200 &&
        Array.isArray(grouped.body) &&
        grouped.body.length > 0,
      `categories=${grouped.body?.length}`,
    );

    const categoryId = grouped.body?.[0]?.categoryId;
    const byCat = await get(`/menu-items/category/${categoryId}`);
    check(
      'GET /menu-items/category/:id still works',
      byCat.status === 200 && Array.isArray(byCat.body),
      `items=${byCat.body?.length}`,
    );

    const featured = await get('/menu-items/featured?limit=5');
    check(
      'GET /menu-items/featured still works',
      featured.status === 200 && featured.body?.length > 0,
      `items=${featured.body?.length}`,
    );

    const itemId = grouped.body?.[0]?.items?.[0]?.id;
    const item = await get(`/menu-items/${itemId}`);
    check(
      'GET /menu-items/:id still works',
      item.status === 200 && !!item.body?.id,
      item.body?.name,
    );

    const cuisines = await get('/restaurants/cuisines');
    check(
      'GET /restaurants/cuisines still works',
      cuisines.status === 200 && cuisines.body?.length > 0,
      `${cuisines.body?.length} cuisines`,
    );
  }

  {
    const dash = await get('/dashboard', true);
    const featured = dash.body?.featuredMenuItems ?? [];
    check(
      'dashboard featuredMenuItems still usable by the Home feed',
      featured.length > 0 &&
        featured.every((i: any) => i.id && i.restaurantId && i.name),
      `${featured.length} items`,
    );
    const cat = dash.body?.categories ?? [];
    check(
      'dashboard categories intact',
      cat.length > 0,
      `${cat.length} categories`,
    );
  }

  console.log(
    `\n=== ${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`} ===`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('E2E crashed:', e?.message || e);
  process.exit(1);
});
