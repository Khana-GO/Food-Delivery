export enum UserRole{
    CUSTOMER = "CUSTOMER",
    RESTAURANT_OWNER = "RESTAURANT_OWNER",
    DRIVER = "DRIVER",
    ADMIN = "ADMIN"

}

export interface User {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role : UserRole,
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