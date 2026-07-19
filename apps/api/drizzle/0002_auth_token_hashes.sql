ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token_expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token" varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token_expiry" timestamp;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_verification_token_idx" ON "users" USING btree ("verification_token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_reset_token_idx" ON "users" USING btree ("reset_token");
