export interface DriverLocation {
  latitude: number;
  longitude: number;
  lastUpdatedAt: string;
  isOnline: boolean;
  speed?: number;
  heading?: number;
  accuracy?: number;
  altitude?: number;
}

export interface RouteData {
  distance: number; // meters
  duration: number; // seconds
  geometry: number[][]; // [[lat, lng], ...]
}

export interface OrderTrackingData {
  orderId: string;
  driver: DriverLocation | null;
  route: RouteData | null;
  restaurant: { lat: number; lng: number; name?: string; address?: string };
  delivery: { lat: number; lng: number; address?: string };
  orderStatus: string;
  estimatedDeliveryTime: string | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  history?: Array<{ lat: number; lng: number; recordedAt: string }>;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  icon?: string;
}

// Re-export for backwards compat where OrderTrackingMap expects `data` to have deliveryAddress etc.
export type LegacyOrderTrackingData = OrderTrackingData & {
  deliveryAddress?: string;
  totalAmount?: number;
  estimatedDeliveryTimeLegacy?: string;
};

export interface MapRegion {
  center: [number, number];
  zoom: number;
}

export interface OrderStatusUpdate {
  orderId: string;
  orderStatus: string;
  updatedAt: string;
  changedBy?: string;
  estimatedDeliveryTime?: string | null;
}

export interface DriverLocationUpdate {
  orderId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp: string;
  isOnline: boolean;
}

export interface EtaUpdate {
  distance: number;
  duration: number;
  eta: string;
}
