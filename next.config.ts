import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gpccsfejlkraznleohfv.supabase.co",
      },
    ],
  },
};

export default nextConfig;