// This creates the database connection once. this is used in the database module and database provider to create a singleton instance of the database connection and inject it into other modules using dependency injection. This is a better approach than creating a new database connection in each module that needs it.

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { DATABASE } from './database.constants';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,

      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }
        const sql = neon(connectionString);
        return drizzle(sql, { schema });
      },
    },
  ],

  exports: [DATABASE],
})
export class DbModule {}
