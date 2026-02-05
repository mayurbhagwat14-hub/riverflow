import type { NextConfig } from "next";
import env from "@/app/env";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(env.appwrite.endpoint).hostname,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
