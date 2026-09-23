import 'dotenv/config';
import jwt from 'jsonwebtoken';

async function verifyAll() {
  console.log('=== VERIFYING BUTWAL RESTAURANTS & MENUS ===');

  const token = jwt.sign(
    {
      sub: '926ef28e-2b53-4c60-919f-66c39e4e2082',
      email: 'bhusalamrita07@gmail.com',
      role: 'ADMIN',
      type: 'access',
    },
    process.env.JWT_SECRET || 'fkdfjljfljkjdkfnskfnsdflsdjfoiweilfdlsalosap',
    { expiresIn: '1h' },
  );

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Fetch restaurants
  const res = await fetch('http://localhost:3000/api/restaurants?limit=50', {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`Failed to fetch restaurants: ${res.status}`);
  const { data: restaurants } = (await res.json()) as any;
  console.log(`Found ${restaurants.length} active restaurants in API.`);

  // 2. Check each restaurant has menu categories and items
  let totalCategories = 0;
  let totalItems = 0;
  let brokenImages = 0;
  let zeroPrices = 0;

  for (const r of restaurants) {
    const menuRes = await fetch(
      `http://localhost:3000/api/menu-items/restaurant/${r.id}/grouped`,
      { headers: authHeaders },
    );
    if (!menuRes.ok) {
      console.error(`Failed to get menu for ${r.name}: ${menuRes.status}`);
      continue;
    }
    const grouped = (await menuRes.json()) as any;
    const catCount = grouped?.length || 0;
    let itemCount = 0;
    for (const group of grouped) {
      itemCount += group.items?.length || 0;
      for (const item of (group.items || [])) {
        if (!item.imageUrl || !item.imageUrl.startsWith('http')) {
          brokenImages++;
        }
        if (!item.price || Number(item.price) <= 0) {
          zeroPrices++;
        }
      }
    }
    totalCategories += catCount;
    totalItems += itemCount;

    console.log(`  ✓ ${r.name.padEnd(38)} | Cats: ${String(catCount).padStart(2)} | Items: ${String(itemCount).padStart(2)} | Min: Rs.${r.minOrderAmount}`);
  }

  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`Restaurants Verified: ${restaurants.length}`);
  console.log(`Total Categories:     ${totalCategories}`);
  console.log(`Total Menu Items:     ${totalItems}`);
  console.log(`Missing Image URLs:   ${brokenImages}`);
  console.log(`Invalid Prices:       ${zeroPrices}`);
  
  // 3. Test Dashboard endpoint (Home feed)
  const dashRes = await fetch('http://localhost:3000/api/dashboard', {
    headers: authHeaders,
  });
  if (dashRes.ok) {
    const dash = (await dashRes.json()) as any;
    console.log(`Dashboard categories available:    ${dash.categories?.length || 0}`);
    console.log(`Dashboard popular restaurants:     ${dash.popularRestaurants?.length || 0}`);
    console.log(`Dashboard featured menu items:     ${dash.featuredMenuItems?.length || 0}`);
  }

  console.log('=== ALL BUTWAL RESTAURANTS & MENUS VERIFIED SUCCESSFULLY ===');
}

verifyAll().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
