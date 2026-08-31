import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Injectable,
  Logger,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../sessions/sessions.service';
import { TrackingService } from './tracking.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { IsUUID } from 'class-validator';

// Simple DTO for room join
class JoinOrderDto {
  @IsUUID('4')
  orderId!: string;
}

@WebSocketGateway({
  namespace: '/tracking',
  cors: { origin: '*', credentials: false },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
})
@Injectable()
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  // driverId -> last update timestamp for throttling
  private readonly lastLocationAt = new Map<string, number>();
  private readonly THROTTLE_MS = 1500; // 1.5s between location updates per driver

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly trackingService: TrackingService,
  ) {}

  afterInit(server: Server) {
    // Optional Redis adapter for horizontal scaling is configured elsewhere via REDIS_CLIENT
    // If you want cluster support, uncomment and adapt:
    // const pub = new Redis(...); const sub = pub.duplicate();
    // server.adapter(createAdapter(pub, sub));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.use(async (socket, next) => {
      try {
        await this.authenticateSocket(socket);
        next();
      } catch (_e) {
        next(new Error('Unauthorized'));
      }
    });
    this.logger.log('TrackingGateway initialized - namespace /tracking');
  }

  private async authenticateSocket(client: Socket) {
    const raw =
      (client.handshake.auth as any)?.token ||
      client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') ||
      (client.handshake.query as any)?.token;

    if (!raw || typeof raw !== 'string') {
      throw new UnauthorizedException('Missing token');
    }
    const payload = await this.jwtService.verifyAsync(raw, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Refresh token not allowed');
    }
    if (
      this.sessionsService.isTokenRevoked(raw, {
        userId: payload.sub,
        issuedAtSeconds: payload.iat,
      })
    ) {
      throw new UnauthorizedException('Session revoked');
    }
    client.data.user = payload;
    client.data.token = raw;
  }

  async handleConnection(client: Socket) {
    try {
      // already authenticated via server.use; double-check
      if (!client.data.user) {
        await this.authenticateSocket(client);
      }
      const user = client.data.user;
      client.join(`user:${user.sub}`);
      this.logger.log(
        `Client ${client.id} connected as ${user.sub} (${user.role})`,
      );
      client.emit('connected', { userId: user.sub, socketId: client.id });
    } catch (err) {
      this.logger.warn(
        `WS auth failed for ${client.id}: ${(err as Error).message}`,
      );
      client.emit('exception', { status: 'error', message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data?.user;
    this.logger.log(
      `Client ${client.id} disconnected ${user ? `(${user.sub})` : ''}`,
    );
  }

  // ─── JOIN ORDER ROOM ───
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SubscribeMessage('join-order')
  async handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinOrderDto,
  ) {
    const user = client.data.user;
    if (!user) throw new UnauthorizedException('Not authenticated');

    await this.trackingService.assertCanAccessOrder(
      payload.orderId,
      user.sub,
      user.role,
    );

    await client.join(`order:${payload.orderId}`);
    // Also join driver / customer specific subrooms for targeted pushes
    this.logger.log(`${user.sub} joined order:${payload.orderId}`);

    // Send immediate snapshot (driver location + order status) so client has instant data
    try {
      const snapshot = await this.trackingService.getOrderTrackingSnapshot(
        payload.orderId,
      );
      client.emit('order:snapshot', snapshot);
    } catch {
      // ignore - snapshot is best-effort
    }

    return { event: 'joined', data: { orderId: payload.orderId } };
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SubscribeMessage('leave-order')
  async handleLeaveOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinOrderDto,
  ) {
    await client.leave(`order:${payload.orderId}`);
    return { event: 'left', data: { orderId: payload.orderId } };
  }

  // ─── DRIVER LOCATION UPDATE via WS (preferred for real-time) ───
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SubscribeMessage('driver:location')
  async handleDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: UpdateLocationDto,
  ) {
    const user = client.data.user;
    if (!user) throw new UnauthorizedException('Not authenticated');
    if (user.role !== 'DRIVER' && user.role !== 'ADMIN') {
      client.emit('exception', {
        status: 'error',
        message: 'Only drivers can send locations',
      });
      return;
    }

    // Throttle per driver
    const key = `${user.sub}:${dto.orderId}`;
    const now = Date.now();
    const last = this.lastLocationAt.get(key) || 0;
    if (now - last < this.THROTTLE_MS) {
      // silently drop or echo throttled
      return {
        event: 'throttled',
        data: { retryAfterMs: this.THROTTLE_MS - (now - last) },
      };
    }
    this.lastLocationAt.set(key, now);

    try {
      const tracking = await this.trackingService.updateDriverLocation(
        user.sub,
        dto,
      );

      const broadcastPayload = {
        orderId: dto.orderId,
        driverId: user.sub,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        speed: dto.speed,
        heading: dto.heading,
        altitude: (dto as any).altitude,
        timestamp:
          tracking.lastUpdatedAt?.toISOString() || new Date().toISOString(),
        isOnline: true,
      };

      // Persisted + broadcast to room
      await this.broadcastDriverLocation(dto.orderId, broadcastPayload);

      return { event: 'driver:location:ack', data: broadcastPayload };
    } catch (err: any) {
      this.logger.warn(`driver:location failed: ${err.message}`);
      client.emit('exception', { status: 'error', message: err.message });
    }
  }

  // ─── DRIVER HEARTBEAT / presence ───
  @SubscribeMessage('driver:heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (!user) return;
    client.emit('driver:heartbeat:ack', {
      at: new Date().toISOString(),
      userId: user.sub,
    });
  }

  // ─── BROADCAST HELPERS (called by service/controller) ───
  async broadcastDriverLocation(orderId: string, payload: any) {
    this.server.to(`order:${orderId}`).emit('driver:location', payload);
    // also legacy event for backwards compat
    this.server.to(`order:${orderId}`).emit('driver-location-update', payload);
    this.logger.debug(`Broadcast driver:location to order:${orderId}`);
  }

  async broadcastOrderStatus(
    orderId: string,
    payload: {
      orderId: string;
      orderStatus: string;
      updatedAt: string;
      changedBy?: string;
      estimatedDeliveryTime?: string | null;
    },
  ) {
    this.server.to(`order:${orderId}`).emit('order:status', payload);
    // per-user room fallback (customer / restaurant owner)
    this.server.to(`order:${orderId}`).emit('order-status-update', payload);
  }

  async broadcastEtaUpdate(
    orderId: string,
    payload: { eta: string; duration: number; distance: number },
  ) {
    this.server.to(`order:${orderId}`).emit('order:eta', payload);
  }

  async broadcastToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  // Utility to get connected client count for monitoring
  getRoomSize(room: string): number {
    return this.server.sockets.adapter.rooms.get(room)?.size ?? 0;
  }
}
