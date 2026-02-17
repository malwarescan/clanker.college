import type { NextConfig } from "next";
import path from "path";
import { config } from "dotenv";

// Load root .env and .env.local so DATABASE_URL (and others) are available to Prisma when using root env files
const root = path.resolve(process.cwd(), "../..");
config({ path: path.join(root, ".env") });
config({ path: path.join(root, ".env.local") });

const nextConfig: NextConfig = {
  transpilePackages: ["@clanker/db", "@clanker/shared"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
