import { useState, useEffect, useRef, useCallback } from 'react';
import { trackingService } from '@/services/tracking/tracking.service';
import { webSocketService } from '@/services/tracking/websocket.service';
import {
  OrderTrackingData,
  DriverLocation,
  OrderStatusUpdate,
  EtaUpdate,
  DriverLocationUpdate,
} from '@/types/tracking.types';

interface UseOrderTrackingOptions {
  orderId?: string;
  autoFetch?: boolean;
  pollingInterval?: number;
  enableWebSocket?: boolean;
}

export const useOrderTracking = ({
  orderId,
  autoFetch = true,
  pollingInterval = 15000,
  enableWebSocket = true,
}: UseOrderTrackingOptions) => {
  const [data, setData] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!orderId && autoFetch);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [eta, setEta] = useState<EtaUpdate | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const safeOrderId = orderId?.trim();

  const fetchTrackingData = useCallback(async () => {
    if (!safeOrderId) {
      setError('Missing order ID');
      setIsLoading(false);
      return null;
    }
    try {
      if (!data) setIsLoading(true);
      else setIsPolling(true);
      const result = await trackingService.getOrderTrackingData(safeOrderId);
      if (!mountedRef.current) return null;
      setData(result);
      setDriverLocation(result.driver);
      if (result.estimatedDistance && result.estimatedDuration) {
        setEta({
          distance: result.estimatedDistance,
          duration: result.estimatedDuration,
          eta: result.estimatedDeliveryTime || new Date(Date.now() + result.estimatedDuration * 1000).toISOString(),
        });
      }
      setError(null);
      return result;
    } catch (err: any) {
      if (mountedRef.current) {
        const msg =
          err?.response?.data?.message || err?.message || 'Failed to fetch tracking data';
        setError(Array.isArray(msg) ? msg.join('\n') : msg);
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsPolling(false);
      }
    }
  }, [safeOrderId, data]);

  const handleDriverUpdate = useCallback(
    (payload: DriverLocationUpdate) => {
      if (!mountedRef.current) return;
      // Only apply if matches current order (gateway already rooms but extra safety)
      if (safeOrderId && payload.orderId !== safeOrderId) return;
      const loc: DriverLocation = {
        latitude: payload.latitude,
        longitude: payload.longitude,
        lastUpdatedAt: payload.timestamp,
        isOnline: payload.isOnline ?? true,
        speed: payload.speed,
        heading: payload.heading,
        accuracy: payload.accuracy,
        altitude: payload.altitude,
      };
      setDriverLocation(loc);
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, driver: loc };
      });
    },
    [safeOrderId],
  );

  const handleStatusUpdate = useCallback(
    (payload: OrderStatusUpdate) => {
      if (!mountedRef.current) return;
      if (safeOrderId && payload.orderId !== safeOrderId) return;
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orderStatus: payload.orderStatus,
          estimatedDeliveryTime: payload.estimatedDeliveryTime ?? prev.estimatedDeliveryTime,
        };
      });
      // Also refetch snapshot for route recalculation if status moved to PICKED_UP etc
      if (['PICKED_UP', 'READY', 'PREPARING', 'CONFIRMED'].includes(payload.orderStatus)) {
        fetchTrackingData();
      }
    },
    [safeOrderId, fetchTrackingData],
  );

  const handleEtaUpdate = useCallback(
    (payload: EtaUpdate) => {
      if (!mountedRef.current) return;
      setEta(payload);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          estimatedDistance: payload.distance,
          estimatedDuration: payload.duration,
          estimatedDeliveryTime: payload.eta,
        };
      });
    },
    [],
  );

  const handleSnapshot = useCallback(
    (snapshot: OrderTrackingData) => {
      if (!mountedRef.current) return;
      setData(snapshot);
      setDriverLocation(snapshot.driver);
      setError(null);
      setIsLoading(false);
    },
    [],
  );

  const connectWebSocket = useCallback(
    async (userId: string) => {
      if (!enableWebSocket || !safeOrderId) return;
      try {
        await webSocketService.connect(userId);
        webSocketService.joinOrder(safeOrderId);
        // Subscribe to live events
        webSocketService.on('driver:location', handleDriverUpdate);
        webSocketService.on('driver-location-update', handleDriverUpdate);
        webSocketService.on('order:status', handleStatusUpdate);
        webSocketService.on('order-status-update', handleStatusUpdate);
        webSocketService.on('order:eta', handleEtaUpdate);
        webSocketService.on('order:snapshot', handleSnapshot);
      } catch (e) {
        console.warn('[useOrderTracking] WS connect failed', e);
      }
    },
    [safeOrderId, enableWebSocket, handleDriverUpdate, handleStatusUpdate, handleEtaUpdate, handleSnapshot],
  );

  const disconnectWebSocket = useCallback(() => {
    if (!safeOrderId) return;
    webSocketService.off('driver:location', handleDriverUpdate);
    webSocketService.off('driver-location-update', handleDriverUpdate);
    webSocketService.off('order:status', handleStatusUpdate);
    webSocketService.off('order-status-update', handleStatusUpdate);
    webSocketService.off('order:eta', handleEtaUpdate);
    webSocketService.off('order:snapshot', handleSnapshot);
    webSocketService.leaveOrder(safeOrderId);
    // Don't fully disconnect - keep socket for other orders, but we can keep it
  }, [safeOrderId, handleDriverUpdate, handleStatusUpdate, handleEtaUpdate, handleSnapshot]);

  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch && safeOrderId) {
      fetchTrackingData();
      // Poll only when WS not connected
      intervalRef.current = setInterval(() => {
        if (!webSocketService.isConnected()) {
          fetchTrackingData();
        }
      }, pollingInterval);
    } else if (!safeOrderId) {
      setIsLoading(false);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      disconnectWebSocket();
    };
  }, [autoFetch, safeOrderId, pollingInterval, fetchTrackingData, disconnectWebSocket]);

  return {
    data,
    driverLocation,
    eta,
    isLoading,
    isPolling,
    error,
    fetchTrackingData,
    connectWebSocket,
    disconnectWebSocket,
    refresh: fetchTrackingData,
  };
};
