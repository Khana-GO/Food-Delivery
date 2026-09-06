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
  imageUrl: string;
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
  logoUrl: string;
  coverImageUrl: string;
  categories: CategorySeed[];
}

export const BUTWAL_RESTAURANTS: RestaurantSeed[] = [
  // ─── 1. CAFE BACHELOR (GOLPARK) ───
  {
    name: 'Cafe Bachelor',
    slug: 'cafe-bachelor-butwal',
    description:
      'Popular student and youth cafe in Golpark, Butwal. Famous for juicy momos, spicy chatpate, rolls, and chilled cold coffee.',
    phone: '+977-71-540112',
    email: 'bachelorcafe.butwal@gmail.com',
    address: 'Golpark, Butwal',
    wardNumber: 3,
    latitude: 27.7083,
    longitude: 83.4611,
    cuisineType: 'Cafe, Fast Food, Bakery',
    openingTime: '08:00:00',
    closingTime: '21:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '100.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.65',
    totalReviews: 92,
    logoUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    categories: [
      {
        name: 'Momo & Noodles',
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
            name: 'Crispy Fried C-Momo',
            description:
              'Crispy fried chicken momos tossed in fiery sweet-and-sour chilli garlic glaze with bell peppers.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&q=80',
          },
          {
            name: 'Veg Steam Momo',
            description:
              'Fresh cabbage, paneer, and local vegetable filling seasoned with Himalayan herbs.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&q=80',
          },
          {
            name: 'Buff Chowmein',
            description:
              'Stir-fried street-style noodles with tender spiced buffalo meat, cabbage, and crunchy greens.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
          },
          {
            name: 'Piping Hot Jhol Momo',
            description:
              'Steamed dumplings served immersed in a warm, fragrant roasted sesame and soybean broth.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&q=80',
          },
        ],
      },
      {
        name: 'Burgers & Finger Food',
        items: [
          {
            name: 'Crispy Chicken Burger',
            description:
              'Golden fried chicken breast fillet topped with melted cheddar, crisp lettuce, and house sauce.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
          },
          {
            name: 'Golden French Fries',
            description:
              'Crispy salted potato fries served with garlic herb mayonnaise dip.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
          },
          {
            name: 'Golpark Special Chatpate',
            description:
              'Tangy, crunchy street snack with puffed rice, boiled potatoes, fresh onions, and mustard oil.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
          },
          {
            name: 'Chicken Kathi Roll',
            description:
              'Spiced shredded chicken and sliced peppers wrapped in warm flaky flatbread with mint mayo.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&q=80',
          },
        ],
      },
      {
        name: 'Coolers & Shakes',
        items: [
          {
            name: 'Iced Cold Coffee',
            description:
              'Chilled rich espresso blended with creamy milk and rich chocolate syrup.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80',
          },
          {
            name: 'Fresh Mint Lemonade',
            description:
              'Refreshing squeezed lemon cooler infused with crushed garden mint leaves and ice.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
          },
          {
            name: 'Oreo Thick Milkshake',
            description:
              'Thick velvety milkshake blended with chocolate Oreo biscuits and chocolate drizzle.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 2. LIME & LEMON LOUNGE CAFE (KALIKANAGAR) ───
  {
    name: 'Lime & Lemon Lounge Cafe',
    slug: 'lime-and-lemon-lounge-butwal',
    description:
      'Premier dining cafe at Horizon Chowk, Kalikanagar. Acclaimed for wood-fired Italian pizzas, gourmet pastas, and sizzling hot plates.',
    phone: '+977-71-551299',
    email: 'limelemon.butwal@gmail.com',
    address: 'Horizon Chowk, Kalikanagar, Butwal',
    wardNumber: 11,
    latitude: 27.6894,
    longitude: 83.4612,
    cuisineType: 'Cafe, Continental, Italian, Pizza',
    openingTime: '10:00:00',
    closingTime: '22:30:00',
    deliveryFee: '30.00',
    minimumOrderAmount: '200.00',
    estimatedDeliveryTime: 30,
    averageRating: '4.80',
    totalReviews: 128,
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
              'Italian tomato sauce, fresh buffalo mozzarella cheese, and fragrant basil leaves on a thin crust.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&q=80',
          },
          {
            name: 'BBQ Smoked Chicken Pizza',
            description:
              'Wood-fired crust topped with smoky grilled chicken strips, caramelized red onions, and mozzarella.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
          },
          {
            name: 'Paneer Tikka Pizza',
            description:
              'Spiced tandoori marinated paneer cubes, crisp green capsicum, and melted mozzarella cheese.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
          },
          {
            name: 'Toasted Cheesy Garlic Bread',
            description:
              'Crusty baked baguette slices brushed with herb garlic butter and coated with melted cheese.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80',
          },
        ],
      },
      {
        name: 'Pastas & Sizzlers',
        items: [
          {
            name: 'Creamy Alfredo Fettuccine',
            description:
              'Tender fettuccine pasta tossed in rich garlic parmesan cream sauce with sauteed mushrooms.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&q=80',
          },
          {
            name: 'Spicy Penne Arrabbiata',
            description:
              'Al dente penne pasta simmered in spicy garlic tomato sauce garnished with fresh basil.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80',
          },
          {
            name: 'Grilled Chicken Sizzler',
            description:
              'Herb-marinated chicken breast served sizzling with buttered rice, French fries, and pepper sauce.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
          },
        ],
      },
      {
        name: 'Desserts & Barista Coffee',
        items: [
          {
            name: 'Sizzling Walnut Brownie with Ice Cream',
            description:
              'Warm walnut chocolate brownie served on a sizzling hot plate with vanilla bean ice cream.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
          },
          {
            name: 'Caramel Macchiato',
            description:
              'Freshly pulled espresso layered over steamed milk and vanilla, marked with buttery caramel.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80',
          },
          {
            name: 'Peach Iced Tea Cooler',
            description:
              'Chilled brewed Ceylon black tea with sweet aromatic peach puree and lemon slice.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 3. REFRESH CAFE & BAKERY (KALIKANAGAR) ───
  {
    name: 'Refresh Cafe & Bakery',
    slug: 'refresh-cafe-bakery-butwal',
    description:
      'Artisanal bakery and cozy coffee destination in Kalikanagar, Butwal. Freshly baked cakes, croissants, gourmet waffles, and specialty brews.',
    phone: '+977-71-550341',
    email: 'refreshbakery.butwal@gmail.com',
    address: 'Kalikanagar, Butwal',
    wardNumber: 11,
    latitude: 27.6912,
    longitude: 83.4589,
    cuisineType: 'Bakery, Cafe, Desserts',
    openingTime: '07:30:00',
    closingTime: '21:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.85',
    totalReviews: 104,
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
              'Silky smooth baked cream cheese slice on a buttery graham crust with strawberry glaze.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
          },
          {
            name: 'Red Velvet Cream Cheese Pastry',
            description:
              'Classic crimson cocoa sponge layered with whipped vanilla cream cheese frosting.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500&q=80',
          },
          {
            name: 'Golden Butter Croissant',
            description:
              'Flaky French butter pastry baked fresh daily with multiple delicate buttery layers.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
          },
          {
            name: 'Belgian Nutella Waffle',
            description:
              'Warm Belgian waffle topped with generous Nutella hazelnut spread and sliced banana.',
            price: '250.00',
            imageUrl:
              'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&q=80',
          },
          {
            name: 'Blueberry Crumble Muffin',
            description:
              'Soft bakery muffin filled with sweet wild blueberries and topped with sugar crumble.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500&q=80',
          },
        ],
      },
      {
        name: 'Breakfast & Sandwiches',
        items: [
          {
            name: 'Refresh Signature Club Sandwich',
            description:
              'Triple-decker toasted sandwich with roast chicken, fried egg, cheese, and crunchy lettuce.',
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
          {
            name: 'Fluffy Blueberry Pancakes',
            description:
              'Stack of golden fluffy buttermilk pancakes served with maple syrup and whipped butter.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
          },
        ],
      },
      {
        name: 'Specialty Coffee & Beverages',
        items: [
          {
            name: 'Hazelnut Cappuccino',
            description:
              'Rich espresso shot crowned with velvety microfoam and warm roasted hazelnut flavour.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
          },
          {
            name: 'Classic Americano',
            description:
              'Bold double espresso diluted with hot water for a smooth, rich black coffee finish.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
          },
          {
            name: 'Strawberry Chia Smoothie',
            description:
              'Chilled blend of fresh strawberries, creamy yogurt, honey, and organic chia seeds.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 4. GAULE CHULO THAKALI (TRAFFIC CHOWK) ───
  {
    name: 'Gaule Chulo Thakali',
    slug: 'gaule-chulo-thakali-butwal',
    description:
      'Legendary traditional Thakali kitchen near Traffic Chowk, Butwal. Authentic ghee-soaked rice thalis, tender hill mutton, and charcoal sekuwa.',
    phone: '+977-71-541988',
    email: 'gaulechulo.butwal@gmail.com',
    address: 'Traffic Chowk, Butwal',
    wardNumber: 6,
    latitude: 27.7015,
    longitude: 83.4568,
    cuisineType: 'Nepali, Thakali, Traditional',
    openingTime: '09:00:00',
    closingTime: '22:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '200.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.88',
    totalReviews: 215,
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
              'Authentic Thakali set: hill goat curry, black dal with jimbu, gundruk achar, fried aloo, and pure ghee rice.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
          },
          {
            name: 'Special Thakali Chicken Thali',
            description:
              'Country-style chicken curry served with black lentils, fresh mustard saag, timur achar, and basmati rice.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
          },
          {
            name: 'Traditional Thakali Veg Thali',
            description:
              'Wholesome vegetarian Thakali platter with seasonal organic greens, Mustang dal, gundruk, and roasted papad.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&q=80',
          },
        ],
      },
      {
        name: 'Sekuwa & Snacks',
        items: [
          {
            name: 'Local Mutton Sekuwa',
            description:
              'Charcoal-grilled succulent mutton skewers seasoned with Nepali mountain spices and served with beaten rice.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
          },
          {
            name: 'Buff Sukuti Sadeko',
            description:
              'Sun-dried buffalo meat tossed with roasted mustard oil, crushed garlic, ginger, green chillies, and lemon.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80',
          },
          {
            name: 'Mustang Aloo Timur Fry',
            description:
              'Crisp fried baby potatoes seasoned with aromatic timur pepper, cumin, and Himalayan mountain herbs.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 5. GOOSIP CAFE & RESTRO (DEVINAGAR) ───
  {
    name: 'Goosip Cafe & Restro',
    slug: 'goosip-cafe-restro-butwal',
    description:
      'Trendy youth hub in Devinagar, Butwal. Renowned for crispy Dragon Chicken, aromatic Dum Biryanis, sizzling platters, and milkshakes.',
    phone: '+977-71-532100',
    email: 'goosipcafe.butwal@gmail.com',
    address: 'Devinagar, Butwal',
    wardNumber: 11,
    latitude: 27.6845,
    longitude: 83.4532,
    cuisineType: 'Cafe, Asian, Biryani, Fast Food',
    openingTime: '09:30:00',
    closingTime: '22:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.72',
    totalReviews: 98,
    logoUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    categories: [
      {
        name: 'Chef Specials & Starters',
        items: [
          {
            name: 'Signature Dragon Chicken',
            description:
              'Crispy fried chicken strips glazed in fiery and sweet red chilli sauce, tossed with cashew nuts.',
            price: '330.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80',
          },
          {
            name: 'Boneless Chicken Chilli',
            description:
              'Succulent chicken pieces stir-fried with green bell peppers, sliced red onions, and spicy soy-chilli gravy.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&q=80',
          },
          {
            name: 'Fiery Buffalo Chicken Wings',
            description:
              'Crispy fried chicken wings tossed in tangy cayenne pepper glaze, served with garlic dip.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80',
          },
        ],
      },
      {
        name: 'Biryani & Main Course',
        items: [
          {
            name: 'Hyderabadi Dum Chicken Biryani',
            description:
              'Fragrant basmati rice slow-cooked with spiced chicken pieces, saffron, and fried onions. Served with raita.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
          },
          {
            name: 'Mutton Handi Biryani',
            description:
              'Rich and aromatic dum biryani prepared with tender mountain mutton and traditional whole spices.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80',
          },
          {
            name: 'Schezwan Chicken Noodles',
            description:
              'Wok-tossed noodles with chicken pieces, scrambled egg, bell peppers, and spicy Schezwan sauce.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 6. AAMA KO BHANSA GHAR (MILANCHOWK) ───
  {
    name: 'Aama ko Bhansa Ghar',
    slug: 'aama-ko-bhansa-ghar-butwal',
    description:
      'Home-cooked authentic Nepali meals at Milanchowk, Butwal. Traditional local kukhura chicken curry, organic buckwheat dhido, and spiced bhutuwa.',
    phone: '+977-71-550982',
    email: 'aamabhansa.butwal@gmail.com',
    address: 'Milanchowk, Butwal',
    wardNumber: 8,
    latitude: 27.6961,
    longitude: 83.4592,
    cuisineType: 'Authentic Nepali, Traditional, Dhido',
    openingTime: '08:30:00',
    closingTime: '21:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.82',
    totalReviews: 182,
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
              'Authentic free-range country chicken curry simmered in fragrant spices, served with rice, dal, greens, and achar.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
          },
          {
            name: 'Kodo ko Dhido Set with Mutton',
            description:
              'Traditional freshly cooked buckwheat millet dhido served with warm ghee, hill goat curry, and gundruk.',
            price: '470.00',
            imageUrl:
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80',
          },
          {
            name: 'Mutton Bhutuwa',
            description:
              'Slow pan-roasted spiced mutton cubes infused with whole garlic, ginger, and cumin seeds.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
          },
          {
            name: 'Masala Milk Chiya',
            description:
              'Hot fragrant milk tea brewed with crushed cardamom, fresh ginger, cloves, and cinnamon.',
            price: '40.00',
            imageUrl:
              'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 7. THE DARBAR LOUNGE & RESTRO (KALIKANAGAR) ───
  {
    name: 'The Darbar Lounge & Restro',
    slug: 'the-darbar-lounge-butwal',
    description:
      'Premier dining lounge and restro in Kalikanagar, Butwal. Famous for live music ambiance, sizzling tandoori platters, and signature continental dishes.',
    phone: '+977-71-554433',
    email: 'darbarlounge.butwal@gmail.com',
    address: 'Kalikanagar Main Road, Butwal',
    wardNumber: 11,
    latitude: 27.6881,
    longitude: 83.4599,
    cuisineType: 'Continental, Tandoori, Lounge, Bar',
    openingTime: '11:00:00',
    closingTime: '23:00:00',
    deliveryFee: '30.00',
    minimumOrderAmount: '250.00',
    estimatedDeliveryTime: 30,
    averageRating: '4.78',
    totalReviews: 145,
    logoUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    categories: [
      {
        name: 'Tandoori & Starters',
        items: [
          {
            name: 'Tandoori Chicken Tikka',
            description:
              'Tender boneless chicken cubes marinated in spiced yogurt and grilled in traditional clay tandoor oven.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80',
          },
          {
            name: 'Crispy Cheesy Nachos',
            description:
              'Loaded tortilla corn chips layered with melted cheddar cheese, jalapeños, and fresh tomato salsa.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80',
          },
          {
            name: 'Darbar Special Chicken Sizzler',
            description:
              'Sizzling hot platter with herb marinated grilled chicken breast, buttered french fries, and mushroom sauce.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
          },
        ],
      },
      {
        name: 'Pasta & Gourmet Mains',
        items: [
          {
            name: 'Creamy Mushroom Fettuccine',
            description:
              'Fresh fettuccine pasta in rich white garlic cream sauce with sauteed portobello mushrooms and parmesan.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&q=80',
          },
          {
            name: 'Double Gourmet Burger',
            description:
              'Stacked grilled patty with melted cheese, caramelized onions, pickles, and crispy fries on the side.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 8. MUGHAL DARBAR RESTAURANT & BANQUET (TRAFFIC CHOWK) ───
  {
    name: 'Mughal Darbar Restaurant',
    slug: 'mughal-darbar-butwal',
    description:
      'Authentic Mughlai and Indian culinary destination at Traffic Chowk, Butwal. Renowned for creamy butter chicken, handi biryanis, and soft butter naans.',
    phone: '+977-71-540777',
    email: 'mughaldarbar.butwal@gmail.com',
    address: 'Traffic Chowk, Butwal',
    wardNumber: 6,
    latitude: 27.7029,
    longitude: 83.4579,
    cuisineType: 'Mughlai, Indian, Biryani, Tandoori',
    openingTime: '10:30:00',
    closingTime: '22:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '200.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.82',
    totalReviews: 160,
    logoUrl:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    categories: [
      {
        name: 'Mughlai Curries & Gravies',
        items: [
          {
            name: 'Delhi Style Butter Chicken',
            description:
              'Tender tandoori chicken cooked in a rich, buttery, velvety tomato and cashew nut gravy.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
          },
          {
            name: 'Paneer Butter Masala',
            description:
              'Soft cottage cheese cubes simmered in a spiced, creamy tomato-butter sauce garnished with cream.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80',
          },
          {
            name: 'Butter Garlic Naan',
            description:
              'Fresh clay-oven baked Indian bread brushed with melted butter and sprinkled with minced garlic.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
          },
        ],
      },
      {
        name: 'Handi Biryani Specials',
        items: [
          {
            name: 'Royal Chicken Handi Biryani',
            description:
              'Aromatic long-grain basmati rice layered with spiced chicken, mint leaves, and saffron in an earthen pot.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
          },
          {
            name: 'Mughlai Mutton Biryani',
            description:
              'Slow-dum-cooked fragrant basmati rice with succulent mutton pieces and rich fried onions.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 9. CRISPY FRIED CHICKEN (CFC BUTWAL - MILANCHOWK) ───
  {
    name: 'Crispy Fried Chicken (CFC)',
    slug: 'crispy-fried-chicken-butwal',
    description:
      'Fast food favourite at Milanchowk, Butwal. Secret recipe crispy golden fried chicken buckets, spicy zinger burgers, and loaded potato fries.',
    phone: '+977-71-552211',
    email: 'cfc.butwal@gmail.com',
    address: 'Milanchowk, Butwal',
    wardNumber: 8,
    latitude: 27.6955,
    longitude: 83.4585,
    cuisineType: 'Fast Food, Fried Chicken, American, Burger',
    openingTime: '10:00:00',
    closingTime: '22:00:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.70',
    totalReviews: 110,
    logoUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
    categories: [
      {
        name: 'Fried Chicken Buckets',
        items: [
          {
            name: 'Crispy Fried Chicken Bucket (4 Pcs)',
            description:
              'Golden crispy, crunchy seasoned bone-in chicken pieces fried to juicy perfection with dipping sauce.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
          },
          {
            name: 'Hot & Spicy Chicken Wings (6 Pcs)',
            description:
              'Tender chicken wings coated in fiery hot sauce and toasted sesame seeds.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80',
          },
          {
            name: 'Spicy Zinger Chicken Burger',
            description:
              'Crunchy chicken breast fillet with melted cheese slice, lettuce, and spicy chipotle sauce.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
          },
          {
            name: 'Crispy French Fries (Large)',
            description:
              'Hot golden salted potato fries served with tomato ketchup and garlic mayonnaise.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 10. PAUWA LOUNGE & RESTRO (DEVINAGAR HIGHWAY) ───
  {
    name: 'Pauwa Lounge & Restro',
    slug: 'pauwa-lounge-butwal',
    description:
      'Spacious garden restro along the Devinagar highway, Butwal. Highly famous for fresh Tinau river fish fry, chicken sekuwa, and chilled coolers.',
    phone: '+977-71-534567',
    email: 'pauwalounge.butwal@gmail.com',
    address: 'Devinagar Highway, Butwal',
    wardNumber: 11,
    latitude: 27.6831,
    longitude: 83.4521,
    cuisineType: 'Nepali, Fish Specials, Lounge, Fast Food',
    openingTime: '11:00:00',
    closingTime: '22:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '200.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.75',
    totalReviews: 132,
    logoUrl:
      'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    categories: [
      {
        name: 'Fish & Sekuwa Specials',
        items: [
          {
            name: 'Tinau River Crispy Fish Fry',
            description:
              'Fresh local river fish marinated with mustard paste, garlic, and carom seeds, pan-fried to crisp perfection.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500&q=80',
          },
          {
            name: 'Charcoal Chicken Sekuwa',
            description:
              'Tender charcoal-skewered chicken chunks seasoned with authentic Himalayan timur and herbs.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
          },
          {
            name: 'Buff Sukuti Sadeko',
            description:
              'Sun-dried buffalo meat salad seasoned with roasted mustard oil, lemon, sliced onions, and chillies.',
            price: '250.00',
            imageUrl:
              'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 11. HIMALAYAN ARTISAN BAKERY (PUSPALAL PARK) ───
  {
    name: 'Himalayan Artisan Bakery',
    slug: 'himalayan-artisan-bakery-butwal',
    description:
      'Premier confectionery and coffee bakery at Puspalal Park, Butwal. Renowned for chocolate glazed donuts, cheesecakes, and morning breakfasts.',
    phone: '+977-71-543322',
    email: 'himalayanbakery.butwal@gmail.com',
    address: 'Puspalal Park, Butwal',
    wardNumber: 4,
    latitude: 27.7055,
    longitude: 83.4601,
    cuisineType: 'Bakery, Desserts, Breakfast, Cafe',
    openingTime: '07:00:00',
    closingTime: '21:00:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '100.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.86',
    totalReviews: 89,
    logoUrl:
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    categories: [
      {
        name: 'Artisan Bakes & Donuts',
        items: [
          {
            name: 'Chocolate Glazed Donut',
            description:
              'Fresh fluffy yeast ring donut coated in rich melted chocolate ganache and chocolate sprinkles.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80',
          },
          {
            name: 'French Butter Croissant',
            description:
              'Airy, golden French pastry with crisp flaky layers and authentic butter aroma.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
          },
          {
            name: 'Blueberry Swirl Cheesecake',
            description:
              'Velvety New York style cheesecake on a crumbly biscuit base topped with wild blueberry coulis.',
            price: '270.00',
            imageUrl:
              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
          },
          {
            name: 'Fresh Blueberry Muffin',
            description:
              'Tender vanilla muffin studded with sweet blueberries and finished with a crunchy top.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500&q=80',
          },
        ],
      },
    ],
  },

  // ─── 12. LUMBINI TANDOORI & NAAN CORNER (AMARPATH) ───
  {
    name: 'Lumbini Tandoori & Naan Corner',
    slug: 'lumbini-tandoori-butwal',
    description:
      'Beloved local tandoori grill and curry joint in Amarpath, Butwal. Famous for piping hot clay-oven naans, chicken tikka, and rich paneer curries.',
    phone: '+977-71-548811',
    email: 'lumbinitandoori.butwal@gmail.com',
    address: 'Amarpath, Butwal',
    wardNumber: 5,
    latitude: 27.6988,
    longitude: 83.4545,
    cuisineType: 'Indian, Tandoori, Street Food, Fast Food',
    openingTime: '11:00:00',
    closingTime: '22:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.68',
    totalReviews: 154,
    logoUrl:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    categories: [
      {
        name: 'Tandoori Grills & Curries',
        items: [
          {
            name: 'Charcoal Tandoori Chicken Tikka',
            description:
              'Boneless chicken cubes spiced with mustard oil, yogurt, and garam masala, roasted in clay oven.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80',
          },
          {
            name: 'Rich Butter Chicken',
            description:
              'Tender chicken simmered in a velvety smooth tomato cashew gravy with fenugreek leaves and butter.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
          },
          {
            name: 'Fresh Garlic Butter Naan',
            description:
              'Hot, fluffy tandoori naan brushed generously with butter and roasted garlic.',
            price: '60.00',
            imageUrl:
              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
          },
          {
            name: 'Chicken Kathi Roll',
            description:
              'Succulent grilled chicken and sliced onions rolled inside a warm buttery paratha.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&q=80',
          },
        ],
      },
    ],
  },
];

export async function seed() {
  console.log('Seeding Butwal restaurants, cafes, and verified menu items...');

  // Find or create default restaurant owner
  const owners = await sql.query(
    "SELECT id FROM users WHERE role = 'RESTAURANT_OWNER' LIMIT 1",
  );
  let ownerId: string;

  if (owners.length > 0) {
    ownerId = owners[0].id;
    console.log(`Using existing restaurant owner: ${ownerId}`);
  } else {
    const newOwner = await sql.query(
      `INSERT INTO users (
        email, password, first_name, last_name, phone_number, role, is_active, is_email_verified
      ) VALUES (
        'owner.butwal@khanago.com',
        '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecVhg9v9Z1Qp0t4Ky',
        'Butwal', 'Restaurateur', '+9779800000001', 'RESTAURANT_OWNER', true, true
      ) RETURNING id`,
    );
    ownerId = newOwner[0].id;
    console.log(`Created default restaurant owner: ${ownerId}`);
  }

  for (const r of BUTWAL_RESTAURANTS) {
    let restId: string;
    const existing = await sql.query(
      'SELECT id, name FROM restaurants WHERE slug = $1 LIMIT 1',
      [r.slug],
    );

    if (existing.length > 0) {
      restId = existing[0].id;
      console.log(`Updating "${r.name}" (ID: ${restId})...`);
      await sql.query(
        `UPDATE restaurants 
         SET is_active = true, is_open = true, is_verified = true, deleted_at = NULL,
             address = $1, latitude = $2, longitude = $3, cuisine_type = $4,
             logo_url = $5, cover_image_url = $6, description = $7, phone = $8,
             delivery_fee = $9, estimated_delivery_time = $10, average_rating = $11, total_reviews = $12
         WHERE id = $13`,
        [
          r.address,
          r.latitude,
          r.longitude,
          r.cuisineType,
          r.logoUrl,
          r.coverImageUrl,
          r.description,
          r.phone,
          r.deliveryFee,
          r.estimatedDeliveryTime,
          r.averageRating,
          r.totalReviews,
          restId,
        ],
      );
    } else {
      const inserted = await sql.query(
        `INSERT INTO restaurants (
          owner_id, name, slug, description, phone, email, address, ward_number,
          latitude, longitude, cuisine_type, opening_time, closing_time,
          delivery_fee, minimum_order_amount, estimated_delivery_time,
          is_active, is_open, is_verified, average_rating, total_reviews,
          logo_url, cover_image_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          true, true, true, $17, $18, $19, $20
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
        console.log(`  Category: ${cat.name}`);
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
          console.log(`    + Dish added: ${item.name} (Rs. ${item.price})`);
        } else {
          // Update item to ensure image, description, and price accurately match
          await sql.query(
            `UPDATE menu_items
             SET category_id = $1, description = $2, price = $3, image_url = $4, is_available = true
             WHERE id = $5`,
            [
              catId,
              item.description,
              item.price,
              item.imageUrl,
              existingItem[0].id,
            ],
          );
          console.log(`    ~ Dish updated with matching image: ${item.name}`);
        }
      }
    }
  }

  // Also make sure all restaurants are verified and active
  await sql.query(
    `UPDATE restaurants SET is_active = true, is_open = true, is_verified = true WHERE deleted_at IS NULL`,
  );

  const countRest = await sql.query(
    'SELECT count(*) FROM restaurants WHERE is_active = true',
  );
  const countMenu = await sql.query(
    'SELECT count(*) FROM menu_items WHERE is_available = true',
  );

  console.log(
    `\nDONE! Active restaurants: ${countRest[0].count}, Active menu items: ${countMenu[0].count}`,
  );
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
