import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // In development, proxy API requests to the Netlify Functions server
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
  /* config options here */
  experimental: {
    
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
  webpack: (
    config,
    { isServer }
  ) => {
    if (isServer) {
      config.externals.push('handlebars');
    }
    return config;
  }
};

export default nextConfig;
