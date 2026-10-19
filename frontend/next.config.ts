import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Configuration locale centralisée à la racine ; Compose injecte déjà ces variables.
const envFile = resolve(process.cwd(), "../.env.dev");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/reinitialiser-mot-de-passe",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
