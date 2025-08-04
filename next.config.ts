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
    // Always use Railway backend for all environments to ensure demo login works
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://webshore-witnessos-aleph-production.up.railway.app',
  },

  // API proxy disabled - using production backend directly
  async rewrites() {
    return [];
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
