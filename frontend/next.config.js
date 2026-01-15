/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['api.minimax.chat'],
  },
};

module.exports = nextConfig;
