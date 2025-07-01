#!/bin/bash

# WitnessOS Cloudflare Pages Build Script
# Builds the Next.js app for static deployment on Cloudflare Pages

set -e

echo "🏗️  Building WitnessOS Frontend for Cloudflare Pages..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build Next.js app for static export
echo "🔨 Building Next.js app..."
npm run build

# Copy static files to dist directory
echo "📁 Preparing static files..."
if [ -d "dist" ]; then
    echo "✅ Static build completed successfully!"
    echo "📊 Build statistics:"
    ls -la dist/
    echo "🚀 Ready for Cloudflare Pages deployment!"
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✨ Build completed successfully!" 