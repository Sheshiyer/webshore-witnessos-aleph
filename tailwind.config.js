/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // WitnessOS Consciousness Color Palette
        'consciousness-gold': '#FFD700',
        'awareness-coral': '#FF7F50',
        'integration-teal': '#20B2AA',
        'sacred-purple': '#9370DB',
        'breath-blue': '#4169E1',
        'temple-amber': '#FFBF00',
        'forest-green': '#228B22',
        'cosmic-indigo': '#4B0082',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'spin-slow': 'spin-slow 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'spin-slow': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
    },
  },
  plugins: [],
}
