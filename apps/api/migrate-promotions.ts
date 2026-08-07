import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  console.log('Connected to DB');

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "promotions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(255) NOT NULL,
        "subtitle" varchar(255),
        "image_url" text NOT NULL,
        "cta_text" varchar(50) NOT NULL,
        "destination_url" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "start_date" timestamp,
        "end_date" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('Created promotions table');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

main();
