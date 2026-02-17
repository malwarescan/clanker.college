#!/usr/bin/env tsx
/**
 * Build pack, upload dist zips to S3/R2, update PackVersion.artifactZipUrl and artifactPluginUrl.
 * Requires: S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY; optional S3_ENDPOINT (R2).
 * DATABASE_URL for Prisma. Run from repo root: pnpm pack:publish [path-to-pack]
 */

import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { spawnSync } from "child_process";

const PACK_DIR = resolve(process.cwd(), process.argv[2] ?? "pack");
const REPO_ROOT = resolve(__dirname, "..");

interface PackJson {
  slug: string;
  version: string;
}

async function main() {
  if (!existsSync(PACK_DIR)) {
    console.error("Pack directory not found:", PACK_DIR);
    process.exit(1);
  }
  const packPath = join(PACK_DIR, "pack.json");
  if (!existsSync(packPath)) {
    console.error("pack.json not found.");
    process.exit(1);
  }
  const pack: PackJson = JSON.parse(readFileSync(packPath, "utf-8")) as PackJson;
  const { slug, version } = pack;
  if (!slug || !version) {
    console.error("pack.json must have slug and version");
    process.exit(1);
  }

  const bucket = process.env.S3_BUCKET;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!bucket || !accessKey || !secretKey) {
    console.error("Set S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY");
    process.exit(1);
  }

  // 1) Build
  const buildResult = spawnSync("pnpm", ["pack:build", PACK_DIR], { stdio: "inherit", cwd: REPO_ROOT });
  if (buildResult.status !== 0) process.exit(buildResult.status ?? 1);

  const distDir = join(PACK_DIR, "dist");
  const zipPath = join(distDir, `${slug}-${version}.zip`);
  const pluginZipPath = join(distDir, `${slug}-${version}-plugin.zip`);
  if (!existsSync(zipPath)) {
    console.error("Build did not produce zip:", zipPath);
    process.exit(1);
  }

  // 2) Upload with @aws-sdk/client-s3
  const endpoint = process.env.S3_ENDPOINT ?? undefined;
  const region = process.env.AWS_REGION ?? "auto";
  let S3Client: typeof import("@aws-sdk/client-s3").S3Client;
  let PutObjectCommand: typeof import("@aws-sdk/client-s3").PutObjectCommand;
  let readFile: typeof import("fs/promises")["readFile"];
  try {
    const s3 = await import("@aws-sdk/client-s3");
    S3Client = s3.S3Client;
    PutObjectCommand = s3.PutObjectCommand;
    readFile = (await import("fs/promises")).readFile;
  } catch {
    console.error("Install @aws-sdk/client-s3 (e.g. pnpm add -D @aws-sdk/client-s3)");
    process.exit(1);
  }

  const client = new S3Client({
    region,
    ...(endpoint && { endpoint, forcePathStyle: true }),
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });
  const keyPrefix = `packs/${slug}/${version}`;
  const zipKey = `${keyPrefix}/skills.zip`;
  const zipBuf = await readFile(zipPath);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: zipKey,
      Body: zipBuf,
      ContentType: "application/zip",
    })
  );
  const publicBase = process.env.S3_PUBLIC_BASE ?? (endpoint ? `${endpoint}/${bucket}` : `https://${bucket}.s3.${region}.amazonaws.com`);
  const zipUrl = `${publicBase.replace(/\/$/, "")}/${zipKey}`;
  console.log("Uploaded:", zipUrl);

  let pluginZipUrl: string | null = null;
  if (existsSync(pluginZipPath)) {
    const pluginKey = `${keyPrefix}/plugin.zip`;
    const pluginBuf = await readFile(pluginZipPath);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: pluginKey,
        Body: pluginBuf,
        ContentType: "application/zip",
      })
    );
    pluginZipUrl = `${publicBase.replace(/\/$/, "")}/${pluginKey}`;
    console.log("Uploaded:", pluginZipUrl);
  }

  // 3) Update DB
  const { PrismaClient } = await import("@clanker/db");
  const prisma = new PrismaClient();
  const pv = await prisma.packVersion.findFirst({
    where: { pack: { slug }, version },
  });
  if (!pv) {
    console.error("No PackVersion found for", slug, version, "- create pack/version in DB first.");
    await prisma.$disconnect();
    process.exit(1);
  }
  await prisma.packVersion.update({
    where: { id: pv.id },
    data: { artifactZipUrl: zipUrl, artifactPluginUrl: pluginZipUrl },
  });
  await prisma.$disconnect();
  console.log("Updated PackVersion", pv.id, "with artifact URLs.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
