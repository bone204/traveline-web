import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "minio.halongbay.com.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media-cdn-v2.laodong.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mia.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rootytrip.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
