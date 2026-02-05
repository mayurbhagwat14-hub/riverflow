import type { NextConfig } from "next";
import env from "@/app/env";

// Pehle check karein ki endpoint valid hai ya nahi
const getAppwriteHostname = () => {
  try {
    // Agar env load ho gaya hai toh hostname nikalo
    if (env.appwrite.endpoint) {
      return new URL(env.appwrite.endpoint).hostname;
    }
  } catch (e) {
    console.error("Invalid Appwrite Endpoint during build:", e);
  }
  // Fallback for build time if env is missing
  return "cloud.appwrite.io";
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: getAppwriteHostname(),
        port: "",
        pathname: "/v1/storage/buckets/**", // Appwrite images yahi se aati hain
      },
    ],
  },
};

export default nextConfig;
