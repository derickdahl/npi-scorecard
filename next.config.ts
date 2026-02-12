import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force Vercel to rebuild all static pages
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Build timestamp for cache busting
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
};

export default nextConfig;
