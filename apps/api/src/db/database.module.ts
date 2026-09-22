// This creates the database connection once. this is used in the database module and database provider to create a singleton instance of the database connection and inject it into other modules using dependency injection. This is a better approach than creating a new database connection in each module that needs it.

import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import { DATABASE } from './database.constants';
import ws from 'ws';

// Required for Node.js — Neon serverless uses WebSocket; without this the pool crashes with unhandled ErrorEvent on idle/timeout
neonConfig.webSocketConstructor = ws;
// Reduce aggressive pipelining that can cause idleListener errors on serverless
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = true;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,

      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('DbModule');
        const connectionString = config.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }
        // The WebSocket driver supports interactive transactions. The HTTP driver
        // cannot keep multiple queries on the same transaction connection.
        const pool = new Pool({
          connectionString,
          // Bound the pool and fail fast instead of queueing forever: without
          // these, a slow/hung query could exhaust the connection pool and make
          // every request time out with no signal.
          max: Number(config.get<string>('DATABASE_POOL_MAX') ?? 10),
          connectionTimeoutMillis: Number(
            config.get<string>('DATABASE_CONNECT_TIMEOUT_MS') ?? 10_000,
          ),
          idleTimeoutMillis: 30_000,
        });
        // Prevent unhandled 'error' events from crashing Node (Neon idle WebSocket error)
        pool.on('error', (err: any) => {
          logger.warn(
            `[Neon pool] idle error suppressed: ${err?.message || err}`,
          );
        });
        return drizzle({ client: pool, schema });
      },
    },
  ],

  exports: [DATABASE],
})
export class DbModule {}
