import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { trackingService } from '@/services/tracking/tracking.service';
import { webSocketService } from '@/services/tracking/websocket.service';
import { useAuth } from '@/contexts/AuthContext';

export const useDriverLocation = (orderId: string, isActive: boolean) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!isActive || !orderId) return;

    let watchSubscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    const pushLocation = async (loc: Location.LocationObject) => {
      const { latitude, longitude } = loc.coords;
      const payload = {
        orderId,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy: loc.coords.accuracy ?? undefined,
        speed: loc.coords.speed ?? undefined,
        heading: loc.coords.heading ?? undefined,
        altitude: loc.coords.altitude ?? undefined,
      };

      // Prefer WebSocket for real-time (server throttles to 1.5s).
      const viaWs = webSocketService.emitDriverLocation(payload);
      if (viaWs) return;
      // REST fallback when socket isn't connected.
      await trackingService.updateDriverLocation(payload).catch(() => {});
    };

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setError('Location permission denied');
          return;
        }

        // High-accuracy continuous tracking — updates on the move.
        watchSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (loc) => {
            if (cancelled) return;
            setLocation(loc);
            void pushLocation(loc);
          },
        );

        // Immediate fix — use last known if available so the marker shows right away.
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 60000,
        });
        if (!cancelled && lastKnown) {
          setLocation(lastKnown);
          void pushLocation(lastKnown);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Location error');
      }
    };

    void startTracking();

    return () => {
      cancelled = true;
      if (watchSubscription) watchSubscription.remove();
    };
  }, [orderId, isActive, user?.id]);

  return { location, error };
};