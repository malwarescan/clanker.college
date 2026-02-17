-- AlterTable
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "hard_fails_json" JSONB;
