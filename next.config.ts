import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
