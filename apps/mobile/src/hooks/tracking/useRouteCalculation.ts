import { useState, useCallback } from 'react';
import { trackingService } from '@/services/tracking/tracking.service';
import { RouteData } from '@/types/tracking.types';

export const useRouteCalculation = () => {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await trackingService.calculateRoute(
        startLat,
        startLng,
        endLat,
        endLng,
      );
      setRoute(result);
      return result;
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate route');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { route, isLoading, error, calculateRoute };
};