export interface DriverLocation {
  latitude: number;
  longitude: number;
  lastUpdatedAt: string;
  isOnline: boolean;
  speed?: number;
}

export interface RouteData {
  distance: number;
  duration: number;
  geometry: number[][]; // [[lat, lng], [lat, lng], ...]
}

export interface OrderTrackingData {
  driver: DriverLocation | null;
  route: RouteData | null;
  restaurant: { lat: number; lng: number };
  delivery: { lat: number; lng: number };
}

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  icon?: string;
}

export interface MapRegion {
  center: [number, number];
  zoom: number;
}