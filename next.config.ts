
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['https://*.cloudworkstations.dev'],
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
