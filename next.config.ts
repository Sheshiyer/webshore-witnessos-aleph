import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // Development optimizations
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader'],
      },
    },
  },

  // Better error overlay
  devIndicators: {
    position: 'bottom-right',
  },

  // Cross-origin configuration for development
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
