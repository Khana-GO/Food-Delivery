import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function cleanAndEnrich() {
  console.log('--- Cleaning and Enriching Butwal Restaurants & Menus ---');

  async function mergeRestaurant(keepId: string, removeId: string) {
    const dupCats = await sql.query(
      'SELECT id, name FROM menu_categories WHERE restaurant_id = $1',
      [removeId],
    );
    for (const dc of dupCats) {
      const existingKeepCat = await sql.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 LIMIT 1',
        [keepId, dc.name],
      );
      if (existingKeepCat.length > 0) {
        // Reassign items to existing category
        await sql.query(
          'UPDATE menu_items SET category_id = $1, restaurant_id = $2 WHERE category_id = $3',
          [existingKeepCat[0].id, keepId, dc.id],
        );
        await sql.query('DELETE FROM menu_categories WHERE id = $1', [dc.id]);
      } else {
        await sql.query(
          'UPDATE menu_categories SET restaurant_id = $1 WHERE id = $2',
          [keepId, dc.id],
        );
        await sql.query(
          'UPDATE menu_items SET restaurant_id = $1 WHERE category_id = $2',
          [keepId, dc.id],
        );
      }
    }
    // Delete duplicate restaurant
    await sql.query('DELETE FROM restaurants WHERE id = $1', [removeId]);
  }

  // 1. Deduplicate "Lime & Lemon Lounge Cafe"
  const limeDups = await sql.query(
    "SELECT id, slug FROM restaurants WHERE name ILIKE '%Lime & Lemon%' ORDER BY created_at ASC",
  );
  if (limeDups.length > 1) {
    console.log(
      `Merging Lime & Lemon duplicate (${limeDups[1].id} -> ${limeDups[0].id})`,
    );
    await mergeRestaurant(limeDups[0].id, limeDups[1].id);
  }

  // 2. Deduplicate "Goosip Cafe & Restro"
  const goosipDups = await sql.query(
    "SELECT id, slug FROM restaurants WHERE name ILIKE '%Goosip Cafe%' ORDER BY created_at ASC",
  );
  if (goosipDups.length > 1) {
    console.log(
      `Merging Goosip duplicate (${goosipDups[1].id} -> ${goosipDups[0].id})`,
    );
    await mergeRestaurant(goosipDups[0].id, goosipDups[1].id);
  }

  // 3. Polish 'Latte Ba ko Shandar Momo'
  await sql.query(
    `UPDATE restaurants
     SET name = 'Latte Ba ko Shandar Momo',
         address = 'Traffic Chowk, Butwal',
         cuisine_type = 'Momo, Fast Food, Nepali',
         logo_url = 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400',
         cover_image_url = 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800',
         is_active = true, is_open = true, is_verified = true
     WHERE name ILIKE '%latte ba%'`,
  );

  // Helper to add categories and items
  async function addMenuToRestaurant(
    restName: string,
    updates: {
      name?: string;
      cuisineType?: string;
      address?: string;
      logoUrl?: string;
      coverImageUrl?: string;
      description?: string;
      categories: Array<{
        name: string;
        items: Array<{
          name: string;
          description: string;
          price: string;
          imageUrl: string;
        }>;
      }>;
    },
  ) {
    const rests = await sql.query(
      'SELECT id FROM restaurants WHERE name ILIKE $1 LIMIT 1',
      [`%${restName}%`],
    );
    if (rests.length === 0) return;
    const restId = rests[0].id;

    if (updates.name || updates.cuisineType || updates.logoUrl) {
      await sql.query(
        `UPDATE restaurants 
         SET name = COALESCE($1, name),
             cuisine_type = COALESCE($2, cuisine_type),
             address = COALESCE($3, address),
             logo_url = COALESCE($4, logo_url),
             cover_image_url = COALESCE($5, cover_image_url),
             description = COALESCE($6, description),
             is_active = true, is_open = true, is_verified = true, deleted_at = NULL
         WHERE id = $7`,
        [
          updates.name || null,
          updates.cuisineType || null,
          updates.address || null,
          updates.logoUrl || null,
          updates.coverImageUrl || null,
          updates.description || null,
          restId,
        ],
      );
    }

    for (const cat of updates.categories) {
      let catId: string;
      const cats = await sql.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 LIMIT 1',
        [restId, cat.name],
      );
      if (cats.length > 0) {
        catId = cats[0].id;
      } else {
        const ins = await sql.query(
          'INSERT INTO menu_categories (restaurant_id, name) VALUES ($1, $2) RETURNING id',
          [restId, cat.name],
        );
        catId = ins[0].id;
      }

      for (const itm of cat.items) {
        const existing = await sql.query(
          'SELECT id FROM menu_items WHERE restaurant_id = $1 AND name = $2 LIMIT 1',
          [restId, itm.name],
        );
        if (existing.length === 0) {
          await sql.query(
            `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [restId, catId, itm.name, itm.description, itm.price, itm.imageUrl],
          );
        } else {
          await sql.query(
            `UPDATE menu_items
             SET category_id = $1, description = $2, price = $3, image_url = $4, is_available = true
             WHERE id = $5`,
            [catId, itm.description, itm.price, itm.imageUrl, existing[0].id],
          );
        }
      }
    }
  }

  // 4. Populate "The Burger House and Crunchy Fried Chicken"
  await addMenuToRestaurant('burger house', {
    name: 'The Burger House & CFC',
    cuisineType: 'Burger, Fast Food, Fried Chicken',
    address: 'Devinagar, Butwal',
    description:
      'Crispy fried chicken, loaded burgers, spicy wraps, and thick chilled milkshakes in Devinagar, Butwal.',
    logoUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    categories: [
      {
        name: 'Gourmet Burgers',
        items: [
          {
            name: 'Crunchy Zinger Burger',
            description:
              'Spicy seasoned fried chicken breast patty topped with melted cheese, iceberg lettuce, and spicy mayo.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
          },
          {
            name: 'Double Gourmet Cheeseburger',
            description:
              'Two grilled patties with double cheddar cheese slices, caramelized onions, and house sauce.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
          },
          {
            name: 'Golden French Fries (Regular)',
            description:
              'Crisp salted golden french fries with tomato ketchup and garlic herb dip.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
          },
        ],
      },
      {
        name: 'Fried Chicken & Wings',
        items: [
          {
            name: 'Crispy Fried Chicken (2 Pcs)',
            description:
              'Golden crunchy battered chicken pieces seasoned with 11 secret herbs and spices.',
            price: '230.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
          },
          {
            name: 'Hot Buffalo Chicken Wings (6 Pcs)',
            description:
              'Crisp fried chicken wings tossed in tangy spicy cayenne pepper glaze.',
            price: '270.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80',
          },
          {
            name: 'Oreo Thick Milkshake',
            description:
              'Thick creamy milkshake blended with chocolate Oreo biscuits and chocolate drizzle.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80',
          },
        ],
      },
    ],
  });

  // 5. Populate "Newari Khaja Ghar"
  await addMenuToRestaurant('Newari Khaja Ghar', {
    name: 'Newari Khaja Ghar',
    cuisineType: 'Newari, Traditional, Khaja',
    address: 'Milanchowk, Butwal',
    description:
      'Traditional Newari delicacies at Milanchowk, Butwal. Authentic Samay Baji sets, spicy Choila, and Bara.',
    logoUrl:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80',
    categories: [
      {
        name: 'Newari Khaja Sets',
        items: [
          {
            name: 'Authentic Samay Baji Set',
            description:
              'Traditional Newari platter with beaten rice (baji), spicy buffalo choila, black soybeans, ginger, and spiced aloo.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
          },
          {
            name: 'Spicy Buff Choila',
            description:
              'Smoked and grilled buffalo meat tossed in raw mustard oil, garlic, green chillies, and fenugreek seeds.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
          },
          {
            name: 'Buff Sukuti Sadeko',
            description:
              'Crisp sun-dried buffalo jerky salad with mustard oil, lemon, sliced onions, and chillies.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80',
          },
          {
            name: 'Mustang Aloo Timur Fry',
            description:
              'Crispy fried baby potatoes tossed with fragrant mountain timur and roasted cumin.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80',
          },
        ],
      },
    ],
  });

  // 6. Populate "Momo Hub"
  await addMenuToRestaurant('Momo Hub', {
    name: 'Hamro Momo Hub',
    cuisineType: 'Momo, Fast Food, Nepali',
    address: 'Traffic Chowk, Butwal',
    description:
      'The premier momo hub in Traffic Chowk, Butwal. Over 10 styles of steamed, fried, kothey, and jhol momos.',
    logoUrl:
      'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80',
    categories: [
      {
        name: 'Momo Specialties',
        items: [
          {
            name: 'Chicken Steam Momo',
            description:
              'Plump steamed chicken dumplings served with spicy tomato and roasted sesame achar.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=500&q=80',
          },
          {
            name: 'Crispy Pan-Fried C-Momo',
            description:
              'Pan-fried momos tossed in sweet and spicy garlic-chilli sauce with capsicum and onions.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&q=80',
          },
          {
            name: 'Traditional Jhol Momo',
            description:
              'Steamed dumplings served in a bowl of warm, aromatic roasted sesame and tomato soup broth.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&q=80',
          },
          {
            name: 'Fresh Veg Steam Momo',
            description:
              'Delicate dumplings stuffed with minced cabbage, paneer, and Himalayan herbs.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&q=80',
          },
        ],
      },
    ],
  });

  // 7. Populate "Chiya Nagar"
  await addMenuToRestaurant('Chiya Nagar', {
    name: 'Chiya Nagar Butwal',
    cuisineType: 'Tea, Snacks, Cafe',
    address: 'Devinagar, Butwal',
    description:
      'Cozy tea spot in Devinagar, Butwal. Traditional Matka clay-pot milk teas, warm samosas, and snacks.',
    logoUrl:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&q=80',
    categories: [
      {
        name: 'Tea & Warm Drinks',
        items: [
          {
            name: 'Special Matka Masala Chiya',
            description:
              'Clay-pot brewed Nepali milk tea infused with crushed green cardamom, ginger, and cloves.',
            price: '50.00',
            imageUrl:
              'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80',
          },
          {
            name: 'Iced Cold Coffee',
            description:
              'Rich espresso poured over chilled milk with sweet chocolate drizzle.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80',
          },
        ],
      },
      {
        name: 'Snacks & Bites',
        items: [
          {
            name: 'Crispy Samosa (2 Pcs)',
            description:
              'Crispy golden fried pastry cones stuffed with spiced potatoes and peas, served with sweet tamarind dip.',
            price: '60.00',
            imageUrl:
              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
          },
          {
            name: 'Golden French Fries',
            description: 'Hot crispy potato fries served with garlic mayo dip.',
            price: '100.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
          },
        ],
      },
    ],
  });

  // Verify all restaurants are active and open
  await sql.query(
    'UPDATE restaurants SET is_active = true, is_open = true, is_verified = true WHERE deleted_at IS NULL',
  );

  const activeRests = await sql.query(
    'SELECT count(*) FROM restaurants WHERE is_active = true',
  );
  const activeDishes = await sql.query(
    'SELECT count(*) FROM menu_items WHERE is_available = true',
  );
  console.log(
    `\nCOMPLETED! Total Clean Active Restaurants: ${activeRests[0].count}, Total Verified Dishes: ${activeDishes[0].count}`,
  );
}

cleanAndEnrich().catch((err) => {
  console.error('Clean and enrich error:', err);
  process.exit(1);
});
