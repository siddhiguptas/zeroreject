import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    proxyTimeout: 120_000,
  },
  async rewrites() {
    const internalApi = process.env.INTERNAL_API_URL || "http://127.0.0.1:8001";
    return [
      {
        source: "/api/:path*",
        destination: `${internalApi}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

