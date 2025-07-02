
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'https://6000-firebase-studio-1751142646615.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev',
    'https://9000-firebase-studio-1751142646615.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev',
  ],
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
