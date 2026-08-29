import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('Redis');
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = Number(configService.get<string>('REDIS_PORT', '6379'));
        const password =
          configService.get<string>('REDIS_PASSWORD') || undefined;
        const db = Number(configService.get<string>('REDIS_DB', '0'));
        const enabled =
          configService.get<string>('REDIS_ENABLED', 'true') !== 'false';

        if (!enabled) {
          logger.warn(
            'Redis disabled via REDIS_ENABLED=false — using no-op client',
          );
        }

        const client = new Redis({
          host,
          port,
          password,
          db: Number.isNaN(db) ? 0 : db,
          // Don't block app boot if Redis is down
          lazyConnect: false,
          enableReadyCheck: true,
          maxRetriesPerRequest: 2,
          enableAutoPipelining: true,
          retryStrategy: (times) => {
            if (times > 10) {
              logger.error('Redis retry exhausted after 10 attempts');
              return null; // stop retrying
            }
            return Math.min(times * 100, 2000);
          },
          reconnectOnError: (err) => {
            const target = err.message.includes('READONLY');
            if (target) logger.warn(`Redis reconnect on error: ${err.message}`);
            return target;
          },
        });

        client.on('connect', () =>
          logger.log(`Redis connecting → ${host}:${port} db=${db}`),
        );
        client.on('ready', () => logger.log('Redis ready'));
        client.on('error', (err) =>
          logger.error(`Redis error: ${err.message}`),
        );
        client.on('close', () => logger.warn('Redis connection closed'));
        client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

        return client;
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: ['REDIS_CLIENT', CacheService],
})
export class RedisModule implements OnModuleDestroy {
  private readonly logger = new Logger(RedisModule.name);
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleDestroy() {
    try {
      this.logger.log('Closing Redis connection...');
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    } catch (err) {
      this.logger.warn(`Error closing Redis: ${(err as Error).message}`);
      try {
        this.redis.disconnect();
      } catch {
        /* empty */
      }
    }
  }
}
