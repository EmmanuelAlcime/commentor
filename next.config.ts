import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Emit .next/standalone so the Docker image ships only the traced runtime files
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [new URL("https://picsum.photos/seed/**")],
  },
  experimental: {
    serverActions: {
      // Profile pictures are capped at 2 MB in the domain; the rest covers multipart overhead
      bodySizeLimit: "3mb",
    },
  },
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
