-- ERR-041: one row per refresh token hash.
--
-- Duplicate hashes could exist from concurrent refreshes; keep the newest row
-- per hash before creating the unique index so this migration always applies.
DELETE FROM "sessions" s
WHERE EXISTS (
  SELECT 1
  FROM "sessions" newer
  WHERE newer."refresh_token_hash" = s."refresh_token_hash"
    AND (newer."created_at", newer."id") > (s."created_at", s."id")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "sessions_refresh_token_hash_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_refresh_token_hash_unique" ON "sessions" USING btree ("refresh_token_hash");
