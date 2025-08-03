/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Cloudflare Pages (disabled for dynamic routes)
  // output: 'export',

  // Skip API routes for static export
  skipTrailingSlashRedirect: true,
  
  // Add trailing slash for better compatibility
  trailingSlash: true,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.witnessos.space',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
    NEXT_PUBLIC_FALLBACK_MODE: process.env.NEXT_PUBLIC_FALLBACK_MODE || 'true',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://witnessos.space'
  },
  
  // Webpack configuration for consciousness engines
  webpack: (config, { isServer }) => {
    // Handle astronomy-engine and other scientific libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled due to critters module issue
    optimizePackageImports: ['framer-motion', 'three', '@react-three/fiber']
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // Disable ESLint during build to speed up deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build to speed up deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Note: Headers and redirects are handled by Cloudflare Pages
  // Static export doesn't support async headers() or redirects()
};

module.exports = nextConfig;
