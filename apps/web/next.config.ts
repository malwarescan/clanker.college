import type { NextConfig } from "next";
import path from "path";
import { config } from "dotenv";

// Load .env from app dir (apps/web) and monorepo root so env is found either way. .env.local overrides .env.
const cwd = process.cwd();
const root = path.resolve(cwd, "../..");
for (const dir of [cwd, root]) {
  config({ path: path.join(dir, ".env") });
  config({ path: path.join(dir, ".env.local"), override: true });
}

const nextConfig: NextConfig = {
  transpilePackages: ["@clanker/db", "@clanker/shared"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
