import { useEffect, useRef, useCallback, useState } from 'react';
import { webSocketService } from '@/services/tracking/websocket.service';

export const useWebSocket = (userId?: string) => {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(
    async (uid: string) => {
      await webSocketService.connect(uid);
      setIsConnected(webSocketService.isConnected());
    },
    [],
  );

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (userId) connect(userId);
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const s = webSocketService.getSocket();
    s?.on('connect', onConnect);
    s?.on('disconnect', onDisconnect);

    return () => {
      s?.off('connect', onConnect);
      s?.off('disconnect', onDisconnect);
    };
  }, [userId, connect]);

  return { isConnected, connect, disconnect, service: webSocketService };
};
