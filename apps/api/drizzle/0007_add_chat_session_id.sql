ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "session_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_session_id_idx" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
