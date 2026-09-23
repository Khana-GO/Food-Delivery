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
  // ─────────────────────────────────────────────────────────────
  // 1. THE VILLAGE CAFE & RESTAURANT (Devinagar)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'The Village Cafe & Restaurant',
    slug: 'the-village-cafe-restaurant-butwal',
    description:
      'Premier garden family restaurant in Devinagar, Butwal. Renowned for authentic Thakali khana sets, sizzling platters, charcoal sekuwa, and continental starters in a lush outdoor setting.',
    phone: '+977-71-546820',
    email: 'thevillagecafe.butwal@gmail.com',
    address: 'Devinagar, Butwal',
    wardNumber: 11,
    latitude: 27.6885,
    longitude: 83.456,
    cuisineType: 'Nepali, Thakali, Continental, Sizzlers',
    openingTime: '09:00:00',
    closingTime: '22:30:00',
    deliveryFee: '30.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.80',
    totalReviews: 142,
    logoUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Thakali & Traditional Khana',
        items: [
          {
            name: 'Special Village Thakali Thali (Mutton)',
            description:
              'Mustang aromatic rice served with slow-cooked tender local mutton curry, black lentils (kalo daal), gundruk sandheko, timur achar, ghee, and roasted papad.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Thakali Chicken Thali Set',
            description:
              'Authentic Thakali platter with juicy chicken in country-style spiced gravy, jimbu aloo, seasonal saag, fresh radish pickle, and steamed basmati rice.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Village Veg Thakali Thali',
            description:
              'Wholesome pure-ghee vegetarian thali with paneer butter gravy, jimbu-tempered lentils, karela chips, gundruk, and mint chutney.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fapar ko Dhido Set (Local Chicken)',
            description:
              'Traditional hot buckwheat dhido served with village-style chicken gravy, clarified butter, and fiery silam achar.',
            price: '450.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Sizzlers & Grills',
        items: [
          {
            name: 'Chicken Sizzler with Mushroom Pepper Sauce',
            description:
              'Grilled chicken breast resting on buttered noodles and garden vegetables, drenched in sizzling mushroom pepper sauce.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Paneer Tikka Sizzler',
            description:
              'Tandoori cottage cheese cubes served over bed of seasoned fried rice, grilled bell peppers, and sizzler garlic gravy.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Charcoal Mutton Sekuwa Plate',
            description:
              'Skewered mutton cubes marinated in roasted spices and smoked over natural sal wood charcoal. Served with puffed baji and hot chutney.',
            price: '440.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'BBQ Chicken Wings (8 pcs)',
            description:
              'Crispy smoked wings tossed in rich honey-smokey barbecue glaze, served with house ranch dip.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Momo & Noodles',
        items: [
          {
            name: 'Village Special Kothey Momo',
            description:
              'Pan-seared half-steamed half-crisp chicken dumplings with ginger-infused soup and spicy tomato sesame chutney.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fiery Chilli C-Momo (Chicken)',
            description:
              'Deep-fried dumplings tossed in smoking hot wok with diced capsicum, onions, dark soya, and Nepali timur chilli sauce.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Himalayan Chicken Thukpa',
            description:
              'Comforting bowl of hand-pulled noodles simmered in rich chicken bone broth with shredded chicken and mountain herbs.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Village Keema Chowmein',
            description:
              'Stir-fried wok noodles loaded with spiced chicken keema mince, crunchy shredded greens, and roasted cumin.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Appetizers & Khaja Bites',
        items: [
          {
            name: 'Crispy Corn Salt & Pepper',
            description:
              'Sweet corn kernels batter-fried until golden, tossed with crushed pepper, spring onions, and lime.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Chhoyela with Chiura',
            description:
              'Traditional roasted chicken shredded and tossed in mustard oil, green chillies, fenugreek, and garlic. Served with crispy flattened rice.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cheesy Garlic French Fries',
            description:
              'Crispy cut potatoes loaded with melted mozzarella, roasted garlic butter, and chopped herbs.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Chicken Sausage Chilli',
            description:
              'Sliced chicken sausages stir-fried with green chillies, scallions, onions, and spicy tomato reduction.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Beverages & Coolers',
        items: [
          {
            name: 'Fresh Mint Virgin Mojito',
            description:
              'Muddled fresh mountain mint leaves, tangy lime wedges, brown sugar syrup, and chilled club soda.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Thick Belgian Chocolate Shake',
            description:
              'Decadent blend of Dutch cocoa, creamy dairy milk, vanilla ice cream, and chocolate syrup drizzle.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sweet Himalayan Lassi',
            description:
              'Traditional hand-churned thick curd drink topped with pistachio and cardamom powder.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Devinagar Iced Lemon Peach Tea',
            description:
              'Brewed organic Ilam black tea infused with peach fruit essence and freshly squeezed lemon juice.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. ROADHOUSE CAFE BUTWAL (D-VILLAGE, Kalikanagar)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Roadhouse Cafe Butwal (D-Village)',
    slug: 'roadhouse-cafe-butwal',
    description:
      'The crown jewel of Italian and Continental dining in Kalikanagar, Butwal. World-famous for hand-stretched woodfired pizzas, al dente creamy pastas, gourmet smash burgers, and Italian espresso.',
    phone: '+977-71-549012',
    email: 'roadhouse.butwal@gmail.com',
    address: 'Kalikanagar, Butwal',
    wardNumber: 9,
    latitude: 27.693,
    longitude: 83.465,
    cuisineType: 'Italian, Pizza, Continental, Cafe',
    openingTime: '10:00:00',
    closingTime: '23:00:00',
    deliveryFee: '35.00',
    minimumOrderAmount: '200.00',
    estimatedDeliveryTime: 30,
    averageRating: '4.88',
    totalReviews: 210,
    logoUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Woodfired Italian Pizzas',
        items: [
          {
            name: 'Roadhouse Classic Margherita (12 inch)',
            description:
              'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves, and cold-pressed extra virgin olive oil.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'BBQ Smoked Chicken Pizza',
            description:
              'Slow-cooked smoked chicken chunks, red onions, charred bell peppers, mozzarella, and smokey hickory barbecue drizzle.',
            price: '580.00',
            imageUrl:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Pepperoni & Jalapeno Pizza',
            description:
              'Crispy beef pepperoni slices, sliced pickled jalapeños, crushed chilli flakes, and double mozzarella blend.',
            price: '640.00',
            imageUrl:
              'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Four Cheese Quattro Formaggi',
            description:
              'Gourmet white base with mozzarella, creamy gorgonzola, aged parmesan, and cheddar, finished with wild oregano.',
            price: '620.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Handmade Pastas',
        items: [
          {
            name: 'Fettuccine Alfredo with Grilled Chicken',
            description:
              'Tender ribbons of fresh fettuccine tossed in velvety parmesan cream, garlic butter, and herb-seared chicken strips.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Penne Arrabbiata (Spicy Red Sauce)',
            description:
              'Penne pasta cooked al dente in a spicy sauce of San Marzano tomatoes, garlic, extra virgin olive oil, and dried red chilli peppers.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Creamy Basil Pesto Spaghetti',
            description:
              'Spaghetti folded with crushed Genovese basil, pine nuts, roasted garlic, parmesan, and cream with cherry tomatoes.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Baked Cheesy Macaroni',
            description:
              'Macaroni enveloped in three-cheese béchamel, topped with seasoned breadcrumbs and baked golden brown.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Gourmet Burgers & Paninis',
        items: [
          {
            name: 'Roadhouse Truffle Smash Burger',
            description:
              'Double ground chicken patties smashed with caramelized onions, cheddar cheese, truffle mayo on brioche bun.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Peri-Peri Chicken Burger',
            description:
              'Spicy dredged chicken thigh fillet with peri-peri glaze, crunchy iceberg lettuce, pickles, and chipotle mayo.',
            price: '350.00',
            imageUrl:
              'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Grilled Chicken & Pesto Panini',
            description:
              'Crisp pressed ciabatta bread stuffed with sliced grilled chicken, homemade basil pesto, and molten mozzarella.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cheesy Garlic Bread Sticks',
            description:
              'Freshly baked dough brushed with rosemary garlic butter, smothered with mozzarella, and served with marinara dip.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Salads & Light Plates',
        items: [
          {
            name: 'Classic Caesar Salad with Chicken',
            description:
              'Crisp romaine lettuce, house-cured chicken slices, herb croutons, and aged parmesan shavings tossed in authentic Caesar dressing.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Golden Fish & Chips',
            description:
              'Light and airy beer-battered fish fillets served with steak fries, house tartar sauce, and lemon wedge.',
            price: '440.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Loaded Pulled Chicken Nachos',
            description:
              'Crispy corn tortilla chips blanketed with warm queso cheese sauce, pulled chicken, jalapeños, salsa, and sour cream.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Calamari Rings',
            description:
              'Tender squid rings dusted with seasoned flour, flash-fried and served with spicy sriracha garlic aioli.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Espresso Bar & Shakes',
        items: [
          {
            name: 'Artisan Vanilla Cappuccino',
            description:
              'Double shot of fresh Himalayan arabica beans with steamed velvet microfoam and Madagascar vanilla bean.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Iced Caramel Macchiato',
            description:
              'Chilled whole milk marked with bold espresso, sweetened with vanilla syrup and topped with buttery caramel lattice.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'New York Baked Cheesecake Slice',
            description:
              'Rich and dense baked cream cheese resting on graham cracker crust with wild strawberry coulis.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Oreo Crumble Milkshake',
            description:
              'Thick shake blended with vanilla bean ice cream, crushed Oreo cookies, and fresh whipped cream.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. CAFE DE FLAMINGO (Horizon Chowk, Kalikanagar)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Cafe de Flamingo',
    slug: 'cafe-de-flamingo-butwal',
    description:
      'Trendy rooftop lounge cafe at Horizon Chowk, Kalikanagar. Offering picturesque sunset views, Mexican tacos, crispy wings, creamy pastas, handcrafted smoothies, and youthful vibes.',
    phone: '+977-71-551120',
    email: 'flamingo.butwal@gmail.com',
    address: 'Horizon Chowk, Kalikanagar, Butwal',
    wardNumber: 9,
    latitude: 27.6955,
    longitude: 83.4675,
    cuisineType: 'Cafe, Mexican, Continental, Fast Food',
    openingTime: '10:30:00',
    closingTime: '23:30:00',
    deliveryFee: '30.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.75',
    totalReviews: 184,
    logoUrl:
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Mexican Tacos & Nachos',
        items: [
          {
            name: 'Flamingo Grilled Chicken Tacos (3 pcs)',
            description:
              'Crispy corn taco shells stuffed with spiced shredded chicken, pico de gallo, shredded lettuce, and creamy cilantro sauce.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cheesy Fiesta Nachos Grande',
            description:
              'Warm tortilla chips layered with molten cheddar, seasoned black beans, jalapeños, guacamole, and sour cream.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Paneer Chimichanga',
            description:
              'Golden deep-fried flour tortilla pocket filled with spiced cottage cheese, corn, peppers, and salsa.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mexican Burrito Bowl (Chicken)',
            description:
              'Hearty bowl with seasoned cilantro lime rice, chipotle chicken, sweet corn salsa, guacamole, and crispy nachos.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Burgers & Wraps',
        items: [
          {
            name: 'Flamingo Monster Chicken Burger',
            description:
              'Double crispy chicken fillets with bacon rashers, cheddar slice, gherkins, and spicy peri-peri secret mayo.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Grilled Teriyaki Chicken Wrap',
            description:
              'Tender chicken glazed in Japanese teriyaki, rolled with bell peppers and greens in a toasted whole wheat tortilla.',
            price: '270.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crunchy Veggie Supreme Burger',
            description:
              'Crispy spiced vegetable and potato patty topped with melted cheese, tomato, and tangy cocktail spread.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Paneer Tikka Wrap',
            description:
              'Flame-grilled tandoori paneer rolled with mint mayo, sliced red onions, and chat masala in soft flatbread.',
            price: '250.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Wings & Starters',
        items: [
          {
            name: 'Peri-Peri Glazed Chicken Wings (6 pcs)',
            description:
              'Crispy fried wings tossed in zesty African bird’s eye peri-peri glaze with lemon and garlic zest.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527477321005-4d45d724b8c4?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Honey Chilli Potatoes',
            description:
              'Crisp fried potato fingers coated in a sticky wok-tossed sauce of honey, red chillies, and roasted sesame seeds.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Chicken Popcorn Basket',
            description:
              'Bite-sized seasoned chicken tenders fried to golden perfection, served with sweet chilli dip.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Flamingo Special Cheese Balls',
            description:
              'Molten cheddar and mozzarella herb balls encased in crunchy golden crumbs, served piping hot.',
            price: '230.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Pasta & Pizza',
        items: [
          {
            name: 'Chicken Alfredo Penne',
            description:
              'Creamy parmesan white sauce folded with seasoned chicken, sliced mushrooms, and fresh basil.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Flamingo Special Thin Crust Pizza (10 inch)',
            description:
              'Thin crust pizza with chicken sausage, olives, sweet corn, bell peppers, and melted mozzarella.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Schezwan Chicken Pizza',
            description:
              'Tangy and spicy schezwan base, shredded roasted chicken, capsicum, green chillies, and melted cheese.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spaghetti Aglio e Olio',
            description:
              'Spaghetti tossed in toasted garlic, extra virgin olive oil, chilli flakes, parsley, and parmesan cheese.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Mocktails & Desserts',
        items: [
          {
            name: 'Blue Ocean Lagoon Fizz',
            description:
              'Vibrant blue curaçao syrup, lime juice, sparkling soda, and crushed ice with a lemon slice garnish.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Strawberry Basil Refresher',
            description:
              'Real strawberry puree, torn basil leaves, lime, and chilled club soda.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sizzling Hot Brownie with Vanilla Ice Cream',
            description:
              'Rich chocolate fudge brownie served sizzling with a scoop of vanilla ice cream and warm chocolate ganache.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Nutella Cream Cold Coffee',
            description:
              'Blended espresso shake with thick swirls of hazelnut Nutella and whipped cream topping.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. NANGLO RESTAURANT & BAR (Traffic Chowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Nanglo Restaurant & Bar',
    slug: 'nanglo-restaurant-butwal',
    description:
      'Legendary multi-cuisine family landmark at Traffic Chowk, Butwal. Famous for creamy Butter Chicken, sizzling tandoori kebabs, authentic Indian breads, Chinese sizzlers, and warm hospitality for decades.',
    phone: '+977-71-540250',
    email: 'nanglo.butwal@gmail.com',
    address: 'Traffic Chowk, Butwal',
    wardNumber: 6,
    latitude: 27.7015,
    longitude: 83.46,
    cuisineType: 'North Indian, Chinese, Tandoori, Multi-Cuisine',
    openingTime: '11:00:00',
    closingTime: '23:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '180.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.70',
    totalReviews: 295,
    logoUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Indian Curries & Gravies',
        items: [
          {
            name: 'Nanglo Special Butter Chicken',
            description:
              'Clay oven tandoori chicken cooked in rich velvety satin gravy of plum tomatoes, butter, cashews, and fenugreek leaves.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mutton Rogan Josh',
            description:
              'Kashmiri style aromatic mutton curry simmered with browned onions, whole spices, and rich ratanjot gravy.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Butter Masala',
            description:
              'Succulent cubes of cottage cheese simmered in spiced tomato cashew butter sauce with aromatic kasoori methi.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Dal Makhani (Overnight Simmered)',
            description:
              'Whole black lentils and kidney beans slow-cooked overnight with white butter and fresh cream on low charcoal.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Tandoori Clay-Oven Specialties',
        items: [
          {
            name: 'Tandoori Murgh (Half Chicken)',
            description:
              'Whole bone-in chicken marinated in spiced hung yoghurt, mustard oil, and kashmiri deggi mirch, roasted in clay tandoor.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Tikka Kebab (6 pcs)',
            description:
              'Boneless chicken cubes skewered and charred to juicy perfection, served with mint chutney and onion rings.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hariyali Paneer Tikka',
            description:
              'Cottage cheese marinated with fresh mint, coriander, green chillies, and aromatic spices grilled in tandoor.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mutton Seekh Kebab',
            description:
              'Minced mutton blended with garlic, ginger, and ground garam masala, wrapped on skewers and charcoal-grilled.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Fresh Tandoori Breads & Rice',
        items: [
          {
            name: 'Garlic Butter Naan',
            description:
              'Refined flour bread slapped in tandoor, topped with minced roasted garlic, butter, and chopped coriander.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cheese Stuffed Naan',
            description:
              'Soft clay-oven baked naan stuffed generously with molten mozzarella and processed cheese.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Laccha Tandoori Paratha',
            description:
              'Multi-layered crispy whole wheat bread brushed with golden desi ghee.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Royal Chicken Dum Biryani',
            description:
              'Long-grain fragrant basmati rice layered with marinated spiced chicken, fried onions, saffron, served with raita.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Jeera Basmati Rice',
            description:
              'Fluffy steamed basmati rice tempered with roasted cumin seeds and fresh ghee.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Chinese & Indo-Chinese',
        items: [
          {
            name: 'Crispy Chilli Chicken (Dry)',
            description:
              'Diced chicken wok-tossed with fresh red & green bell peppers, spring onions, ginger, and dark soya chilli glaze.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Schezwan Fried Rice',
            description:
              'Wok-tossed rice with shredded chicken, scrambled eggs, carrots, and fiery homemade Schezwan sauce.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Veg Spring Rolls (4 pcs)',
            description:
              'Golden fried pastry cylinders filled with shredded cabbage, carrots, bell peppers, served with sweet chilli sauce.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Veg Manchurian Gravy',
            description:
              'Deep-fried vegetable dumplings simmered in savory garlic, ginger, and soya scallion gravy.',
            price: '230.00',
            imageUrl:
              'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Desserts & Beverages',
        items: [
          {
            name: 'Hot Gulab Jamun (2 pcs)',
            description:
              'Soft milk-solid dumplings fried golden and soaked in warm rosewater and green cardamom sugar syrup.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Special Nanglo Cold Coffee',
            description:
              'Chilled blended coffee with milk, vanilla ice cream, and Hershey’s chocolate syrup.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fresh Lime Soda (Sweet & Salt)',
            description:
              'Squeezed fresh lime juice, sugar syrup, rock salt, and sparkling soda.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Masala Spiced Buttermilk (Mohi)',
            description:
              'Traditional churned yoghurt drink blended with roasted cumin, green chilli, and ginger.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. KALASH RESTAURANT & PARTY PALACE (Milanchowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Kalash Restaurant & Party Palace',
    slug: 'kalash-restaurant-butwal',
    description:
      'Premier dining landmark in Milanchowk, Butwal. Renowned for royal Thakali feasts, charcoal-smoked mutton sekuwa, chicken taas, Hyderabadi biryani, and family celebration banquets.',
    phone: '+977-71-543180',
    email: 'kalash.butwal@gmail.com',
    address: 'Milanchowk, Butwal',
    wardNumber: 8,
    latitude: 27.698,
    longitude: 83.4625,
    cuisineType: 'Nepali, Thakali, Biryani, Mutton Sekuwa',
    openingTime: '09:30:00',
    closingTime: '22:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.68',
    totalReviews: 178,
    logoUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Royal Thakali Khana Sets',
        items: [
          {
            name: 'Kalash Special Mutton Thakali Thali',
            description:
              'Steamed basmati rice, tender mountain mutton in rich spiced gravy, jimbu-tempered black daal, gundruk sandheko, radish pickle, and papad.',
            price: '470.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Local Kukhura Thakali Thali',
            description:
              'Local country chicken simmered in traditional Nepali curry sauce with garlic, ginger, and turmeric, served in brass thali.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Deluxe Veg Thakali Set',
            description:
              'Fragrant rice, yellow dal, seasonal green saag, aloo bodi tama, mixed veg curry, curd, and home-churned ghee.',
            price: '270.00',
            imageUrl:
              'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Thakali Mutton Taas Set',
            description:
              'Tender marinated goat meat shallow-fried on flat iron griddle (tawa) with timur, served with puffed baji, spicy radish, and salad.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Sekuwa & Charcoal Grills',
        items: [
          {
            name: 'Kalash Signature Mutton Sekuwa',
            description:
              'Tender goat meat diced, steeped in 14 Nepali spices and charcoal-smoked over sal wood. Served with chiura and roasted tomato achar.',
            price: '430.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Sekuwa Platter',
            description:
              'Boneless chicken cubes grilled over smoking embers with fenugreek and mustard seed glaze.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Taas with Baji',
            description:
              'Crispy, spicy marinated chicken cooked on iron griddle with roasted cumin and garlic, served with spiced baji.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Sukuti Sandheko (Buff)',
            description:
              'Crispy dried meat tossed with raw mustard oil, roasted cumin, chopped onions, tomatoes, and spicy green chillies.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Biryani Khajana',
        items: [
          {
            name: 'Kalash Special Mutton Dum Biryani',
            description:
              'Slow-cooked mutton marinated in yoghurt and royal spices, layered with saffron basmati rice under dough seal (dum). Served with mirchi salan.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hyderabadi Chicken Dum Biryani',
            description:
              'Fragrant basmati rice cooked with spiced chicken, caramelized onions, fresh mint leaves, and brown onions.',
            price: '370.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Shahi Paneer Biryani',
            description:
              'Flavourful long-grain rice layered with golden paneer tikka, saffron, green peas, and whole spices.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Egg Biryani with Salan',
            description:
              'Boiled golden-fried eggs simmered in biryani spices and folded with long basmati grains.',
            price: '270.00',
            imageUrl:
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Momo & Snacks',
        items: [
          {
            name: 'Special Chicken Jhol Momo',
            description:
              'Steamed chicken momos immersed in a large bowl of hot, tangy sesame, soybean, and tomato broth.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fried Chicken C-Momo',
            description:
              'Deep-fried dumplings tossed with capsicum, onion rings, and fiery sweet-sour chilli garlic reduction.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Veg Steam Momo',
            description:
              'Delicate handmade parcels filled with grated cabbage, carrots, paneer, and mountain spices.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fresh Sweet Curd (Mitho Dahi)',
            description:
              'Creamy traditional set curd infused with crushed green cardamom and rock sugar.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chilled Lemon Soda',
            description:
              'Sparkling club soda with freshly squeezed lemon juice, black salt, and roasted cumin.',
            price: '85.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. THE BURGER HOUSE & CRUNCHY FRIED CHICKEN (CFC) (Devinagar)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'The Burger House & CFC',
    slug: 'burger-house-cfc-butwal',
    description:
      'The ultimate fast-food destination in Devinagar, Butwal. Famous for jumbo crunchy chicken burgers, 11-spice golden crispy fried chicken, loaded cheesy fries, hot wings, and cold shakes.',
    phone: '+977-71-547110',
    email: 'burgerhouse.butwal@gmail.com',
    address: 'Devinagar, Butwal',
    wardNumber: 11,
    latitude: 27.689,
    longitude: 83.4545,
    cuisineType: 'Fast Food, Burger, Fried Chicken, American',
    openingTime: '10:00:00',
    closingTime: '22:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.72',
    totalReviews: 310,
    logoUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Crunchy Chicken Burgers',
        items: [
          {
            name: 'CFC Double Crunch Chicken Burger',
            description:
              'Two extra-crispy fried chicken fillets stacked with double cheddar slices, crisp iceberg lettuce, and spicy burger relish.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Classic Zinger Chicken Burger',
            description:
              'Golden crunchy chicken thigh patty seasoned with peri-peri, topped with creamy mayonnaise and fresh lettuce.',
            price: '270.00',
            imageUrl:
              'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Smokey BBQ Bacon & Cheese Burger',
            description:
              'Charbroiled ground chicken patty, crispy bacon rasher, melted cheese, and sweet-smokey barbecue sauce.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cheesy Veggie Crunch Burger',
            description:
              'Golden fried mixed veg patty loaded with sweet corn, carrots, cheese slice, and garlic herb spread.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Crispy Fried Chicken (CFC)',
        items: [
          {
            name: 'CFC Crispy Fried Chicken Bucket (4 pcs)',
            description:
              'Bone-in juicy chicken pieces double-breaded in 11 secret herbs and spices, fried to shatteringly crisp perfection.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot & Spicy Chicken Wings (6 pcs)',
            description:
              'Crunchy breaded wings dusted with fiery cayenne and ghost pepper salt, served with tangy garlic dip.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527477321005-4d45d724b8c4?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Chicken Strips (5 pcs)',
            description:
              'Tender 100% chicken breast fillets crumb-coated and fried golden, served with sweet mustard sauce.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'CFC Popcorn Chicken Box',
            description:
              'Addictive bite-sized crispy chicken poppers seasoned with peri-peri, perfect for snacking on the go.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Loaded Fries & Wraps',
        items: [
          {
            name: 'Cheesy Melt French Fries',
            description:
              'Large portion of golden skin-on fries smothered in hot melted cheddar sauce and dried herbs.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'CFC Chicken Twister Wrap',
            description:
              'Crispy chicken strip rolled inside warm tortilla with tomato, shredded lettuce, and spicy pepper mayo.',
            price: '250.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Peri Peri Masala Fries',
            description:
              'Crisp french fries shaken with fiery South African peri-peri spice dust in a bag.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Onion Rings (8 pcs)',
            description:
              'Thick sweet onion rings dipped in seasoned batter, deep fried and served with hot garlic ketchup.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1639024471285-0570b200b2f6?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Momos & Noodles',
        items: [
          {
            name: 'CFC Crunchy Fried Momo (10 pcs)',
            description:
              'Chicken momos coated in crunchy cornflake batter and fried extra crisp. Served with spicy mayonnaise.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Hakka Chowmein',
            description:
              'Wok-tossed noodles with shredded chicken breast, bell peppers, carrots, spring onions, and dark soya.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot & Spicy Chicken C-Momo',
            description:
              'Deep-fried momos tossed in sweet and fiery chilli sauce with capsicum and diced onions.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Beverages & Shakes',
        items: [
          {
            name: 'CFC Signature Cold Coffee',
            description:
              'Rich blended coffee with vanilla ice cream, topped with cocoa powder dusting.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'KitKat Chocolate Milkshake',
            description:
              'Chilled milk blended with crispy KitKat wafers, chocolate syrup, and vanilla ice cream.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mango Frappe',
            description:
              'Refreshing iced mango fruit puree blended with sweet cream and crushed ice.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chilled Coca-Cola (500ml)',
            description: 'Ice-cold carbonated Coca-Cola bottle.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. HAMRO MOMO HUB (Traffic Chowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Hamro Momo Hub',
    slug: 'hamro-momo-hub-butwal',
    description:
      'The premier dumpling paradise at Traffic Chowk, Butwal. Specializing in over 10 varieties of momos: juicy Steam, Kothey, fiery Jhol, C-Momo, Open Momo, Sadheko, and comforting Tibetan Thukpa.',
    phone: '+977-71-542910',
    email: 'hamromomo.butwal@gmail.com',
    address: 'Traffic Chowk, Butwal',
    wardNumber: 6,
    latitude: 27.702,
    longitude: 83.4608,
    cuisineType: 'Momo, Fast Food, Nepali, Tibetan',
    openingTime: '08:30:00',
    closingTime: '21:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '100.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.85',
    totalReviews: 380,
    logoUrl:
      'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Chicken Momos',
        items: [
          {
            name: 'Classic Chicken Steam Momo (10 pcs)',
            description:
              'Juicy hand-folded dumplings packed with seasoned minced chicken, ginger, and onion. Served with spicy tomato and sesame achar.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Pan-Fried Chicken Kothey Momo',
            description:
              'Dumplings pan-fried to a golden crispy bottom while remaining soft and steamed on top. Served with roasted coriander chutney.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Deep-Fried Chicken Momo',
            description:
              'Golden deep-fried momos with a crunchy exterior and juicy interior, accompanied by spicy dipping sauce.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Open Momo with 4 Dips',
            description:
              'Unique open-top dumplings filled with chicken and served with 4 distinct regional chutneys (peanut, mint, timur, tomato).',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Spicy Jhol & C-Momos',
        items: [
          {
            name: 'Kathmandu Style Chicken Jhol Momo',
            description:
              'Steamed chicken momos served submerged in a bowl of hot, tangy roasted soybean, sesame, and hog-plum (lapsi) soup.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fiery Chicken C-Momo (Chilli)',
            description:
              'Crisp momos tossed in a blazing hot wok with dark soya, diced bell peppers, onions, and spicy chilli garlic glaze.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Chicken Sadheko Momo',
            description:
              'Boiled dumplings tossed cold with raw mustard oil, roasted cumin, chopped onions, fresh tomatoes, and green chillies.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Smoked Chicken Momo',
            description:
              'Dumplings coated in spiced yoghurt tandoori marinade and roasted over charcoal for a rich smokey flavor.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Buff & Mutton Momos',
        items: [
          {
            name: 'Juicy Buff Steam Momo (10 pcs)',
            description:
              'Traditional spiced water-buffalo mince dumplings seasoned with spring onions, garlic, and Himalayan spices.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Buff Jhol Momo with Spicy Achar',
            description:
              'Hot buff momos served inside a bowl of steaming spicy sesame and soybean broth.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Buff C-Momo (Wok Tossed)',
            description:
              'Crisp buff dumplings glazed in spicy wok gravy with crunchy capsicum and onions.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Buff Kothey Momo (Pan Fried)',
            description:
              'Crisp-bottom pan-fried buff momos served with fiery timur chhop and tomato chutney.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Veg & Paneer Delights',
        items: [
          {
            name: 'Fresh Veg Steam Momo (10 pcs)',
            description:
              'Delicate cabbage, carrot, and green onion stuffing wrapped in thin translucent dough.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Rich Paneer Cheese Steam Momo',
            description:
              'Grated fresh cottage cheese, processed cheese, and aromatic spices wrapped in handmade parcels.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Veg Jhol Momo Bowl',
            description:
              'Steamed vegetable dumplings swimming in warm, soothing roasted sesame and tomato broth.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Chilli C-Momo',
            description:
              'Crispy fried paneer dumplings tossed with green peppers and sweet-sour chilli glaze.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Tibetan Noodles & Beverages',
        items: [
          {
            name: 'Hot Chicken Thukpa',
            description:
              'Noodle soup loaded with shredded chicken, boiled egg, shredded cabbage, and mountain herbal broth.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Chicken Chowmein',
            description:
              'Stir-fried noodles with chicken, cabbage, bell peppers, carrots, and dark soya.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sweet Butwal Lassi',
            description:
              'Creamy churned yoghurt drink topped with chopped cashews and cardamom.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cold Coffee with Cream',
            description:
              'Chilled milk blended with instant coffee and sugar, served refreshing and cold.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. GAULE CHULO THAKALI BHANCHHA GHAR (Traffic Chowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Gaule Chulo Thakali',
    slug: 'gaule-chulo-thakali-butwal',
    description:
      'Authentic Mustang Thakali dining tradition in Traffic Chowk, Butwal. Renowned for pure-ghee Thakali Dal Bhat, Fapar ko Dhido, Local Kukhura ko Jhol, Jimbu Aloo, and homemade pickles.',
    phone: '+977-71-544190',
    email: 'gaulechulo.butwal@gmail.com',
    address: 'Traffic Chowk, Butwal',
    wardNumber: 6,
    latitude: 27.701,
    longitude: 83.4595,
    cuisineType: 'Nepali, Thakali, Traditional, Dhido',
    openingTime: '09:00:00',
    closingTime: '22:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.82',
    totalReviews: 240,
    logoUrl:
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Thakali Thali Khana Sets',
        items: [
          {
            name: 'Gaule Chulo Mutton Thakali Set',
            description:
              'Signature Thakali thali with Mustang kalo daal tempered with Himalayan jimbu herb, tender mountain goat curry, seasonal saag, gundruk sandheko, radish pickle, and pure ghee.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Local Kukhura Thakali Thali',
            description:
              'Free-range country chicken cooked in traditional village spices, served with aromatic rice, black lentils, fried papad, and home-pickled ginger.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Special Veg Thakali Thali',
            description:
              'Steamed basmati rice, jimbu-fried lentils, fresh rayo saag, aloo tareko, bodi tama, and mountain timur chutney.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fish Thakali Thali Set',
            description:
              'Fresh river fish curry simmered with mustard paste and fenugreek, served with complete Thakali accompaniments.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Dhido & Village Specials',
        items: [
          {
            name: 'Kodo ko Dhido with Local Chicken',
            description:
              'Nutritious millet flour pudding cooked over woodfire, served with flavorful local chicken broth and clarified ghee.',
            price: '440.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fapar ko Dhido with Mutton Gravy',
            description:
              'Buckwheat dhido paired with tender spiced mutton curry, gundruk achar, and timur chhop.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Veg Dhido Set with Gundruk Jhol',
            description:
              'Hot millet dhido with fermented leafy greens (gundruk and bodi) soup, saag, and tomato silam chutney.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sisnu ko Soup (Himalayan Nettle)',
            description:
              'Organic wild nettle green soup seasoned with roasted garlic and timur, renowned for natural health benefits.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Traditional Sides & Khaja',
        items: [
          {
            name: 'Mutton Sukuti Tareko with Chiura',
            description:
              'Sun-dried mountain goat meat deep-fried with garlic and green chillies, served with crunchy beaten rice.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Gundruk Bhatmas Sandheko',
            description:
              'Fermented green leaves and roasted crunchy soybeans tossed with mustard oil, fenugreek, and green chillies.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Aloo Tareko Jimbu Style',
            description:
              'Baby potatoes pan-roasted crispy with Himalayan jimbu aromatic herbs and turmeric.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mustang Local Chicken Fry',
            description:
              'Country chicken pieces marinated in mountain timur pepper and pan-fried golden.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Dessert & Refreshments',
        items: [
          {
            name: 'Himalayan Masala Mohi (Buttermilk)',
            description:
              'Churned local yoghurt drink seasoned with black salt, roasted cumin, and mint.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sweet Creamy Lassi',
            description:
              'Thick sweet yoghurt drink served chilled with pistachio slivers.',
            price: '100.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot Lemon Honey Ginger Tea',
            description:
              'Freshly brewed ginger tea with pure wild honey and fresh lemon squeeze.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Lalmohan (2 pcs)',
            description:
              'Sweet deep-fried khoya dumplings soaked in warm fragrant sugar syrup.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. LUMBINI TANDOORI & NAAN CORNER (Amarpath)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Lumbini Tandoori & Naan Corner',
    slug: 'lumbini-tandoori-butwal',
    description:
      'Amarpath’s favorite destination for North Indian clay-oven dining. Specializing in Butter Naans, Tandoori Chicken, Dal Makhani, Paneer Tikka, Chicken Korma, and street-style curries.',
    phone: '+977-71-541290',
    email: 'lumbinitandoori.butwal@gmail.com',
    address: 'Amarpath, Butwal',
    wardNumber: 4,
    latitude: 27.7035,
    longitude: 83.462,
    cuisineType: 'Indian, Tandoori, Street Food, Fast Food',
    openingTime: '11:00:00',
    closingTime: '22:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.62',
    totalReviews: 198,
    logoUrl:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Tandoor Oven Starters',
        items: [
          {
            name: 'Lumbini Tandoori Chicken (Half)',
            description:
              'Tender chicken marinated overnight in spiced hung curd, mustard oil, and kashmiri deggi mirch, roasted in clay oven.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Smoked Chicken Tikka (6 pcs)',
            description:
              'Boneless chicken morsels grilled with bell peppers and onions, basted in spiced butter.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Malai Chicken Tikka',
            description:
              'Creamy chicken skewers marinated in cashew paste, cheese, cardamom, and fresh heavy cream.',
            price: '370.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Achari Paneer Tikka',
            description:
              'Cottage cheese cubes marinated in pickling spices (panch phoran) and tandoor charred.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Rich Indian Curries',
        items: [
          {
            name: 'Murgh Makhani (Butter Chicken)',
            description:
              'Smoked tandoori chicken simmered in creamy satin gravy of tomatoes, butter, and dried fenugreek.',
            price: '430.00',
            imageUrl:
              'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Kadhai Chicken Masala',
            description:
              'Chicken wok-cooked with freshly pounded coriander seeds, black pepper, and crunchy capsicum chunks.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Lababdar',
            description:
              'Paneer cubes and grated cottage cheese in rich tomato-onion-cashew gravy with hint of sweet cream.',
            price: '330.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Dal Makhani Special',
            description:
              'Classic black lentils slow-cooked with fresh cream, butter, and mild Indian spices.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Naans, Rotis & Parathas',
        items: [
          {
            name: 'Fresh Butter Naan',
            description:
              'Soft leavened tandoor bread brushed generously with pure butter.',
            price: '60.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Garlic Naan',
            description:
              'Tandoori flatbread topped with minced roasted garlic and fresh coriander leaves.',
            price: '75.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cheese Garlic Naan',
            description:
              'Stuffed with molten cheese and topped with garlic butter.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Roti (Butter)',
            description: 'Whole wheat flour bread baked crisp in tandoor.',
            price: '35.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Lachha Paratha',
            description: 'Multi-layered flaky layered tandoor paratha.',
            price: '65.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Biryani & Rice Bowls',
        items: [
          {
            name: 'Dum Chicken Biryani Bowl',
            description:
              'Basmati rice, spiced chicken thigh, fried onions, and saffron served with mixed raita.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Veg Dum Biryani with Raita',
            description:
              'Fresh carrots, beans, peas, and paneer cooked with biryani spices and fragrant rice.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Jeera Basmati Rice',
            description: 'Steamed basmati rice tempered with cumin and ghee.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Drinks & Lassi',
        items: [
          {
            name: 'Punjabi Sweet Malai Lassi',
            description:
              'Traditional churned yoghurt drink crowned with thick clotted cream.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mango Lassi Special',
            description: 'Sweet yoghurt blended with fresh Alphonso mango pulp.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Gulab Jamun with Rabdi',
            description:
              'Warm gulab jamun soaked in syrup and served over chilled thickened rabdi.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fresh Lime Soda',
            description: 'Zesty lemon juice with chilled sparkling soda water.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. NEWARI KHAJA GHAR BUTWAL (Milanchowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Newari Khaja Ghar',
    slug: 'newari-khaja-ghar-butwal',
    description:
      'Authentic Kathmandu valley Newari culinary traditions brought to Milanchowk, Butwal. Famous for Samay Baji sets, spicy Buff Choila, crispy Egg Bara, Chatamari, Aalu Tama, and Chhoyela.',
    phone: '+977-71-545220',
    email: 'newarikhaja.butwal@gmail.com',
    address: 'Milanchowk, Butwal',
    wardNumber: 8,
    latitude: 27.6975,
    longitude: 83.461,
    cuisineType: 'Newari, Traditional, Khaja, Ethnic Nepali',
    openingTime: '10:00:00',
    closingTime: '21:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.78',
    totalReviews: 215,
    logoUrl:
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Samay Baji & Platters',
        items: [
          {
            name: 'Special Royal Samay Baji Platter',
            description:
              'Traditional festive platter with baji (beaten rice), buff choila, boiled fried egg, black soybean (bhatmas), spicy potato achar (alu wala), ginger, and fresh garlic.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Samay Baji Set',
            description:
              'Flavorsome Newari platter with chicken chhoyela, fried egg, seasoned beaten rice, black soya, and sour lapsi pickle.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Veg Samay Baji Set',
            description:
              'Pure vegetarian Newari platter featuring spiced wo (lentil pancake), alu tama, bhatmas, and beaten rice.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Aalu Tama Bodi Soup with Chiura',
            description:
              'Sour and spicy traditional curry made of fermented bamboo shoots (tama), black-eyed beans (bodi), and potatoes.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Choila & Sekuwa Specials',
        items: [
          {
            name: 'Authentic Buff Choila (Haku Choila)',
            description:
              'Charbroiled buffalo meat marinated with roasted mustard oil, fenugreek, garlic, ginger, and spicy green chillies.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Chhoyela with Baji',
            description:
              'Tender roasted chicken strips seasoned with toasted spices, garlic, and hot mustard oil, served with beaten rice.',
            price: '230.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Buff Bhutan (Fried Offal)',
            description:
              'Traditional crispy pan-fried spiced intestine and tripe with onions, garlic, and hot green chillies.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Kachila Special',
            description:
              'Finely minced buffalo meat tempered in warm mustard oil, roasted fenugreek, and Newari spices.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Bara & Chatamari (Newari Pizza)',
        items: [
          {
            name: 'Egg & Keema Bara (Black Lentil Pancake)',
            description:
              'Traditional savoury pancake made of ground black lentils, topped with seasoned minced meat and fried egg.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Plain Savoury Bara (Wo)',
            description:
              'Crispy, golden-fried black lentil patty served hot with tomato and coriander chutney.',
            price: '100.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Keema Chatamari (Newari Pizza)',
            description:
              'Thin crisp rice-crepe crust baked on flat griddle, topped with spiced minced chicken, egg, and fresh coriander.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Egg Chatamari with Cheese',
            description:
              'Delicate rice flour pancake topped with sunny egg, melted cheese, and chopped spring onions.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Khaja Snacks & Beverages',
        items: [
          {
            name: 'Spicy Sukuti Sadheko',
            description:
              'Crisp dried meat tossed with raw mustard oil, onions, garlic, and fresh green chillies.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Buff Momos in Spicy Newari Achar',
            description:
              'Juicy steamed dumplings served with authentic spicy tomato and roasted sesame Newari chutney.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Special Newari Yomari (2 pcs)',
            description:
              'Festive steamed rice flour confection filled with chaku (molasses) and sesame seeds.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fresh Mint Lassi',
            description:
              'Hand-churned refreshing curd drink with wild mint essence and rock sugar.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 11. HIMALAYAN ARTISAN BAKERY & COFFEE (Puspalal Park)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Himalayan Artisan Bakery',
    slug: 'himalayan-artisan-bakery-butwal',
    description:
      'Artisanal European-style bakery and specialty espresso bar near Puspalal Park, Butwal. Renowned for freshly baked croissants, sourdough loaves, Red Velvet cakes, Dutch chocolate pastries, and organic mountain espresso.',
    phone: '+977-71-546090',
    email: 'himalayanbakery.butwal@gmail.com',
    address: 'Puspalal Park, Butwal',
    wardNumber: 5,
    latitude: 27.705,
    longitude: 83.4635,
    cuisineType: 'Bakery, Desserts, Breakfast, Cafe',
    openingTime: '07:00:00',
    closingTime: '21:00:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.86',
    totalReviews: 165,
    logoUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Artisan Cakes & Cheesecakes',
        items: [
          {
            name: 'Belgian Dark Chocolate Truffle Cake (Slice)',
            description:
              'Decadent moist chocolate sponge layered with 70% dark Belgian ganache and chocolate curls.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'New York Blueberry Cheesecake',
            description:
              'Classic baked cream cheesecake on graham crust, crowned with wild blueberry compote.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Red Velvet Supreme Cake Slice',
            description:
              'Crimson cocoa sponge layered with silky Italian cream cheese frosting and white chocolate dusting.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Classic Black Forest Pastry',
            description:
              'Chocolate sponge soaked in cherry liqueur syrup, whipped dairy cream, and maraschino cherries.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Fresh Croissants & Breads',
        items: [
          {
            name: 'Butter French Croissant (Fresh Baked)',
            description:
              'Flaky, golden laminated French pastry made with pure Normandy-style butter.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chocolate Pain au Chocolat',
            description:
              'Crisp layered puff pastry enveloping two batons of semi-sweet dark chocolate.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Artisan Country Sourdough Loaf',
            description:
              'Naturally fermented crusty sourdough loaf with chewy open crumb and subtle tangy flavor.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cinnamon Swirl Danish Roll',
            description:
              'Puff pastry swirled with Ceylon cinnamon sugar and topped with vanilla glaze.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Gourmet Breakfast & Sandwiches',
        items: [
          {
            name: 'Smoked Chicken & Cheddar Croissant',
            description:
              'Warm butter croissant stuffed with sliced smoked chicken breast, aged cheddar, and honey mustard.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Grilled Vegetable & Pesto Panini',
            description:
              'Sourdough bread pressed with roasted zucchini, bell peppers, fresh pesto, and mozzarella.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Belgian Waffles with Maple Syrup',
            description:
              'Two golden crisp waffles served warm with butter, pure maple syrup, and fresh banana slices.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Classic Chicken Club Sandwich',
            description:
              'Triple-decker toasted bread filled with chicken salad, boiled egg, cheese, and crunchy lettuce.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Specialty Coffee Bar',
        items: [
          {
            name: 'Artisan Cafe Latte (Hot)',
            description:
              'Smooth single-origin espresso shot poured over velvety steamed whole milk with latte art.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Iced Caramel Americano',
            description:
              'Double shot of bold espresso over cold water and ice with a hint of salted caramel syrup.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mocha Chocochip Frappe',
            description:
              'Blended iced espresso with dark chocolate chips, creamy milk, and whipped cream.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot Chocolate Supreme',
            description:
              'Steamed milk melted with rich Dutch cocoa and topped with miniature marshmallows.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Pies & Savouries',
        items: [
          {
            name: 'Chicken Puff Pastry Patty',
            description:
              'Crisp flaky puff pastry stuffed with spiced minced chicken, black pepper, and herbs.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Masala Puff',
            description:
              'Flaky golden puff filled with savory spiced cottage cheese and peas.',
            price: '75.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Walnut Chocolate Fudge Brownie',
            description:
              'Dense chocolate brownie studded with toasted California walnut chunks.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Blueberry Muffin with Sugar Crust',
            description:
              'Moist vanilla muffin bursting with juicy blueberries and topped with crunchy sugar crust.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 12. CAFE BACHELOR (Golpark)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Cafe Bachelor',
    slug: 'cafe-bachelor-butwal',
    description:
      'Popular student and youth cafe in Golpark, Butwal. Famous for juicy momos, spicy chatpate, rolls, Keema chowmein, and chilled cold coffee at student-friendly prices.',
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
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Momo & Noodles',
        items: [
          {
            name: 'Chicken Steam Momo (10 pcs)',
            description:
              'Juicy hand-folded chicken dumplings served with spicy tomato and roasted sesame achar.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Fried C-Momo',
            description:
              'Crispy fried chicken momos tossed in fiery sweet-and-sour chilli garlic glaze with bell peppers.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Veg Steam Momo',
            description:
              'Fresh cabbage, paneer, and local vegetable filling seasoned with Himalayan herbs.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Chicken Hakka Chowmein',
            description:
              'Wok-tossed noodles with shredded chicken, crunchy cabbage, carrots, and spicy dark soya sauce.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Keema Chowmein Special',
            description:
              'Noodles loaded with spicy chicken keema mince and scallions.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Burgers & Kathi Rolls',
        items: [
          {
            name: 'Bachelor Special Chicken Burger',
            description:
              'Juicy chicken patty, melted cheese, crisp lettuce, and special cafe sauce on toasted sesame bun.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Double Egg Chicken Kathi Roll',
            description:
              'Layered paratha lined with two eggs, filled with spiced chicken pieces, sliced onions, and tangy sauce.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Veg Burger',
            description:
              'Golden vegetable patty, fresh tomato, cucumber, cheese slice, and creamy dressing.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Tikka Roll',
            description:
              'Soft flatbread wrapped with marinated grilled paneer, onions, and mint chutney.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Snacks & Street Fast Food',
        items: [
          {
            name: 'Spicy Golpark Chatpate',
            description:
              'Puffed rice, boiled potatoes, chickpeas, raw onions, and coriander tossed in spicy mustard oil and lemon juice.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Peri-Peri French Fries',
            description:
              'Golden cut fries dusted with zesty peri-peri spice mix, served with mayo dip.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Sausage Chilli',
            description:
              'Fried chicken sausage chunks tossed in wok with bell peppers and hot chilli sauce.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Nuggets Basket (6 pcs)',
            description:
              'Crispy breaded chicken nuggets served with ketchup and garlic mayonnaise.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Chilled Shakes & Coffee',
        items: [
          {
            name: 'Student Chilled Cold Coffee',
            description:
              'Creamy blended instant coffee with milk, chocolate syrup, and ice cubes.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Oreo Thick Shake',
            description:
              'Thick dairy shake blended with classic Oreo cookies and vanilla ice cream.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sweet Dahi Lassi',
            description:
              'Traditional sweet curd drink with crushed ice and cardamom.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Lemon Iced Tea',
            description:
              'Refreshing brewed black tea infused with lemon juice and crushed mint.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Hot Brews',
        items: [
          {
            name: 'Hot Masala Milk Tea',
            description:
              'Strong CTC milk tea brewed with crushed ginger, cardamom, and cinnamon.',
            price: '40.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot Cafe Latte',
            description: 'Steamed whole milk poured over rich espresso shot.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot Lemon Honey Ginger',
            description:
              'Zesty lemon, fresh ginger extract, and organic honey in warm water.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 13. LIME & LEMON LOUNGE CAFE (Horizon Chowk, Kalikanagar)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Lime & Lemon Lounge Cafe',
    slug: 'lime-lemon-lounge-butwal',
    description:
      'Chic casual dining lounge cafe at Horizon Chowk, Kalikanagar, Butwal. Renowned for Italian creamy pastas, Mexican fajitas, loaded cheesy nachos, gourmet pizzas, sizzlers, and refreshing signature mocktails.',
    phone: '+977-71-550210',
    email: 'limelemon.butwal@gmail.com',
    address: 'Horizon Chowk, Kalikanagar, Butwal',
    wardNumber: 9,
    latitude: 27.696,
    longitude: 83.467,
    cuisineType: 'Cafe, Continental, Italian, Fusion',
    openingTime: '10:00:00',
    closingTime: '23:00:00',
    deliveryFee: '30.00',
    minimumOrderAmount: '160.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.74',
    totalReviews: 195,
    logoUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Italian Pastas & Pizza',
        items: [
          {
            name: 'Penne Pollo Alfredo (White Sauce)',
            description:
              'Tender grilled chicken and mushrooms tossed in rich parmesan garlic white cream sauce.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spaghetti Bolognese with Minced Chicken',
            description:
              'Al dente spaghetti smothered in slow-simmered tomato ragu with minced chicken and herbs.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Lime & Lemon Special Pizza (12 inch)',
            description:
              'Thin crust pizza with chicken tikka, olives, capsicum, red onion, jalapeño, and mozzarella.',
            price: '520.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Classic Margherita Pizza',
            description:
              'San Marzano tomato puree, mozzarella, and fresh basil on hand-tossed crust.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Sizzlers & Main Course',
        items: [
          {
            name: 'Chicken Pepper Steak Sizzler',
            description:
              'Seared chicken breast resting on buttered noodles and veggies with peppercorn gravy on smoking iron platter.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cottage Cheese Shashlik Sizzler',
            description:
              'Grilled paneer and vegetable skewers on bed of spicy Mexican rice, served sizzling hot.',
            price: '410.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Lemon Butter Fish Fillet',
            description:
              'Pan-seared river fish fillet finished with lemon-caper butter sauce and herb mashed potatoes.',
            price: '460.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Grilled Chicken Breast with Herb Rice',
            description:
              'Marinated herb chicken breast served with steamed parsley butter rice and sauteed vegetables.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Tapas & Finger Food',
        items: [
          {
            name: 'Loaded Supreme Chicken Nachos',
            description:
              'Crispy tortilla chips covered in warm queso cheese sauce, pulled chicken, jalapeños, and salsa.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Calamari with Tartar Dip',
            description:
              'Seasoned golden-fried squid rings served with tangy house tartar sauce and lemon.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Buffalo Chicken Wings (6 pcs)',
            description:
              'Fried chicken wings coated in classic New York buffalo sauce, served with ranch dressing.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Stuffed Cheesy Garlic Bread',
            description:
              'French baguette filled with mozzarella and garlic butter, toasted until bubbling.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Signature Mocktails',
        items: [
          {
            name: 'Lime & Lemon Signature Green Apple Mojito',
            description:
              'Muddled mint leaves, tart green apple syrup, fresh lime juice, and chilled sparkling club soda.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Peach Passion Ice Tea',
            description:
              'Organic black tea cold brewed with passionfruit and peach essence.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Berry Blast Cooler',
            description:
              'Blended strawberry, blueberry, and cranberry with crushed ice and sprite.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Virgin Pina Colada',
            description:
              'Cream of coconut blended with pineapple juice and crushed ice.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Desserts & Coffees',
        items: [
          {
            name: 'Chocolate Lava Cake with Vanilla Gelato',
            description:
              'Warm molten chocolate center cake dusted with powdered sugar, served with ice cream.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Iced Hazelnut Latte',
            description:
              'Espresso poured over chilled milk and roasted hazelnut syrup.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tiramisu Cup',
            description:
              'Italian ladyfingers soaked in espresso, layered with mascarpone cream and cocoa powder.',
            price: '230.00',
            imageUrl:
              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 14. CHIYA NAGAR BUTWAL (Devinagar)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Chiya Nagar Butwal',
    slug: 'chiya-nagar-butwal',
    description:
      'Authentic tea lounge and comfort snack hub in Devinagar, Butwal. Renowned for Kulhad Matka Chiya, Masala Milk Tea, Aloo Paratha, Samosa Chaat, Paneer Pakodas, and traditional sweet lassi.',
    phone: '+977-71-548810',
    email: 'chiyanagar.butwal@gmail.com',
    address: 'Devinagar, Butwal',
    wardNumber: 11,
    latitude: 27.688,
    longitude: 83.455,
    cuisineType: 'Tea, Snacks, Breakfast, Cafe',
    openingTime: '06:30:00',
    closingTime: '21:00:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '80.00',
    estimatedDeliveryTime: 15,
    averageRating: '4.80',
    totalReviews: 155,
    logoUrl:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Special Matka & Herbal Teas',
        items: [
          {
            name: 'Kulhad Matka Chiya (Clay Cup)',
            description:
              'Slow-brewed CTC black tea with rich whole milk, crushed ginger, cardamom, and cloves served in an earthen clay pot.',
            price: '50.00',
            imageUrl:
              'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Special Kesari Masala Chiya',
            description:
              'Fragrant milk tea infused with real saffron strands, crushed almonds, cardamom, and fresh ginger.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Organic Ilam Green Tea',
            description:
              'Hand-picked loose green tea leaves from eastern Nepal hills, rich in natural antioxidants.',
            price: '60.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot Lemon Honey Ginger Tea',
            description:
              'Warming natural infusion of freshly pounded ginger, pure wild honey, and lemon juice.',
            price: '65.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Fresh Parathas & Breakfast',
        items: [
          {
            name: 'Spiced Aloo Paratha (2 pcs)',
            description:
              'Whole wheat flatbread stuffed with spiced mashed potatoes and green coriander, pan-fried in butter. Served with curd and pickle.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Stuffed Paratha',
            description:
              'Whole wheat paratha packed with grated fresh cottage cheese, cumin, and chillies, served with home pickle.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Egg Cheese Toast',
            description:
              'Golden butter-toasted sandwich stuffed with double fried egg, cheese slice, and black pepper.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Puri Tarkari Set (3 Puris)',
            description:
              'Fluffy deep-fried golden puris served with spicy potato chickpea gravy (aloo chana curry).',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Crispy Pakodas & Street Chaat',
        items: [
          {
            name: 'Special Samosa Chaat',
            description:
              'Crushed hot samosa topped with warm spiced chickpeas, sweet yoghurt, tamarind chutney, and fresh sev.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Onion Pakoda Basket',
            description:
              'Sliced red onions coated in seasoned gram flour batter, deep-fried crunchy, served with mint chutney.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Pakoda (6 pcs)',
            description:
              'Thick cubes of fresh cottage cheese batter-fried golden, dusted with chat masala.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Traditional Samosa (2 pcs)',
            description:
              'Crispy golden pastry stuffed with spiced potatoes, green peas, and cashews with tamarind dip.',
            price: '60.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Sweet Delights & Lassi',
        items: [
          {
            name: 'Devinagar Sweet Matka Lassi',
            description:
              'Thick hand-churned yoghurt drink served in clay matka, topped with malai cream and saffron.',
            price: '95.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hot Gulab Jamun (2 pcs)',
            description:
              'Soft golden khoya dumplings steeped in warm green cardamom syrup.',
            price: '70.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Banana Milkshake with Honey',
            description:
              'Fresh banana blended with cold milk, honey, and crushed almonds.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Iced Lemon Mint Soda',
            description:
              'Crisp carbonated soda with fresh squeezed lemon juice, mint, and black salt.',
            price: '75.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 15. PIZZA WORLD & FAST FOOD (Milanchowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Pizza World Butwal',
    slug: 'pizza-world-butwal',
    description:
      'The house of Cheese Burst pizzas in Milanchowk, Butwal. Renowned for hand-tossed pan pizzas, stuffed garlic breads, creamy white sauce pastas, calzones, and chilled chocolate shakes.',
    phone: '+977-71-542100',
    email: 'pizzaworld.butwal@gmail.com',
    address: 'Milanchowk, Butwal',
    wardNumber: 8,
    latitude: 27.6985,
    longitude: 83.463,
    cuisineType: 'Pizza, Italian-American, Fast Food',
    openingTime: '10:00:00',
    closingTime: '22:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.66',
    totalReviews: 172,
    logoUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Cheese Burst Hand-Tossed Pizzas',
        items: [
          {
            name: 'Chicken Supreme Cheese Burst Pizza (11 inch)',
            description:
              'Crust stuffed with hot molten cheese, topped with grilled chicken, chicken sausage, bell peppers, olives, and mozzarella.',
            price: '540.00',
            imageUrl:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'BBQ Smoked Chicken Pizza',
            description:
              'Marinated chicken chunks, diced red onions, jalapeños, and sweet barbecue sauce drizzle.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Tikka Fusion Pizza',
            description:
              'Tandoori spiced cottage cheese, capsicum, red paprika, and double mozzarella blend on thick crust.',
            price: '440.00',
            imageUrl:
              'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Farmhouse Garden Veggie Pizza',
            description:
              'Tomato sauce base, sweet corn, mushrooms, black olives, onions, and melted mozzarella.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Stuffed Breads & Calzones',
        items: [
          {
            name: 'Stuffed Cheesy Garlic Bread',
            description:
              'Fresh dough loaf folded with sweet corn, jalapeños, and gooey melted mozzarella cheese, brushed with garlic herb butter.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Calzone Folded Pocket',
            description:
              'Pizza dough folded and stuffed with seasoned chicken, tomato sauce, and molten cheese, baked golden.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Chicken Sausage Bites',
            description:
              'Sliced chicken sausages baked in garlic butter and spicy marinara with melted cheese topping.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cheese Dippers with Marinara',
            description:
              'Breaded mozzarella cheese sticks fried crisp, served with warm house marinara dip.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Creamy Pastas & Sides',
        items: [
          {
            name: 'Chicken White Sauce Penne Pasta',
            description:
              'Penne pasta cooked in rich creamy parmesan béchamel with diced chicken, garlic, and herbs.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Red Sauce Chicken Pasta',
            description:
              'Penne pasta in tangy tomato and red chilli sauce with chicken and bell peppers.',
            price: '320.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Crinkle Cut Fries',
            description:
              'Golden crinkle cut french fries seasoned with salt and spices.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Beverages & Shakes',
        items: [
          {
            name: 'Chocolate Brownie Shake',
            description:
              'Blended milkshake with chocolate cake fudge and vanilla ice cream.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chilled Cold Coffee',
            description:
              'Refreshing cold coffee with milk, sugar, and chocolate drizzle.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Coca-Cola Can (330ml)',
            description: 'Chilled can of Coca-Cola.',
            price: '60.00',
            imageUrl:
              'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 16. MUGHAL DARBAR RESTAURANT (Traffic Chowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Mughal Darbar Restaurant',
    slug: 'mughal-darbar-butwal',
    description:
      'Authentic royal Mughlai and Awadhi cuisine in Traffic Chowk, Butwal. Renowned for authentic Dum Mutton Biryani, Chicken Tikka Masala, Mutton Rogan Josh, and fragrant saffron breads.',
    phone: '+977-71-543880',
    email: 'mughaldarbar.butwal@gmail.com',
    address: 'Traffic Chowk, Butwal',
    wardNumber: 6,
    latitude: 27.7018,
    longitude: 83.4605,
    cuisineType: 'Mughlai, Indian, Biryani, Tandoori',
    openingTime: '11:00:00',
    closingTime: '22:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '160.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.71',
    totalReviews: 188,
    logoUrl:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Royal Biryani Specials',
        items: [
          {
            name: 'Mughal Shahi Mutton Dum Biryani',
            description:
              'Tender goat meat slow-cooked in rich Awadhi spices and layered with fragrant long-grain basmati rice under dum. Served with burani raita.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Lucknowi Chicken Dum Biryani',
            description:
              'Aromatic chicken pieces layered with saffron-scented basmati rice, caramelized onions, and kewra water.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Subz Dum Veg Biryani',
            description:
              'Fresh garden vegetables, cottage cheese, and saffron rice cooked on slow charcoal heat.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Egg Dum Biryani with Gravy',
            description:
              'Golden-fried spiced eggs layered with fragrant biryani rice and served with mirchi ka salan.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Mughlai Curries & Gravies',
        items: [
          {
            name: 'Chicken Tikka Masala',
            description:
              'Roasted tandoori chicken tikka cooked in rich onion-tomato gravy with cream and kasoori methi.',
            price: '430.00',
            imageUrl:
              'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Shahi Mutton Korma',
            description:
              'Slow-braised mutton cooked in velvety cashew, yoghurt, and saffron sauce with whole spices.',
            price: '490.00',
            imageUrl:
              'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Pasanda',
            description:
              'Cottage cheese stuffed with dry fruits and mint, simmered in rich creamy almond gravy.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mughal Dal Bukhara',
            description:
              'Whole black urad lentils slow-simmered for 12 hours with tomato puree and churned white butter.',
            price: '270.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Charcoal Kebabs',
        items: [
          {
            name: 'Chicken Reshmi Kebab (6 pcs)',
            description:
              'Melt-in-mouth boneless chicken marinated in cream, cashew paste, egg white, and mild spices.',
            price: '370.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Murgh (Full Chicken)',
            description:
              'Whole chicken marinated in Punjabi spices and hung yoghurt, roasted in hot clay oven.',
            price: '680.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mutton Galouti Kebab',
            description:
              'Ultra-fine minced mutton patties blended with 24 Awadhi spices, shallow fried on tawa.',
            price: '440.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Soya Chaap',
            description:
              'Soy skewers marinated in spiced yoghurt and mustard oil, grilled in tandoor.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Breads & Accompaniments',
        items: [
          {
            name: 'Kashmiri Sweet Naan',
            description:
              'Clay-oven baked naan stuffed with crushed dry fruits, cherries, and coconut.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Butter Garlic Naan',
            description:
              'Refined flour bread topped with minced roasted garlic and butter.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mixed Veg Boondi Raita',
            description:
              'Whipped chilled yoghurt with crispy fried chickpea pearls, cumin, and mint.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Roti',
            description: 'Crisp whole wheat bread from tandoor.',
            price: '30.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Sweet Endings & Beverages',
        items: [
          {
            name: 'Shahi Firni in Matka',
            description:
              'Slow-cooked ground rice pudding flavored with green cardamom, saffron, and silver leaf in earthen bowl.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Gulab Jamun (2 pcs)',
            description:
              'Hot khoya dumplings soaked in rose water sugar syrup.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Royal Saffron Lassi',
            description:
              'Thick sweet lassi infused with Iranian saffron and crushed almonds.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fresh Mint Lime Soda',
            description:
              'Sparkling soda with freshly squeezed lime, mint, and black salt.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 17. AAMA KO BHANSA GHAR (Milanchowk)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Aama ko Bhansa Ghar',
    slug: 'aama-ko-bhansa-ghar-butwal',
    description:
      'Comforting homestyle Nepali cooking at Milanchowk, Butwal. Famous for pure ghee Dal Bhat, Local Kukhura ko Jhol, Kodo ko Dhido, Gundruk Bhatmas sandheko, and heartwarming motherly tastes.',
    phone: '+977-71-549190',
    email: 'aamakobhansa.butwal@gmail.com',
    address: 'Milanchowk, Butwal',
    wardNumber: 8,
    latitude: 27.697,
    longitude: 83.4618,
    cuisineType: 'Authentic Nepali, Traditional, Dhido',
    openingTime: '09:00:00',
    closingTime: '21:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.84',
    totalReviews: 164,
    logoUrl:
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Homestyle Nepali Thali',
        items: [
          {
            name: 'Aama ko Local Chicken Thali',
            description:
              'Steamed basmati rice, tender local village chicken gravy, black lentils (kalo daal), seasonal green saag, aloo ko achar, papad, and dollop of ghee.',
            price: '370.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Homestyle Mutton Khana Set',
            description:
              'Flavorful goat meat curry cooked in village spices, served with complete traditional Nepali dal-bhat thali.',
            price: '450.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Shuddha Veg Thali Set',
            description:
              'Steamed rice, yellow dal, seasonal aloo saag, mixed vegetable curry, timur tomato chutney, and curd.',
            price: '240.00',
            imageUrl:
              'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tareko River Fish Thali',
            description:
              'Crispy pan-fried river fish served with spicy mustard gravy, rice, lentils, and fresh radish pickle.',
            price: '330.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Dhido & Sisnu Specials',
        items: [
          {
            name: 'Kodo ko Dhido Set with Local Chicken',
            description:
              'Nutritious hot millet dhido served with rich free-range chicken gravy, gundruk achar, and melting clarified butter.',
            price: '430.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fapar ko Dhido with Mutton Gravy',
            description:
              'Warm buckwheat dhido paired with traditional spiced mutton curry and silam chutney.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Organic Sisnu ko Soup',
            description:
              'Wild mountain stinging nettle soup seasoned with roasted garlic and timur pepper.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Gundruk ko Jhol with Bhat',
            description:
              'Sun-dried fermented greens soup with black-eyed beans, served with steamed rice.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Village Curries & Khaja',
        items: [
          {
            name: 'Local Kukhura ko Suruwa (Soup)',
            description:
              'Rich nourishing broth of free-range local chicken simmered with ginger, garlic, and turmeric.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Gundruk Bhatmas Sandheko',
            description:
              'Fermented greens and roasted soybeans tossed with mustard oil, fenugreek, and green chillies.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Aloo Dum Nepali Style',
            description:
              'Boiled potatoes tossed in thick spicy cumin, coriander, and tomato gravy.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sukuti Sadeko with Chiura',
            description:
              'Dried meat shreds pan-toasted with onions, mustard oil, and chillies, served with crunchy beaten rice.',
            price: '290.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Desi Beverages & Sweets',
        items: [
          {
            name: 'Mahi (Spiced Village Buttermilk)',
            description:
              'Freshly churned yoghurt with cumin, black salt, and coriander.',
            price: '60.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mitho Dahi (Sweet Curd)',
            description:
              'Creamy traditional curd topped with cardamom and brown sugar.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Masala Chiya',
            description:
              'Hot milk tea with aromatic cinnamon, cloves, and ginger.',
            price: '35.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fresh Lemon Soda',
            description: 'Chilled club soda with fresh lime juice and salt.',
            price: '75.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 18. PAUWA LOUNGE & RESTRO (Devinagar Highway)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Pauwa Lounge & Restro',
    slug: 'pauwa-lounge-restro-butwal',
    description:
      'Premier riverside lounge on Devinagar Highway, Butwal. Famous for Narayani river fish fry, Machha ko Jhol, tender chicken & mutton sekuwa, live barbecue, and outdoor garden cocktails.',
    phone: '+977-71-548120',
    email: 'pauwalounge.butwal@gmail.com',
    address: 'Devinagar Highway, Butwal',
    wardNumber: 11,
    latitude: 27.6865,
    longitude: 83.453,
    cuisineType: 'Nepali, Fish Specials, Lounge, Fast Food',
    openingTime: '11:00:00',
    closingTime: '23:30:00',
    deliveryFee: '30.00',
    minimumOrderAmount: '180.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.73',
    totalReviews: 145,
    logoUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Freshwater Fish Specials',
        items: [
          {
            name: 'Narayani Tareko Machha (Crispy Fish Fry)',
            description:
              'Fresh river fish marinated in mustard paste, turmeric, and carom seeds (ajwain), pan-fried until golden crisp.',
            price: '380.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Pauwa Signature Machha ko Jhol',
            description:
              'Tender fish simmered in a spiced broth of yellow mustard, tomatoes, fenugreek, and fresh green coriander.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Fish Sekuwa with Roasted Achar',
            description:
              'Boneless river fish cubes marinated with herbs and roasted on skewers over smoking charcoal.',
            price: '410.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Fish Finger Bites (8 pcs)',
            description:
              'Crumb-coated golden fish fingers served with spicy sriracha tartar sauce.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Sekuwa & Taas Platter',
        items: [
          {
            name: 'Pauwa Charcoal Mutton Sekuwa',
            description:
              'Smoked goat meat cubes steeped in Himalayan herbs, served with beaten rice and hot tomato dip.',
            price: '430.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Taas with Puffed Baji',
            description:
              'Spiced chicken cooked crisp on heavy iron tawa, served with baji, green salad, and radish pickle.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Chicken Chhoyela',
            description:
              'Char-grilled chicken shredded and seasoned with raw mustard oil, garlic, and hot chillies.',
            price: '280.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Corn Salt & Pepper',
            description:
              'Golden fried sweet corn kernels tossed with spring onions and cracked black pepper.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Momos & Main Course',
        items: [
          {
            name: 'Steamed Chicken Dumplings (10 pcs)',
            description:
              'Hand-pinched juicy chicken momos with house roasted sesame chutney.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Spicy Chilli C-Momo (Chicken)',
            description:
              'Crisp momos glazed in fiery wok sauce with bell peppers and onions.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Fried Rice Bowl',
            description:
              'Wok-tossed basmati rice with shredded chicken, eggs, and garden vegetables.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Chowmein Deluxe',
            description:
              'Stir-fried noodles with chicken, cabbage, bell peppers, and soya seasoning.',
            price: '200.00',
            imageUrl:
              'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Lounge Coolers & Beverages',
        items: [
          {
            name: 'Blue Lagoon Mocktail',
            description:
              'Blue curaçao citrus syrup, fresh lime, sprite, and crushed ice.',
            price: '170.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chilled Oreo Milkshake',
            description:
              'Thick shake blended with Oreo biscuits, vanilla ice cream, and chocolate fudge.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Virgin Mojito Fresh Mint',
            description:
              'Muddled mint leaves, lime juice, brown sugar, and sparkling soda.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Iced Lemon Tea',
            description:
              'Chilled brewed black tea with freshly squeezed lemon juice and mint.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 19. RED CHERRY BAKERY & COFFEE HOUSE (Amarpath)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Red Cherry Bakery & Coffee House',
    slug: 'red-cherry-bakery-butwal',
    description:
      'Amarpath’s premier boutique bakery and patisserie in Butwal. Renowned for custom designer birthday cakes, blueberry cheesecakes, warm butter croissants, savory chicken puffs, and iced caramel macchiatos.',
    phone: '+977-71-547720',
    email: 'redcherry.butwal@gmail.com',
    address: 'Amarpath, Butwal',
    wardNumber: 4,
    latitude: 27.7028,
    longitude: 83.4625,
    cuisineType: 'Bakery, Patisserie, Coffee, Cafe',
    openingTime: '07:30:00',
    closingTime: '21:30:00',
    deliveryFee: '20.00',
    minimumOrderAmount: '120.00',
    estimatedDeliveryTime: 20,
    averageRating: '4.83',
    totalReviews: 185,
    logoUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Artisan Cakes & Cheesecakes',
        items: [
          {
            name: 'Red Cherry Signature Forest Cake (Slice)',
            description:
              'Chocolate sponge layered with whipped cream, wild red cherries, and bittersweet chocolate shavings.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Classic Baked Blueberry Cheesecake',
            description:
              'Velvety baked cream cheese on buttery biscuit base with sweet wild blueberry topping.',
            price: '250.00',
            imageUrl:
              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Red Velvet Pastry with Cream Cheese',
            description:
              'Ruby-red cocoa sponge topped with smooth cream cheese frosting and red sponge crumb.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Dark Chocolate Fudge Brownie',
            description:
              'Dense chocolate fudge brownie loaded with dark chocolate chunks.',
            price: '140.00',
            imageUrl:
              'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Pastries & Puffs',
        items: [
          {
            name: 'Fresh French Butter Croissant',
            description:
              'Layered golden flaky pastry made with rich butter, baked fresh every morning.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Crispy Chicken Puff Pastry',
            description:
              'Flaky layered puff stuffed with spiced shredded chicken breast and black pepper.',
            price: '90.00',
            imageUrl:
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Paneer Masala Turnover',
            description:
              'Golden puff pastry triangle filled with spiced cottage cheese and peas.',
            price: '80.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cinnamon Sugar Donut',
            description:
              'Soft ring donut dusted with cinnamon and caster sugar.',
            price: '85.00',
            imageUrl:
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Sandwiches & Light Bites',
        items: [
          {
            name: 'Grilled Chicken & Mayo Sandwich',
            description:
              'Toasted sandwich bread filled with shredded chicken, mayonnaise, herbs, and lettuce.',
            price: '220.00',
            imageUrl:
              'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Coleslaw Cheese Sandwich',
            description:
              'Creamy cabbage and carrot coleslaw with cheddar cheese between buttered bread.',
            price: '160.00',
            imageUrl:
              'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'French Fries (Salted)',
            description:
              'Crispy golden french fries served with ketchup and garlic dip.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Belgian Chocolate Waffle',
            description:
              'Warm waffle smothered in melted chocolate ganache and chocolate chips.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Specialty Coffee Bar',
        items: [
          {
            name: 'Iced Caramel Macchiato',
            description:
              'Chilled milk with vanilla syrup, double espresso, and rich caramel lattice.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Cafe Latte (Hot)',
            description:
              'Smooth espresso shot balanced with steamed milk and delicate foam.',
            price: '150.00',
            imageUrl:
              'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Double Espresso Shot',
            description:
              'Concentrated bold shot of mountain-grown arabica coffee.',
            price: '100.00',
            imageUrl:
              'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mocha Frappuccino with Whipped Cream',
            description:
              'Blended iced coffee, chocolate syrup, milk, and sweet whipped cream.',
            price: '210.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Frappes & Shakes',
        items: [
          {
            name: 'Red Cherry Thick Strawberry Shake',
            description:
              'Sweet strawberry ice cream blended with cold milk and strawberry fruit chunks.',
            price: '180.00',
            imageUrl:
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chocolate KitKat Shake',
            description:
              'Creamy shake blended with KitKat wafer bars and chocolate syrup.',
            price: '190.00',
            imageUrl:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 20. BIRYANI MAHAL BUTWAL (Golpark)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Biryani Mahal Butwal',
    slug: 'biryani-mahal-butwal',
    description:
      'The authentic Royal Handi Dum Biryani specialists in Golpark, Butwal. Renowned for slow-cooked pot biryanis, juicy Galouti kebabs, spicy mirchi ka salan, fragrant chicken korma, and firni.',
    phone: '+977-71-541890',
    email: 'biryanimahal.butwal@gmail.com',
    address: 'Golpark, Butwal',
    wardNumber: 3,
    latitude: 27.7075,
    longitude: 83.4615,
    cuisineType: 'Biryani, Hyderabadi, Indian, Kebabs',
    openingTime: '11:00:00',
    closingTime: '22:30:00',
    deliveryFee: '25.00',
    minimumOrderAmount: '150.00',
    estimatedDeliveryTime: 25,
    averageRating: '4.80',
    totalReviews: 230,
    logoUrl:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
    categories: [
      {
        name: 'Handi Dum Biryanis',
        items: [
          {
            name: 'Mahal Special Mutton Dum Biryani (Clay Handi)',
            description:
              'Slow-cooked goat meat marinated in yoghurt and royal spices, layered with aged basmati rice under dough seal in clay pot. Served with salan and raita.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Hyderabadi Chicken Dum Biryani',
            description:
              'Classic dum-cooked chicken biryani seasoned with saffron, fresh mint, coriander, and fried golden onions.',
            price: '370.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Shahi Paneer Tikka Biryani',
            description:
              'Tandoori cottage cheese cubes layered with spiced basmati rice, green peas, and saffron.',
            price: '310.00',
            imageUrl:
              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Egg Dum Biryani',
            description:
              'Spiced fried eggs served over bed of rich saffron biryani rice with raita.',
            price: '260.00',
            imageUrl:
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Kebabs & Charcoal Starters',
        items: [
          {
            name: 'Mutton Seekh Kebab (4 pcs)',
            description:
              'Spiced minced goat meat skewers grilled over charcoal, served with mint chutney and onion salad.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Tangdi Kebab (3 pcs)',
            description:
              'Chicken drumsticks marinated in spiced curd, roasted in clay oven until tender and charred.',
            price: '360.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Chicken Boti Kebab',
            description:
              'Boneless chicken cubes grilled with black pepper, cumin, and garlic glaze.',
            price: '340.00',
            imageUrl:
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Chicken (Half)',
            description:
              'Classic bone-in tandoori chicken roasted to perfection in clay oven.',
            price: '390.00',
            imageUrl:
              'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Royal Curries & Naan',
        items: [
          {
            name: 'Chicken Korma Awadhi Style',
            description:
              'Chicken pieces simmered in rich gravy of cashews, fried onions, yoghurt, and rose water.',
            price: '420.00',
            imageUrl:
              'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Mutton Bhuna Masala',
            description:
              'Goat meat slow-roasted with whole spices and thick tomato onion masala.',
            price: '480.00',
            imageUrl:
              'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Butter Garlic Naan',
            description:
              'Tandoori leavened flatbread topped with garlic and butter.',
            price: '75.00',
            imageUrl:
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Tandoori Roti with Desi Ghee',
            description:
              'Whole wheat tandoori flatbread brushed with golden desi ghee.',
            price: '35.00',
            imageUrl:
              'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        name: 'Accompaniments & Desserts',
        items: [
          {
            name: 'Hyderabadi Mirchi ka Salan',
            description:
              'Traditional tangy green pepper and peanut-sesame curry served alongside biryani.',
            price: '110.00',
            imageUrl:
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Shahi Matka Firni',
            description:
              'Chilled slow-cooked ground rice pudding with cardamom and pistachios.',
            price: '130.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Sweet Saffron Lassi',
            description:
              'Churned yoghurt drink with saffron threads and crushed nuts.',
            price: '120.00',
            imageUrl:
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Warm Gulab Jamun (2 pcs)',
            description: 'Khoya dumplings soaked in rose cardamom sugar syrup.',
            price: '85.00',
            imageUrl:
              'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log('=== SEEDING BUTWAL CAFES & RESTAURANTS ===\n');

  // Find primary restaurant owner
  const owners = await sql`
    SELECT id, email FROM users
    WHERE role = 'RESTAURANT_OWNER'
    ORDER BY created_at ASC
    LIMIT 2
  `;

  if (owners.length === 0) {
    console.error('No RESTAURANT_OWNER user found. Cannot proceed.');
    process.exit(1);
  }

  const defaultOwnerId = owners[0].id;
  console.log(`Using primary owner ID: ${defaultOwnerId} (${owners[0].email})`);

  let totalItemsCount = 0;
  let totalCategoriesCount = 0;
  let totalRestaurantsCount = 0;

  for (const r of BUTWAL_RESTAURANTS) {
    console.log(`\nProcessing restaurant: ${r.name} (${r.slug})`);

    // Check if restaurant exists by slug or name
    let existing = await sql`
      SELECT id FROM restaurants WHERE slug = ${r.slug} OR name = ${r.name} LIMIT 1
    `;

    let restId: string;

    if (existing.length === 0) {
      const inserted = await sql`
        INSERT INTO restaurants (
          owner_id, name, slug, description, phone, email,
          address, ward_number, latitude, longitude,
          cuisine_type, opening_time, closing_time,
          delivery_fee, minimum_order_amount, estimated_delivery_time,
          average_rating, total_reviews,
          logo_url, cover_image_url,
          is_active, is_open, is_verified
        ) VALUES (
          ${defaultOwnerId}, ${r.name}, ${r.slug}, ${r.description}, ${r.phone}, ${r.email},
          ${r.address}, ${r.wardNumber}, ${r.latitude}, ${r.longitude},
          ${r.cuisineType}, ${r.openingTime}, ${r.closingTime},
          ${r.deliveryFee}, ${r.minimumOrderAmount}, ${r.estimatedDeliveryTime},
          ${r.averageRating}, ${r.totalReviews},
          ${r.logoUrl}, ${r.coverImageUrl},
          true, true, true
        ) RETURNING id
      `;
      restId = inserted[0].id;
      console.log(`  + Created restaurant with ID: ${restId}`);
    } else {
      restId = existing[0].id;
      await sql`
        UPDATE restaurants
        SET name = ${r.name},
            slug = ${r.slug},
            description = ${r.description},
            phone = ${r.phone},
            email = ${r.email},
            address = ${r.address},
            ward_number = ${r.wardNumber},
            latitude = ${r.latitude},
            longitude = ${r.longitude},
            cuisine_type = ${r.cuisineType},
            opening_time = ${r.openingTime},
            closing_time = ${r.closingTime},
            delivery_fee = ${r.deliveryFee},
            minimum_order_amount = ${r.minimumOrderAmount},
            estimated_delivery_time = ${r.estimatedDeliveryTime},
            average_rating = ${r.averageRating},
            total_reviews = ${r.totalReviews},
            logo_url = ${r.logoUrl},
            cover_image_url = ${r.coverImageUrl},
            is_active = true,
            is_open = true,
            is_verified = true,
            deleted_at = NULL
        WHERE id = ${restId}
      `;
      console.log(`  ~ Updated restaurant details with ID: ${restId}`);
    }

    totalRestaurantsCount++;

    // Seed categories and items
    for (const cat of r.categories) {
      let existingCat = await sql`
        SELECT id FROM menu_categories
        WHERE restaurant_id = ${restId} AND name = ${cat.name}
        LIMIT 1
      `;

      let catId: string;
      if (existingCat.length === 0) {
        const insertedCat = await sql`
          INSERT INTO menu_categories (restaurant_id, name)
          VALUES (${restId}, ${cat.name})
          RETURNING id
        `;
        catId = insertedCat[0].id;
      } else {
        catId = existingCat[0].id;
      }

      totalCategoriesCount++;

      for (const item of cat.items) {
        const existingItem = await sql`
          SELECT id FROM menu_items
          WHERE restaurant_id = ${restId} AND name = ${item.name}
          LIMIT 1
        `;

        if (existingItem.length === 0) {
          await sql`
            INSERT INTO menu_items (
              restaurant_id, category_id, name, description, price, image_url, is_available
            ) VALUES (
              ${restId}, ${catId}, ${item.name}, ${item.description}, ${item.price}, ${item.imageUrl}, true
            )
          `;
        } else {
          await sql`
            UPDATE menu_items
            SET category_id = ${catId},
                description = ${item.description},
                price = ${item.price},
                image_url = ${item.imageUrl},
                is_available = true
            WHERE id = ${existingItem[0].id}
          `;
        }
        totalItemsCount++;
      }
    }
  }

  // Ensure all restaurants are active, open, verified and undeleted
  await sql`
    UPDATE restaurants
    SET is_active = true, is_open = true, is_verified = true
    WHERE deleted_at IS NULL
  `;

  const [activeRests] = await sql`
    SELECT count(*)::int as count FROM restaurants WHERE is_active = true AND deleted_at IS NULL
  `;
  const [activeItems] = await sql`
    SELECT count(*)::int as count FROM menu_items WHERE is_available = true
  `;
  const [activeCats] = await sql`
    SELECT count(*)::int as count FROM menu_categories
  `;

  console.log('\n======================================================');
  console.log('✅ SEEDING COMPLETE!');
  console.log(`Active Restaurants: ${activeRests.count}`);
  console.log(`Total Menu Categories: ${activeCats.count}`);
  console.log(`Available Menu Items: ${activeItems.count}`);
  console.log('======================================================\n');
}

seed().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
