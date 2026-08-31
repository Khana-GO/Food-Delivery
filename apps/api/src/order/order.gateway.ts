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
import { IsUUID } from 'class-validator';

class JoinOrderDto {
  @IsUUID('4')
  orderId!: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: false },
  namespace: '/orders',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class OrderGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(OrderGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  afterInit(server: Server) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.use(async (socket, next) => {
      try {
        await this.authenticateSocket(socket);
        next();
      } catch (_e) {
        next(new Error('Unauthorized'));
      }
    });
    this.logger.log('OrderGateway initialized - namespace /orders');
  }

  private async authenticateSocket(client: Socket) {
    const raw =
      (client.handshake.auth as any)?.token ||
      client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') ||
      (client.handshake.query as any)?.token;
    if (!raw || typeof raw !== 'string')
      throw new UnauthorizedException('Missing token');
    const payload = await this.jwtService.verifyAsync(raw, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    if (payload.type === 'refresh')
      throw new UnauthorizedException('Refresh token not allowed');
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
      if (!client.data.user) await this.authenticateSocket(client);
      const user = client.data.user;
      if (!this.userSockets.has(user.sub))
        this.userSockets.set(user.sub, new Set());
      this.userSockets.get(user.sub)?.add(client.id);
      client.join(`user:${user.sub}`);
      if (user.role === 'DRIVER') {
        client.join('drivers:available');
        this.logger.log(`Driver ${user.sub} joined drivers:available`);
      }
      this.logger.log(`Order WS client ${client.id} connected as ${user.sub}`);
      client.emit('connected', { userId: user.sub });
    } catch (err) {
      this.logger.warn(
        `Order WS auth failed ${client.id}: ${(err as Error).message}`,
      );
      client.emit('exception', { status: 'error', message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
        break;
      }
    }
    this.logger.log(`Order WS client ${client.id} disconnected`);
  }

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
    client.join(`order:${payload.orderId}`);
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
    client.leave(`order:${payload.orderId}`);
    return { event: 'left', data: { orderId: payload.orderId } };
  }

  // ─── EMIT NEW ORDER TO RESTAURANT OWNER ───
  emitNewOrder(ownerId: string, order: any) {
    this.server.to(`user:${ownerId}`).emit('new-order', order);
  }

  // ─── EMIT ORDER STATUS UPDATE ───
  emitOrderStatusUpdate(orderId: string, status: string, order: any) {
    this.server
      .to(`order:${orderId}`)
      .emit('order-status-update', { orderId, status, order });
    // Also notify the customer and driver specifically
    if (order.customerId) {
      this.server
        .to(`user:${order.customerId}`)
        .emit('order-updated', { orderId, status, order });
    }
    if (order.driverId) {
      this.server
        .to(`user:${order.driverId}`)
        .emit('order-updated', { orderId, status, order });
    }
  }

  // ─── EMIT DRIVER ASSIGNMENT ───
  emitDriverAssignment(driverId: string, orderId: string) {
    this.server.to(`user:${driverId}`).emit('driver-assigned', { orderId });
  }

  // ─── EMIT DRIVER LOCATION UPDATE ───
  emitDriverLocation(orderId: string, location: any) {
    this.server.to(`order:${orderId}`).emit('driver-location-update', location);
  }

  // ─── EMIT NEW AVAILABLE ORDER TO ALL DRIVERS ───
  emitNewAvailableOrder(order: any) {
    this.server.to('drivers:available').emit('new-available-order', order);
    this.server.to('drivers:available').emit('order-available', order);
    this.logger.log(`Broadcast new available order ${order.id} to drivers:available`);
  }
}
