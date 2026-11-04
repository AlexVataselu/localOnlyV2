import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PREVIEW ONLY: show main as-is despite its existing type errors.
  typescript: { ignoreBuildErrors: true },
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
