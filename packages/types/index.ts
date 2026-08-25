// Keep this runtime export compatible with Node's TypeScript strip-only mode.
// TypeScript enums require code generation, which that loader intentionally does
// not perform for workspace packages loaded directly from their .ts entrypoint.
export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role : UserRole,
    imageUrl?: string | null,
    createdAt: Date
}


export interface FoodItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: Date | string;
  data: FoodItem[];
}


export interface JwtPayload {
  sub: string;   // Subject (user ID)
  email: string;
  role: UserRole;
  // iat?: number; // Issued at time (optional)
  // exp?: number; // Expiration time (optional)
}


// Mirrors CuisineType enum in apps/api restaurant controller.
// Keep in sync when the backend adds new cuisines.
export const CUISINE_TYPES = [
  'Nepali',
  'Newari',
  'Thakali',
  'Indian',
  'Chinese',
  'Tibetan',
  'Italian',
  'Fast Food',
  'Continental',
  'Street Food',
  'Bakeries',
  'Desserts',
  'Drinks',
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];

export const WARD_NUMBERS = Array.from({ length: 35 }, (_, i) => i + 1);

export interface Restaurant {  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  email?: string;
  address: string;
  wardNumber?: number;
  latitude: number;
  longitude: number;
  cuisineType: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime?: number;
  isOpen: boolean;
  isActive: boolean;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantPayload {
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  address: string;
  wardNumber?: number;
  latitude: number;
  longitude: number;
  cuisineType: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee?: number;
  minimumOrderAmount?: number;
  estimatedDeliveryTime?: number;
}

export interface RestaurantFormData extends CreateRestaurantPayload {
  logo?: File | string | null;
  cover?: File | string | null;
}

export interface RestaurantResponse {
  data: Restaurant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export interface Category {
  id: string;
  name: string;
  restaurantId: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name?: string;
}

export interface CategoryResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemPayload {
  restaurantId?: string; // required when the owner has multiple restaurants
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isAvailable?: boolean;
  image?: File | Blob | any; // For FormData
}

export interface UpdateMenuItemPayload {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  isAvailable?: boolean;
  image?: File | Blob | any;
}

export interface MenuItemFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface MenuItemsResponse {
  data: MenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}