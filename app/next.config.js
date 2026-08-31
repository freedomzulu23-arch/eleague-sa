/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;