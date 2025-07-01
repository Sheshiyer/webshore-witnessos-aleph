import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Temporarily disable TypeScript errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Cloudflare Pages configuration (only for production)
  ...(process.env.NODE_ENV === 'production' ? {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    output: 'export',
    distDir: 'dist',
    images: {
      unoptimized: true,
    },
  } : {
    // Development configuration
    images: {
      unoptimized: false,
    },
  }),

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

  // Environment-specific configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://api.witnessos.space'
      : process.env.NODE_ENV === 'development'
      ? 'http://localhost:8787'
      : 'https://api-staging.witnessos.space',
  },

  // API proxy to avoid CORS issues in development
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8787/:path*',
      },
    ];
  },

  // Cross-origin configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // GLSL loader
    if (!isServer) {
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader'],
      });
    }

    return config;
  },

  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
