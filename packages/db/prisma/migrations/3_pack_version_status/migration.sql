-- AlterTable: add status and timestamps for latest certified vs latest published
ALTER TABLE "pack_versions" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "pack_versions" ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3);
ALTER TABLE "pack_versions" ADD COLUMN IF NOT EXISTS "certified_at" TIMESTAMP(3);

-- Backfill: existing versions become CERTIFIED with certified_at = last_updated_at
UPDATE "pack_versions" SET "status" = 'CERTIFIED', "published_at" = "last_updated_at", "certified_at" = "last_updated_at" WHERE "status" = 'DRAFT';
