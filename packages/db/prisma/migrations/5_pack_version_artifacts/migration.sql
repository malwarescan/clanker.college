-- AlterTable
ALTER TABLE "pack_versions" ADD COLUMN IF NOT EXISTS "artifact_zip_url" TEXT;
ALTER TABLE "pack_versions" ADD COLUMN IF NOT EXISTS "artifact_plugin_url" TEXT;
ALTER TABLE "pack_versions" ADD COLUMN IF NOT EXISTS "artifact_git_url" TEXT;
