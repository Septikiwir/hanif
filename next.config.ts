import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "moiverzptaelrnqfmsjo.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
