import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { getAccessToken } from '../../../lib/secure-storage';

type Listener = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Listener>> = new Map();
  private orderId: string | null = null;
  private userIdCache: string | null = null;
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private connectionPromise: Promise<void> | null = null;

  private getBaseURL(): string {
    const base =
      Platform.OS === 'web'
        ? process.env.EXPO_PUBLIC_API_URL_WEB
        : process.env.EXPO_PUBLIC_API_URL_MOBILE;
    // Strip trailing /api
    const raw = base || 'http://localhost:3000/api';
    return raw.replace(/\/api\/?$/, '');
  }

  private getNamespaceURL(): string {
    return `${this.getBaseURL()}/tracking`;
  }

  async connect(userId: string): Promise<void> {
    if (this.socket?.connected && this.userIdCache === userId) return;
    if (this.connectionPromise) return this.connectionPromise;

    this.shouldReconnect = true;
    this.userIdCache = userId;

    this.connectionPromise = (async () => {
      // Disconnect previous if user changed
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const token = await getAccessToken();
      if (!token) {
        console.warn('[WS] No access token - websocket auth will fail');
      }

      const url = this.getNamespaceURL();
      console.log(`[WS] Connecting to ${url} as ${userId}`);

      this.socket = io(url, {
        auth: { token, userId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity, // manual backoff
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        timeout: 15000,
        autoConnect: true,
        extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      this.bindSocketEvents();
      // Wait for connect or timeout
      await new Promise<void>((resolve, reject) => {
        if (!this.socket) return reject(new Error('Socket not initialized'));
        const t = setTimeout(() => reject(new Error('WS connect timeout')), 8000);
        this.socket!.once('connect', () => {
          clearTimeout(t);
          resolve();
        });
        this.socket!.once('connect_error', (err) => {
          clearTimeout(t);
          // still resolve - reconnection will handle
          console.warn('[WS] connect_error', err.message);
          resolve();
        });
      });
      this.reconnectAttempts = 0;
    })();

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private bindSocketEvents() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WS] connected', this.socket?.id);
      this.reconnectAttempts = 0;
      // Re-join order room after reconnect
      if (this.orderId) {
        this.socket?.emit('join-order', { orderId: this.orderId }, (ack: any) => {
          console.log('[WS] re-joined order', ack);
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[WS] connect_error', err.message);
      this.reconnectAttempts += 1;
    });

    // Multiplex events
    const events = [
      'driver:location',
      'driver-location-update',
      'order:status',
      'order-status-update',
      'order:snapshot',
      'order:eta',
      'connected',
      'exception',
    ];
    events.forEach((ev) => {
      this.socket?.on(ev, (data) => this.notifyListeners(ev, data));
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    this.orderId = null;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  joinOrder(orderId: string) {
    this.orderId = orderId;
    if (!this.socket?.connected) {
      console.warn('[WS] joinOrder queued - not connected yet');
      // will be joined on connect event
      return;
    }
    this.socket.emit('join-order', { orderId }, (res: any) => {
      console.log('[WS] join-order ack', res);
    });
  }

  leaveOrder(orderId: string) {
    if (this.orderId === orderId) this.orderId = null;
    this.socket?.emit('leave-order', { orderId });
  }

  // Driver: emit location via WS (throttled 1.5s server-side)
  emitDriverLocation(payload: {
    orderId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    altitude?: number;
  }) {
    if (!this.socket?.connected) {
      console.warn('[WS] emitDriverLocation - not connected');
      return false;
    }
    this.socket.emit('driver:location', payload, (ack: any) => {
      if (ack?.event === 'throttled') {
        console.log('[WS] throttled', ack);
      }
    });
    return true;
  }

  on(event: string, cb: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
  }

  off(event: string, cb: Listener) {
    this.listeners.get(event)?.delete(cb);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.warn(`[WS] listener error for ${event}`, e);
      }
    });
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const webSocketService = new WebSocketService();
