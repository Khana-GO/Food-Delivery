import { useEffect, useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { webSocketService } from '@/services/tracking/websocket.service';
import { trackingService } from '@/services/tracking/tracking.service';

interface UseDriverLocationOptions {
  orderId?: string;
  enabled?: boolean;
  intervalMs?: number;
  distanceInterval?: number; // meters before update
}

export const useDriverLocation = ({
  orderId,
  enabled = true,
  intervalMs = 3000,
  distanceInterval = 10,
}: UseDriverLocationOptions) => {
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastSentRef = useRef<number>(0);

  const requestPermission = useCallback(async () => {
    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== 'granted') {
        setPermissionGranted(false);
        setError('Foreground location permission denied');
        return false;
      }
      if (Platform.OS !== 'web') {
        const { status: bg } = await Location.requestBackgroundPermissionsAsync().catch(() => ({ status: 'denied' } as any));
        // Background is optional; we proceed even if denied but warn
        if (bg !== 'granted') {
          console.warn('[useDriverLocation] background permission not granted');
        }
      }
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch (e: any) {
      setError(e.message);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const sendLocation = useCallback(
    async (loc: Location.LocationObject) => {
      if (!orderId) return;
      const now = Date.now();
      if (now - lastSentRef.current < intervalMs) return; // throttle
      lastSentRef.current = now;

      const payload = {
        orderId,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
        speed: loc.coords.speed ?? undefined,
        heading: loc.coords.heading ?? undefined,
        altitude: loc.coords.altitude ?? undefined,
      };

      // Try WS first, fallback to REST
      const viaWs = webSocketService.emitDriverLocation(payload);
      if (!viaWs) {
        try {
          await trackingService.updateDriverLocation(payload);
        } catch (e: any) {
          console.warn('[useDriverLocation] REST fallback failed', e?.message);
        }
      }
    },
    [orderId, intervalMs],
  );

  const startTracking = useCallback(async () => {
    if (!enabled || !orderId) return;
    if (isTracking) return;

    const ok = permissionGranted ? true : await requestPermission();
    if (!ok) return;

    try {
      setIsTracking(true);
      setError(null);

      // Current position immediately
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLastLocation(current);
      await sendLocation(current);

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: intervalMs,
          distanceInterval,
        },
        async (loc) => {
          setLastLocation(loc);
          await sendLocation(loc);
        },
      );
      console.log('[useDriverLocation] tracking started for', orderId);
    } catch (e: any) {
      setError(e.message || 'Failed to start tracking');
      setIsTracking(false);
    }
  }, [enabled, orderId, isTracking, permissionGranted, requestPermission, intervalMs, distanceInterval, sendLocation]);

  const stopTracking = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
    console.log('[useDriverLocation] tracking stopped');
  }, []);

  useEffect(() => {
    if (enabled && orderId) void startTracking();
    return () => {
      void stopTracking();
    };
  }, [enabled, orderId]);

  // Pause when orderId changes
  useEffect(() => {
    return () => {
      void stopTracking();
    };
  }, [orderId, stopTracking]);

  return {
    isTracking,
    permissionGranted,
    lastLocation,
    error,
    startTracking,
    stopTracking,
    requestPermission,
  };
};
