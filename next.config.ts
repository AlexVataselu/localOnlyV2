import type { NextConfig } from "next";
import { IMAGE_HOSTS } from "./src/lib/images";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
    },
  },
  images: {
    remotePatterns: [
      ...IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
      // Google profile photos of signed-in hosts.
      { protocol: "https" as const, hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
