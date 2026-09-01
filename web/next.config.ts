import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.join(__dirname, ".."));
loadEnvConfig(__dirname);

const googleWebClientId =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID: googleWebClientId,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
