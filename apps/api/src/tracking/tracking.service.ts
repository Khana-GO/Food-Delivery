// import { driverTrackingTable } from './../db/schema/driver-tracking.schema';
// import { Injectable, Logger, NotFoundException } from '@nestjs/common';
// import { Inject } from '@nestjs/common';
// import { eq, and, desc } from 'drizzle-orm';
// import { NeonDatabase } from 'drizzle-orm/neon-serverless';
// import { DATABASE } from '../db/database.constants';
// import { ordersTable } from '../db/schema/order.schema';
// import { usersTable } from '../db/schema/user.schema';
// import { UpdateLocationDto } from './dto/update-location.dto';
// import * as schema from '../db/schema';
// import axios from 'axios';
// import {
//   DriverLocationResponseDto,
//   RouteResponseDto,
// } from './dto/driver-location-response.dto';

// @Injectable()
// export class TrackingService {
//   private readonly logger = new Logger(TrackingService.name);
//   private readonly OSRM_URL =
//     process.env.OSRM_URL || 'http://router.project-osrm.org';

//   constructor(
//     @Inject(DATABASE)
//     private readonly db: NeonDatabase<typeof schema>,
//   ) {}

//   // ─── UPDATE DRIVER LOCATION ───
//   async updateDriverLocation(
//     driverId: string,
//     dto: UpdateLocationDto,
//   ): Promise<DriverLocationResponseDto> {
//     try {
//       // Verify order exists and driver is assigned
//       const order = await this.db.query.ordersTable.findFirst({
//         where: and(
//           eq(ordersTable.id, dto.orderId),
//           eq(ordersTable.driverId, driverId),
//         ),
//       });

//       if (!order) {
//         throw new NotFoundException('Order not found or driver not assigned');
//       }

//       // Insert or update driver location
//       const [tracking] = await this.db
//         .insert(driverTrackingTable)
//         .values({
//           driverId,
//           orderId: dto.orderId,
//           latitude: dto.latitude,
//           longitude: dto.longitude,
//           accuracy: dto.accuracy,
//           speed: dto.speed,
//           heading: dto.heading,
//           isOnline: true,
//           lastUpdatedAt: new Date(),
//           createdAt: new Date(),
//         })
//         .onConflictDoUpdate({
//           target: [driverTrackingTable.driverId, driverTrackingTable.orderId],
//           set: {
//             latitude: dto.latitude,
//             longitude: dto.longitude,
//             accuracy: dto.accuracy,
//             speed: dto.speed,
//             heading: dto.heading,
//             isOnline: true,
//             lastUpdatedAt: new Date(),
//           },
//         })
//         .returning();

//       this.logger.log(
//         `Driver ${driverId} location updated for order ${dto.orderId}`,
//       );
//       return tracking;
//     } catch (error) {
//       this.logger.error(`Failed to update driver location: ${error.message}`);
//       throw error;
//     }
//   }

//   // ─── GET DRIVER LOCATION ───
//   async getDriverLocation(orderId: string): Promise<DriverLocationResponseDto> {
//     const tracking = await this.db.query.driverTrackingTable.findFirst({
//       where: eq(driverTrackingTable.orderId, orderId),
//       orderBy: [desc(driverTrackingTable.lastUpdatedAt)],
//     });

//     if (!tracking) {
//       throw new NotFoundException('Driver location not found');
//     }

//     return {
//       latitude: tracking.latitude,
//       longitude: tracking.longitude,
//       lastUpdatedAt: tracking.lastUpdatedAt,
//       isOnline: tracking.isOnline,
//       speed: tracking.speed,
//     };
//   }

//   // ─── CALCULATE ROUTE USING OSRM ───
//   async calculateRoute(
//     startLat: number,
//     startLng: number,
//     endLat: number,
//     endLng: number,
//   ): Promise<RouteResponseDto> {
//     try {
//       const url = `${this.OSRM_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`;

//       const response = await axios.get(url, {
//         params: {
//           overview: 'full',
//           geometries: 'geojson',
//           steps: true,
//         },
//         timeout: 10000,
//       });

//       const data = response.data;

//       if (data.code !== 'Ok') {
//         throw new Error(`OSRM error: ${data.code}`);
//       }

//       const route = data.routes[0];
//       const geometry = route.geometry.coordinates.map(
//         (coord: number[]) => [coord[1], coord[0]], // [lng, lat] → [lat, lng]
//       );

//       return {
//         distance: route.distance,
//         duration: route.duration,
//         geometry,
//       };
//     } catch (error) {
//       this.logger.error(`Failed to calculate route: ${error.message}`);
//       // Return straight line on error (fallback)
//       return {
//         distance: this.calculateDistance(startLat, startLng, endLat, endLng),
//         duration: 0,
//         geometry: [
//           [startLat, startLng],
//           [endLat, endLng],
//         ],
//       };
//     }
//   }

//   // ─── GET ORDER TRACKING DATA ───
//   async getOrderTrackingData(orderId: string): Promise<{
//     driver: DriverLocationResponseDto | null;
//     route: RouteResponseDto | null;
//     restaurant: { lat: number; lng: number };
//     delivery: { lat: number; lng: number };
//   }> {
//     // Get order details
//     const order = await this.db.query.ordersTable.findFirst({
//       where: eq(ordersTable.id, orderId),
//     });

//     if (!order) {
//       throw new NotFoundException('Order not found');
//     }

//     // Get restaurant location
//     const restaurant = await this.db.query.restaurantsTable.findFirst({
//       where: eq(schema.restaurantsTable.id, order.restaurantId),
//     });

//     // Get delivery address
//     const address = await this.db.query.addressesTable.findFirst({
//       where: eq(schema.addressesTable.id, order.addressId),
//     });

//     // Get driver location
//     let driverLocation: DriverLocationResponseDto | null = null;
//     let route: RouteResponseDto | null = null;

//     if (order.driverId) {
//       try {
//         driverLocation = await this.getDriverLocation(orderId);

//         // Calculate route from restaurant to driver's current location
//         if (driverLocation && restaurant) {
//           route = await this.calculateRoute(
//             restaurant.latitude,
//             restaurant.longitude,
//             driverLocation.latitude,
//             driverLocation.longitude,
//           );
//         }
//       } catch (error) {
//         this.logger.warn(`Could not get driver location: ${error.message}`);
//       }
//     }

//     return {
//       driver: driverLocation,
//       route,
//       restaurant: {
//         lat: restaurant?.latitude || 0,
//         lng: restaurant?.longitude || 0,
//       },
//       delivery: {
//         lat: address?.latitude || 0,
//         lng: address?.longitude || 0,
//       },
//     };
//   }

//   // ─── HELPER: Calculate distance (haversine) ───
//   private calculateDistance(
//     lat1: number,
//     lng1: number,
//     lat2: number,
//     lng2: number,
//   ): number {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = (lat1 * Math.PI) / 180;
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lng2 - lng1) * Math.PI) / 180;

//     const a =
//       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
//   }
// }
