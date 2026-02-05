import type { NextConfig } from "next";
import env from "@/app/env"

const nextConfig: NextConfig = {
  images: {
    domains: [env.appwrite.endpoint],
  },
};

export default nextConfig;
