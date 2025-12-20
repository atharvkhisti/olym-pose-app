/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // TODO: Add AI service proxy configuration when integrating FastAPI
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/ai/:path*',
  //       destination: `${process.env.AI_SERVICE_URL}/:path*`,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
