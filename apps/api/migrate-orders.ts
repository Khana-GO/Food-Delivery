import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  console.log('Connected to DB for orders migration');

  try {
    await client.query(`
      ALTER TABLE "orders" DROP COLUMN IF EXISTS "item_id";
      
      ALTER TABLE "orders" ALTER COLUMN "driver_id" DROP NOT NULL;
      
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_latitude" double precision;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_longitude" double precision;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distance" numeric(10, 2);
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimated_delivery_time" integer;
    `);
    console.log('Orders table migrated successfully');
  } catch (err) {
    console.error('Error migrating orders table:', err);
  } finally {
    await client.end();
  }
}

main();
