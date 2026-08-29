import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema';
import { sql, count, eq, and } from 'drizzle-orm';
import { restaurantsTable } from './src/db/schema/restaurant.schema';

const DATABASE_URL = process.env.DATABASE_URL!;
const client = neon(DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
  const [totalResult] = await db.select({ total: count() }).from(restaurantsTable).where(sql`${restaurantsTable.deletedAt} IS NULL`);
  console.log('total where deletedAt IS NULL:', totalResult);
  const [totalAll] = await db.select({ total: count() }).from(restaurantsTable);
  console.log('total all (no filter):', totalAll);
  const rows = await db.select().from(restaurantsTable).limit(5);
  console.log('rows sample:', rows.map(r => ({id: r.id, name: r.name, deletedAt: r.deletedAt, isActive: r.isActive, isVerified: r.isVerified, isOpen: r.isOpen})));
  const [activeResult] = await db.select({ active: count() }).from(restaurantsTable).where(and(eq(restaurantsTable.isActive, true), sql`${restaurantsTable.deletedAt} IS NULL`));
  console.log('active:', activeResult);
  const [verifiedResult] = await db.select({ verified: count() }).from(restaurantsTable).where(and(eq(restaurantsTable.isVerified, true), sql`${restaurantsTable.deletedAt} IS NULL`));
  console.log('verified:', verifiedResult);
  const [openResult] = await db.select({ open: count() }).from(restaurantsTable).where(and(eq(restaurantsTable.isOpen, true), sql`${restaurantsTable.deletedAt} IS NULL`));
  console.log('open:', openResult);
  const [deletedResult] = await db.select({ deleted: count() }).from(restaurantsTable).where(sql`${restaurantsTable.deletedAt} IS NOT NULL`);
  console.log('deleted:', deletedResult);
}

main().catch(e => { console.error(e); process.exit(1); });
