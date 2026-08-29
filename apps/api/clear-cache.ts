import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CacheService } from './src/redis/cache.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cache = app.get(CacheService);
  await cache.del('restaurant:stats:overview');
  await cache.delByPattern('restaurant:stats:*');
  await cache.delByPattern('restaurant:list:*');
  await cache.delByPattern('users:stats:*');
  await cache.delByPattern('users:list:*');
  console.log('Cache cleared for stats and lists');
  await app.close();
}
main().catch(e => { console.error(e); process.exit(1); });
