/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // During development, proxy requests to Netlify Functions server
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/.netlify/functions/:path*',
          destination: 'http://localhost:9999/.netlify/functions/:path*',
        },
      ];
    }
    return [];
  },
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
