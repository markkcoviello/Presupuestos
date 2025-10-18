import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    // Configuración normal de webpack para desarrollo
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // Permitir orígenes de desarrollo para evitar problemas de CORS
  allowedDevOrigins: ['preview-chat-eed29d55-349c-4ec6-982b-b1514d1c7d98.space.z.ai'],
};

export default nextConfig;
