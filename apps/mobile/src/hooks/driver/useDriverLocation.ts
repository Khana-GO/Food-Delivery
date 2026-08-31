import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { trackingService } from '@/services/tracking/tracking.service';
import { useAuth } from '@/contexts/AuthContext';

export const useDriverLocation = (orderId: string, isActive: boolean) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !orderId) return;

    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setError('Location permission denied');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        setLocation(loc);
        await trackingService.updateDriverLocation({
          orderId,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }).catch(() => {});
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Location error');
      }

      interval = setInterval(async () => {
        try {
          const newLoc = await Location.getCurrentPositionAsync({});
          if (cancelled) return;
          setLocation(newLoc);
          await trackingService.updateDriverLocation({
            orderId,
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
          }).catch(() => {});
        } catch {
          // ignore tick errors, keep interval alive
        }
      }, 15000);
    };

    startTracking();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [orderId, isActive]);

  return { location, error };
};