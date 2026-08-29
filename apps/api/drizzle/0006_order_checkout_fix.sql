-- Order checkout fixes: snapshots, indexes, quantity type fix, cart price fix
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_address_snapshot" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimated_delivery_minutes" integer;
--> statement-breakpoint
-- quantity was numeric -> integer (safe cast for existing data like '2' or '2.00')
ALTER TABLE "order_items" ALTER COLUMN "quantity" TYPE integer USING ("quantity"::numeric)::integer;
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "item_name_snapshot" text;
--> statement-breakpoint
-- cart price real -> numeric(10,2)
ALTER TABLE "cart_items" ALTER COLUMN "price" TYPE numeric(10,2) USING ("price"::numeric);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders" USING btree ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_restaurant_id_idx" ON "orders" USING btree ("restaurant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_driver_id_idx" ON "orders" USING btree ("driver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("order_status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_address_id_idx" ON "orders" USING btree ("address_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_menu_item_id_idx" ON "order_items" USING btree ("menu_item_id");
