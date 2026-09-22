-- Payment integrity + address soft delete
--> statement-breakpoint
-- Promo discount is persisted on the order so invoices/receipts reconcile.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount" numeric(10, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
-- Replay protection: one gateway transaction may only ever produce one order.
-- NOTE: if duplicate non-null payment_id values already exist, resolve them
-- (keep the earliest order, null out the later ones) before applying this.
CREATE UNIQUE INDEX IF NOT EXISTS "orders_payment_id_unique"
  ON "orders" USING btree ("payment_id")
  WHERE "payment_id" IS NOT NULL;
--> statement-breakpoint
-- Soft delete for addresses referenced by past orders (ON DELETE RESTRICT).
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "addresses_user_active_idx" ON "addresses" USING btree ("user_id","is_active");
