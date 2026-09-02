// This creates the database connection once. this is used in the database module and database provider to create a singleton instance of the database connection and inject it into other modules using dependency injection. This is a better approach than creating a new database connection in each module that needs it.

import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import { DATABASE } from './database.constants';
import ws from 'ws';

// Required for Node.js — Neon serverless uses WebSocket; without this the pool crashes with unhandled ErrorEvent on idle/timeout
neonConfig.webSocketConstructor = ws as any;
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
        const pool = new Pool({ connectionString });
        // Prevent unhandled 'error' events from crashing Node (Neon idle WebSocket error)
        pool.on('error', (err: any) => {
          logger.warn(`[Neon pool] idle error suppressed: ${err?.message || err}`);
        });
        // Also catch WebSocket errors at process level as last resort
        if (!(global as any).__neonWsErrorBound) {
          (global as any).__neonWsErrorBound = true;
          process.on('uncaughtException', (err: any) => {
            if (err?.context?.client || err?.message?.includes('WebSocket')) {
              logger.warn(`[Neon] suppressed uncaught WebSocket error: ${err?.message}`);
              return;
            }
            // rethrow non-neon errors
            throw err;
          });
        }
        return drizzle({ client: pool, schema });
      },
    },
  ],

  exports: [DATABASE],
})
export class DbModule {}
