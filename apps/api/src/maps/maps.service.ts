import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);

  /**
   * Helper to geocode a string address into lat/lng using Nominatim (OpenStreetMap)
   */
  private async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'KhanaGo-App/1.0' } });
      const data = (await response.json()) as any[];
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      this.logger.error('Error geocoding address with Nominatim:', error);
      return null;
    }
  }

  /**
   * Calculate distance and estimated time between origin and destination using OSRM
   * @param origin - { latitude, longitude } or string address
   * @param destination - { latitude, longitude } or string address
   * @returns { distanceText, distanceMeters, durationText, durationSeconds }
   */
  async getDistanceAndDuration(
    origin: string | { latitude: number; longitude: number },
    destination: string | { latitude: number; longitude: number }
  ) {
    try {
      // 1. Ensure we have coordinates for both origin and destination
      let originCoords = typeof origin === 'string' ? await this.geocodeAddress(origin) : origin;
      let destCoords = typeof destination === 'string' ? await this.geocodeAddress(destination) : destination;

      if (!originCoords || !destCoords) {
        this.logger.warn('Could not resolve coordinates for distance calculation.');
        return null;
      }

      // OSRM expects: longitude,latitude
      const coordsString = `${originCoords.longitude},${originCoords.latitude};${destCoords.longitude},${destCoords.latitude}`;
      const url = `http://router.project-osrm.org/route/v1/driving/${coordsString}?overview=false`;

      const response = await fetch(url);
      const data = (await response.json()) as any;

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceMeters = route.distance;
        const durationSeconds = route.duration;
        
        return {
          distanceText: `${(distanceMeters / 1000).toFixed(1)} km`,
          distanceMeters: distanceMeters,
          durationText: `${Math.round(durationSeconds / 60)} mins`,
          durationSeconds: durationSeconds,
        };
      }

      this.logger.error(`OSRM API returned error code: ${data.code}`);
      return null;
    } catch (error) {
      this.logger.error('Error fetching distance from OSRM API', error);
      return null;
    }
  }
}
