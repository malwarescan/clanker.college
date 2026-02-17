-- AlterTable
ALTER TABLE "grades" ADD COLUMN IF NOT EXISTS "dimension_reasons_json" JSONB;
