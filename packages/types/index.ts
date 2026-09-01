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
    phone?: string | null,
    imageUrl?: string | null,
    imagePublicId?: string | null,
    isVerified?: boolean,
    isOnline?: boolean,
    createdAt: Date | string,
    deletedAt?: Date | string,
    updatedAt?: Date | string,
    lastLoginAt?: Date | string,
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
  deletedAt?: string;
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
  restaurantId?: string; // required when owner has multiple restaurants
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

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'restaurant' | 'profile' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  isPushSent: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// Additional frontend-specific types
export interface UserListFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isVerified?: boolean;
  isOnline?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  onlineUsers: number;
  adminUsers: number;
  deletedUsers: number;
}


export interface RestaurantFilters {
  page?: number;
  limit?: number;
  search?: string;
  cuisineType?: string;
  isOpen?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RestaurantStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  open: number;
  closed: number;
  deleted: number;
  pendingVerification?: number;
}

export interface RestaurantListResponse {
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
}

export interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    imageUrl?: string;
  };
  popularRestaurants: Restaurant[];
  recommendations: Restaurant[];
  recentlyOrdered: Restaurant[];
  categories: Category[];
  featuredMenuItems?: (MenuItem & { restaurantName?: string })[];
}

export interface Favorite {
  id: string;
  restaurantId: string;
  userId: string;
  createdAt: string;
  restaurant?: Restaurant;
}


export interface Address {
  id: string;
  userId: string;
  label?: string; // e.g., "Home", "Office"
  addressLine: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  label?: string;
  addressLine: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {}



export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  driverId?: string;
  driverName?: string;
  addressId: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
  paymentMethod: 'ONLINE' | 'OFFLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  restaurantId: string;
  addressId: string;
  items: {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
  paymentMethod: 'ONLINE' | 'OFFLINE';
  paymentId?: string;
}


export interface AdminOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  pickedUpOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
  thisWeekOrders: number;
  thisWeekRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
  dailyTrend: { date: string; orders: number; revenue: number }[];
  revenueTrend: { date: string; orders: number; revenue: number }[];
}

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  restaurantId?: string;
  driverId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}


export interface PlatformMetrics {
  totalUsers: number;
  totalRestaurants: number;
  totalDrivers: number;
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
  ordersThisWeek: number;
  revenueThisWeek: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  orderTrend: { date: string; orders: number; revenue: number }[];
  growth: {
    orders: number;
    revenue: number;
    users: number;
    restaurants: number;
  };
}

export interface RestaurantAnalytics {
  restaurantId: string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  growth: number;
  dailyTrend: { date: string; orders: number }[];
}

export interface DriverAnalytics {
  driverId: string;
  name: string;
  totalDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  acceptanceRate: number;
  onTimeRate: number;
  growth: number;
}



export interface DriverLocation {
  latitude: number;
  longitude: number;
  lastUpdatedAt: string;
  isOnline: boolean;
  speed?: number;
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: number[][]; // [[lat, lng], [lat, lng], ...]
}

export interface OrderTrackingData {
  orderId: string;
  driver: DriverLocation | null;
  route: RouteData | null;
  restaurant: { lat: number; lng: number };
  delivery: { lat: number; lng: number; address?: string };
  orderStatus: string;
  estimatedDeliveryTime?: string;
  estimatedDuration?: number;
  estimatedDistance?: number;
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
  history?: Array<{ lat: number; lng: number; recordedAt: string }>;
}

export interface ETAInfo {
  eta: string; // estimated time of arrival as string
  minutes: number;
  distance: string;
  traffic: 'light' | 'moderate' | 'heavy';
  updatedAt: Date;
}