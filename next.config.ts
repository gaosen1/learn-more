import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export', // 导出静态HTML
  images: {
    domains: ['ui-avatars.com', 'avatars.githubusercontent.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
