ALTER TABLE "users" ADD COLUMN "verification_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_last_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_last_sent_at" timestamp;