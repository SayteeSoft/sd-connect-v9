/** @type {import('next').NextConfig} */
const nextConfig = {
  // rewrites are no longer needed as netlify dev handles proxying
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'web-developer.one',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
