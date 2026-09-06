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

interface MenuItemSeed {
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
}

interface CategorySeed {
  name: string;
  items: MenuItemSeed[];
}

interface RestaurantSeed {
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  wardNumber: number;
  latitude: number;
  longitude: number;
  cuisineType: string;
  openingTime: string;
  closingTime: string;
  deliveryFee: string;
  minimumOrderAmount: string;
  estimatedDeliveryTime: number;
  averageRating: string;
  totalReviews: number;
  logoUrl?: string;
  coverImageUrl?: string;
  categories: CategorySeed[];
}

const BUTWAL_RESTAURANTS: RestaurantSeed[] = [
  {
    name: 'Cafe Bachelor',
    slug: 'cafe-bachelor-butwal',
    description:
      'Popular student and youth cafe in Golpark, Butwal. Famous for juicy momos, spicy chatpate, rolls, and cold coffees.',
    phone: '+977-71-540112',
    email: 'bachelorcafe.butwal@gmail.com',
    address: 'Golpark, Butwal',
    wardNumber: 3,
    latitude: 27.7083,
    longitude: 83.4611,
    cuisineType: 'Cafe, Fast Food',
    openingTime: '08:00:00',
    closingTime: '21:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '100.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.60',
    totalReviews: 84,
    logoUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    categories: [
      {
        name: 'Momo & Fast Food',
        items: [
          {
            name: 'Chicken Steam Momo',
            description:
              'Juicy hand-folded chicken dumplings served with spicy tomato and roasted sesame achar.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=500&q=80',
          },
          {
            name: 'Chicken C-Momo',
            description:
              'Fried momos tossed in fiery sweet-and-sour chilli garlic glaze with bell peppers and onions.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&q=80',
          },
          {
            name: 'Veg Steam Momo',
            description:
              'Fresh cabbage, paneer, and local vegetable filling seasoned with Himalayan herbs.',
            price: '100.00',
            imageUrl:
              'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&q=80',
          },
          {
            name: 'Buff Chowmein',
            description:
              'Stir-fried street-style noodles with tender spiced buffalo meat and crunchy greens.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
          },
          {
            name: 'Crispy Chicken Burger',
            description:
              'Crispy fried chicken breast fillet topped with melted cheese, iceberg lettuce, and secret house mayo.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
          },
        ],
      },
      {
        name: 'Snacks & Khaja',
        items: [
          {
            name: 'Golpark Special Chatpate',
            description:
              'Tangy, crunchy street snack with puffed rice, boiled potatoes, onions, coriander, and mustard oil.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
          },
          {
            name: 'Chicken Sausage Roll',
            description:
              'Spiced chicken sausage wrapped in soft flaky paratha with sliced red onions and mint sauce.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&q=80',
          },
          {
            name: 'Crispy French Fries',
            description:
              'Golden salted French fries served with garlic mayo dip.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80',
          },
        ],
      },
      {
        name: 'Beverages & Shakes',
        items: [
          {
            name: 'Iced Cold Coffee',
            description:
              'Chilled rich espresso blended with whole milk and creamy chocolate drizzle.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80',
          },
          {
            name: 'Fresh Mint Lemonade',
            description:
              'Refreshing squeezed lemon cooler infused with fresh garden mint leaves and crushed ice.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Lime & Lemon Lounge Cafe',
    slug: 'lime-lemon-lounge-butwal',
    description:
      'Chic modern lounge cafe at Horizon Chowk, Kalikanagar. Hand-tossed wood-fired pizzas, creamy Italian pastas, and gourmet coffee.',
    phone: '+977-71-550921',
    email: 'limeandlemon.butwal@gmail.com',
    address: 'Horizon Chowk, Kalikanagar, Butwal',
    wardNumber: 11,
    latitude: 27.6952,
    longitude: 83.4542,
    cuisineType: 'Cafe, Continental, Italian',
    openingTime: '09:00:00',
    closingTime: '22:30:00',
    deliveryFee: '35.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 30,
    averageRating: '4.80',
    totalReviews: 120,
    logoUrl:
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    categories: [
      {
        name: 'Wood-Fired Pizza',
        items: [
          {
            name: 'Classic Margherita Pizza',
            description:
              'Italian San Marzano tomato sauce, fresh buffalo mozzarella cheese, and fragrant basil leaves.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&q=80',
          },
          {
            name: 'BBQ Smoked Chicken Pizza',
            description:
              'Wood-fired crust topped with smoky grilled chicken, caramelized red onions, and mozzarella.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
          },
          {
            name: 'Paneer Tikka Pizza',
            description:
              'Spiced tandoori marinated paneer cubes, crisp capsicum, and melted mozzarella cheese.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
          },
        ],
      },
      {
        name: 'Pastas & Mains',
        items: [
          {
            name: 'Creamy Alfredo Fettuccine',
            description:
              'Tender fettuccine tossed in rich garlic parmesan cream sauce with sauteed button mushrooms.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&q=80',
          },
          {
            name: 'Grilled Chicken Sizzler',
            description:
              'Herb-marinated chicken breast served on a sizzling hot plate with buttered rice, sauteed veggies, and black pepper sauce.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
          },
        ],
      },
      {
        name: 'Desserts & Artisan Coffee',
        items: [
          {
            name: 'Sizzling Brownie with Ice Cream',
            description:
              'Warm walnut fudge brownie served on a cast iron sizzler with vanilla bean ice cream and hot chocolate fudge.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
          },
          {
            name: 'Caramel Macchiato',
            description:
              'Freshly pulled espresso layered over steamed milk and sweet vanilla, marked with buttery caramel.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Refresh Cafe & Bakery',
    slug: 'refresh-cafe-bakery-butwal',
    description:
      'Artisanal bakery and gourmet cafe in Kalikanagar, Butwal. Renowned for cheesecakes, croissants, club sandwiches, and espresso drinks.',
    phone: '+977-71-551834',
    email: 'refreshcafe.butwal@gmail.com',
    address: 'Kalikanagar, Butwal',
    wardNumber: 10,
    latitude: 27.6918,
    longitude: 83.452,
    cuisineType: 'Bakery, Cafe, Desserts',
    openingTime: '07:30:00',
    closingTime: '21:30:00',
    deliveryFee: '30.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.75',
    totalReviews: 95,
    logoUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    categories: [
      {
        name: 'Bakery & Pastries',
        items: [
          {
            name: 'New York Baked Cheesecake',
            description:
              'Silky smooth baked cream cheese slice on a buttery graham crust, garnished with berry compote.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
          },
          {
            name: 'Red Velvet Pastry',
            description:
              'Classic crimson cocoa sponge layered with whipped vanilla cream cheese frosting.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500&q=80',
          },
          {
            name: 'Belgian Nutella Waffle',
            description:
              'Fresh Belgian waffle topped with generous Nutella spread, banana slices, and toasted almond flakes.',
            price: '250.00',
            imageUrl:
              'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&q=80',
          },
        ],
      },
      {
        name: 'Breakfast & Gourmet Sandwiches',
        items: [
          {
            name: 'Refresh Signature Club Sandwich',
            description:
              'Triple-decker toasted sandwich with roast chicken slices, fried egg, cheese, sliced tomatoes, and lettuce.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80',
          },
          {
            name: 'Avocado & Poached Egg Toast',
            description:
              'Toasted artisan sourdough topped with seasoned smashed avocado, poached egg, and cracked pepper.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80',
          },
        ],
      },
      {
        name: 'Specialty Coffee',
        items: [
          {
            name: 'Hazelnut Cappuccino',
            description:
              'Espresso shot crowned with thick creamy microfoam and roasted hazelnut flavour.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
          },
          {
            name: 'Strawberry Chia Smoothie',
            description:
              'Blended organic strawberries, rich curd, honey, and nutrient-dense chia seeds.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Gaule Chulo Thakali',
    slug: 'gaule-chulo-thakali-butwal',
    description:
      'Authentic Mustang Thakali cuisine in Traffic Chowk, Butwal. Traditional thali sets with fragrant local rice, black lentils cooked with jimbu, and mountain meats.',
    phone: '+977-71-542388',
    email: 'gaulechulo.butwal@gmail.com',
    address: 'Traffic Chowk, Butwal',
    wardNumber: 6,
    latitude: 27.7012,
    longitude: 83.459,
    cuisineType: 'Nepali, Thakali',
    openingTime: '10:00:00',
    closingTime: '22:00:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.85',
    totalReviews: 210,
    logoUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80',
    categories: [
      {
        name: 'Thakali Thali Sets',
        items: [
          {
            name: 'Special Thakali Mutton Thali',
            description:
              'Authentic Thakali khana set featuring tender hill mutton curry, jimbu-tempered black dal, gundruk achar, fried potatoes, radish salad, and pure ghee rice.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
          },
          {
            name: 'Special Thakali Chicken Thali',
            description:
              'Country-style chicken curry served with Himalayan black lentils, fresh saag, spicy tomato achar, and steamed basmati rice.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
          },
          {
            name: 'Traditional Thakali Veg Thali',
            description:
              'Wholesome vegetarian Thakali platter with seasonal organic greens, Mustang dal, gundruk bhatmas, and spicy timur achar.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80',
          },
        ],
      },
      {
        name: 'Local Snacks & Sekuwa',
        items: [
          {
            name: 'Buff Sukuti Sadeko',
            description:
              'Sun-dried tender buffalo meat tossed with roasted mustard oil, ginger, garlic, green chillies, and lemon juice.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80',
          },
          {
            name: 'Local Mutton Sekuwa',
            description:
              'Charcoal-grilled succulent mutton skewers seasoned with traditional Nepali spices and served with beaten rice.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
          },
          {
            name: 'Gundruk Bhatmas Sadeko',
            description:
              'Crispy roasted soybeans and fermented Himalayan greens marinated with onions, mustard oil, and spices.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Goosip Cafe & Restro',
    slug: 'goosip-cafe-butwal',
    description:
      'Lively cafe and restaurant in Devinagar, Butwal. Famous for signature Dragon Chicken, biryanis, spicy noodles, and refreshing shakes.',
    phone: '+977-71-553410',
    email: 'goosipcafe.butwal@gmail.com',
    address: 'Devinagar, Butwal',
    wardNumber: 11,
    latitude: 27.6895,
    longitude: 83.4475,
    cuisineType: 'Cafe, Asian, Multi-Cuisine',
    openingTime: '11:00:00',
    closingTime: '22:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.70',
    totalReviews: 88,
    logoUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    categories: [
      {
        name: 'Chef Specials',
        items: [
          {
            name: 'Signature Dragon Chicken',
            description:
              'Crispy fried chicken strips glazed in fiery and sweet red chilli sauce, tossed with toasted cashew nuts and spring onions.',
            price: '330.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80',
          },
          {
            name: 'Crispy Corn Salt & Pepper',
            description:
              'Crispy fried sweet corn kernels tossed with fresh garlic, cracked black pepper, and scallions.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&q=80',
          },
          {
            name: 'Boneless Chicken Chilli',
            description:
              'Succulent chicken pieces stir-fried with green bell peppers, sliced red onions, and spicy soy-chilli gravy.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
          },
        ],
      },
      {
        name: 'Rice & Noodles',
        items: [
          {
            name: 'Hyderabadi Dum Chicken Biryani',
            description:
              'Fragrant basmati rice slow-cooked with spiced marinated chicken, saffron milk, and fried onions. Served with raita.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
          },
          {
            name: 'Schezwan Chicken Noodles',
            description:
              'Wok-tossed noodles with chicken pieces, scrambled egg, and spicy Schezwan sauce.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
          },
        ],
      },
      {
        name: 'Coolers & Shakes',
        items: [
          {
            name: 'Peach Iced Tea',
            description:
              'Chilled brewed Ceylon black tea with sweet aromatic peach puree and lemon slice.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
          },
          {
            name: 'Oreo Madness Milkshake',
            description:
              'Thick creamy milkshake blended with chocolate Oreo biscuits and chocolate drizzle.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80',
          },
        ],
      },
    ],
  },
  {
    name: 'Aama ko Bhansa Ghar',
    slug: 'aama-ko-bhansa-ghar-butwal',
    description:
      'Home-style authentic Nepali meals at Milanchowk, Butwal. Traditional village-style chicken curry, mutton bhutuwa, buckwheat dhido, and classic snacks.',
    phone: '+977-71-547190',
    email: 'aamabhansaghar.butwal@gmail.com',
    address: 'Milanchowk, Butwal',
    wardNumber: 8,
    latitude: 27.698,
    longitude: 83.456,
    cuisineType: 'Authentic Nepali, Traditional',
    openingTime: '09:30:00',
    closingTime: '21:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '100.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.80',
    totalReviews: 175,
    logoUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    categories: [
      {
        name: 'Traditional Meals & Dhido',
        items: [
          {
            name: 'Local Kukhura ko Thali',
            description:
              'Authentic free-range country chicken curry simmered in fragrant spices, served with steamed rice, dal, greens, and achar.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
          },
          {
            name: 'Kodo ko Dhido Set with Mutton',
            description:
              'Traditional freshly cooked buckwheat millet dhido served with warm clarified butter (ghee), hill goat curry, and gundruk.',
            price: '470.00',
            imageUrl:
              'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&q=80',
          },
          {
            name: 'Vegetarian Dhido Meal',
            description:
              'Warm buckwheat dhido served with seasonal saag, black lentil soup, and fermented spicy tomato radish achar.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80',
          },
        ],
      },
      {
        name: 'Khaja & Sekuwa',
        items: [
          {
            name: 'Mutton Bhutuwa',
            description:
              'Slow pan-roasted spiced mutton cubes infused with whole garlic, ginger, and cumin seeds.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
          },
          {
            name: 'Mustang Aloo',
            description:
              'Crisp fried baby potatoes seasoned with spicy timur, roasted cumin, and Himalayan mountain herbs.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80',
          },
          {
            name: 'Samay Baji Khaja Set',
            description:
              'Newari festive platter with beaten rice, spiced choila, fried boiled egg, black soybeans, and aloo tama achar.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log('--- Seeding Butwal Restaurants & Cafes ---');

  // Find or create a default restaurant owner
  const owners = await sql.query(
    "SELECT id FROM users WHERE role = 'RESTAURANT_OWNER' LIMIT 1",
  );
  let ownerId: string;

  if (owners.length > 0) {
    ownerId = owners[0].id;
    console.log(`Using existing restaurant owner: ${ownerId}`);
  } else {
    const newOwner = await sql.query(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active)
      VALUES ('butwal.owner@khanago.com', '$2b$10$xyzFakeHashedPasswordJustForSeeding1234567890', 'Butwal', 'Partner', 'RESTAURANT_OWNER', true)
      RETURNING id
    `);
    ownerId = newOwner[0].id;
    console.log(`Created new restaurant owner: ${ownerId}`);
  }

  for (const r of BUTWAL_RESTAURANTS) {
    console.log(`\nProcessing: ${r.name} (${r.address})`);

    // Check if restaurant already exists by slug
    let restId: string;
    const existing = await sql.query(
      'SELECT id, name FROM restaurants WHERE slug = $1 LIMIT 1',
      [r.slug],
    );

    if (existing.length > 0) {
      restId = existing[0].id;
      console.log(
        `Restaurant exists (ID: ${restId}), updating status to active/open...`,
      );
      await sql.query(
        `UPDATE restaurants 
         SET is_active = true, is_open = true, is_verified = true, deleted_at = NULL,
             address = $1, latitude = $2, longitude = $3, cuisine_type = $4,
             logo_url = $5, cover_image_url = $6
         WHERE id = $7`,
        [
          r.address,
          r.latitude,
          r.longitude,
          r.cuisineType,
          r.logoUrl,
          r.coverImageUrl,
          restId,
        ],
      );
    } else {
      const inserted = await sql.query(
        `INSERT INTO restaurants (
          owner_id, name, slug, description, phone, email, address, ward_number,
          latitude, longitude, cuisine_type, opening_time, closing_time, is_open,
          is_active, is_verified, delivery_fee, minimum_order_amount,
          estimated_delivery_time, average_rating, total_reviews, logo_url, cover_image_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, true,
          true, true, $14, $15,
          $16, $17, $18, $19, $20
        ) RETURNING id`,
        [
          ownerId,
          r.name,
          r.slug,
          r.description,
          r.phone,
          r.email,
          r.address,
          r.wardNumber,
          r.latitude,
          r.longitude,
          r.cuisineType,
          r.openingTime,
          r.closingTime,
          r.deliveryFee,
          r.minimumOrderAmount,
          r.estimatedDeliveryTime,
          r.averageRating,
          r.totalReviews,
          r.logoUrl,
          r.coverImageUrl,
        ],
      );
      restId = inserted[0].id;
      console.log(`Inserted restaurant "${r.name}" with ID: ${restId}`);
    }

    // Insert categories and menu items
    for (const cat of r.categories) {
      let catId: string;
      const existingCat = await sql.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2 LIMIT 1',
        [restId, cat.name],
      );

      if (existingCat.length > 0) {
        catId = existingCat[0].id;
      } else {
        const insertedCat = await sql.query(
          'INSERT INTO menu_categories (restaurant_id, name) VALUES ($1, $2) RETURNING id',
          [restId, cat.name],
        );
        catId = insertedCat[0].id;
        console.log(`  Created category: ${cat.name}`);
      }

      for (const item of cat.items) {
        const existingItem = await sql.query(
          'SELECT id FROM menu_items WHERE restaurant_id = $1 AND name = $2 LIMIT 1',
          [restId, item.name],
        );

        if (existingItem.length === 0) {
          await sql.query(
            `INSERT INTO menu_items (
              restaurant_id, category_id, name, description, price, image_url, is_available
            ) VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [
              restId,
              catId,
              item.name,
              item.description,
              item.price,
              item.imageUrl,
            ],
          );
          console.log(`    Added dish: ${item.name} (Rs. ${item.price})`);
        }
      }
    }
  }

  console.log(
    '\nButwal restaurants, cafes, and menu items seeded successfully!',
  );
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
