-- ─────────────────────────────────────────────────────────────────────────────
-- Search & discovery indexes (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
-- Before this migration the search hot path had no supporting indexes at all:
--   * restaurants: only the primary key and the unique slug index existed, yet
--     every discovery query filters on is_active / is_verified / deleted_at and
--     sorts by average_rating / created_at / delivery_fee.
--   * menu_items: no index on restaurant_id or category_id (Postgres does not
--     index foreign keys automatically), so every menu load and every dish
--     search join scanned the table.
--
-- The btree + GIN definitions also live in the Drizzle schema
-- (src/db/schema/restaurant.schema.ts, src/db/schema/menu.items.schema.ts), so
-- `drizzle-kit push` creates them too. This file is the canonical, replayable
-- version and additionally performs the one step `drizzle-kit` cannot express:
-- enabling the `pg_trgm` extension that the GIN indexes depend on.
--
-- `pg_trgm` gives PostgreSQL the trigram index support that makes `ILIKE
-- '%term%'` (substring + typo-tolerant search) index-assisted instead of a
-- sequential scan.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── restaurants: discovery filters & sorts ───
CREATE INDEX IF NOT EXISTS "restaurants_is_active_idx" ON "restaurants" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "restaurants_is_verified_idx" ON "restaurants" USING btree ("is_verified");
CREATE INDEX IF NOT EXISTS "restaurants_deleted_at_idx" ON "restaurants" USING btree ("deleted_at");
CREATE INDEX IF NOT EXISTS "restaurants_cuisine_type_idx" ON "restaurants" USING btree ("cuisine_type");
CREATE INDEX IF NOT EXISTS "restaurants_average_rating_idx" ON "restaurants" USING btree ("average_rating");
CREATE INDEX IF NOT EXISTS "restaurants_created_at_idx" ON "restaurants" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "restaurants_minimum_order_amount_idx" ON "restaurants" USING btree ("minimum_order_amount");
CREATE INDEX IF NOT EXISTS "restaurants_estimated_delivery_time_idx" ON "restaurants" USING btree ("estimated_delivery_time");

-- ─── restaurants: text search (trigram) ───
CREATE INDEX IF NOT EXISTS "restaurants_name_trgm_idx" ON "restaurants" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "restaurants_cuisine_type_trgm_idx" ON "restaurants" USING gin ("cuisine_type" gin_trgm_ops);

-- ─── menu_items: joins, availability & text search ───
CREATE INDEX IF NOT EXISTS "menu_items_restaurant_id_idx" ON "menu_items" USING btree ("restaurant_id");
CREATE INDEX IF NOT EXISTS "menu_items_category_id_idx" ON "menu_items" USING btree ("category_id");
CREATE INDEX IF NOT EXISTS "menu_items_is_available_idx" ON "menu_items" USING btree ("is_available");
CREATE INDEX IF NOT EXISTS "menu_items_name_idx" ON "menu_items" USING btree ("name");
CREATE INDEX IF NOT EXISTS "menu_items_restaurant_available_idx" ON "menu_items" USING btree ("restaurant_id", "is_available");
CREATE INDEX IF NOT EXISTS "menu_items_name_trgm_idx" ON "menu_items" USING gin ("name" gin_trgm_ops);

-- ─── menu_categories: category-name search (trigram) ───
-- (restaurant_id / name already indexed by menu_categories_* from an earlier migration)
CREATE INDEX IF NOT EXISTS "menu_categories_name_trgm_idx" ON "menu_categories" USING gin ("name" gin_trgm_ops);

-- ─── orders: trending / popularity aggregation (last 30 days) ───
CREATE INDEX IF NOT EXISTS "orders_restaurant_created_at_idx" ON "orders" USING btree ("restaurant_id", "created_at");
