import { ETAInfo } from '@food_delivery/types';
import { useState, useEffect, useCallback } from 'react';

interface UseETAOptions {
  distance: number; // in meters
  speed?: number; // in m/s
  isMoving?: boolean;
  lastUpdatedAt?: Date;
  estimatedArrival?: string;
}

export const useETA = ({
  distance,
  speed = 0,
  isMoving = false,
  lastUpdatedAt,
  estimatedArrival,
}: UseETAOptions) => {
  const [etaInfo, setEtaInfo] = useState<ETAInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  const calculateETA = useCallback(() => {
    if (!distance || distance <= 0) {
      setEtaInfo(null);
      setIsCalculating(false);
      return;
    }

    // Estimate average speed based on movement
    let avgSpeed = speed > 0 ? speed : 5; // default 5 m/s (18 km/h)
    const trafficFactor = isMoving ? 1 : 1.5; // stopped traffic

    // Time in seconds
    const timeSeconds = (distance / avgSpeed) * trafficFactor;
    const timeMinutes = Math.round(timeSeconds / 60);

    // Calculate ETA time
    const now = new Date();
    const etaDate = new Date(now.getTime() + timeSeconds * 1000);

    // Format ETA string
    const etaTimeString = etaDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Distance in readable format
    const distanceKm = distance / 1000;
    const distanceString = distanceKm < 1
      ? `${Math.round(distance)} m`
      : `${distanceKm.toFixed(1)} km`;

    // Traffic status based on speed
    let traffic: 'light' | 'moderate' | 'heavy' = 'light';
    if (avgSpeed < 3) traffic = 'heavy';
    else if (avgSpeed < 6) traffic = 'moderate';

    setEtaInfo({
      eta: etaTimeString,
      minutes: timeMinutes,
      distance: distanceString,
      traffic,
      updatedAt: now,
    });

    setIsCalculating(false);
  }, [distance, speed, isMoving]);

  useEffect(() => {
    calculateETA();
  }, [calculateETA]);

  // Update ETA every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      calculateETA();
    }, 30000);

    return () => clearInterval(interval);
  }, [calculateETA]);

  return { etaInfo, isCalculating, recalculate: calculateETA };
};