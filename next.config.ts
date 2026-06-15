import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  allowedDevOrigins: ["10.117.60.41", "10.117.60.28", "10.117.60.20"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.transparenttextures.com",
      },
      // Allow any hostname so locally uploaded /public/uploads/ images work too
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
