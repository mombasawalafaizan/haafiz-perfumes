import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "f004.backblazeb2.com",
      },
    ],
  },
};

export default nextConfig;
