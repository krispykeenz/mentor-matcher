import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b2d4ff',
          300: '#7ab6ff',
          400: '#4a94ff',
          500: '#1d6fff',
          600: '#0f54d6',
          700: '#0c42a8',
          800: '#0e3a86',
          900: '#102f66',
        },
        sand: {
          50: '#f9f7f4',
          100: '#f3eee8',
          200: '#e4d8c7',
          300: '#d1c0a6',
          400: '#bfa986',
          500: '#a98f66',
          600: '#8a704a',
          700: '#6b5537',
          800: '#4a3b24',
          900: '#291f12',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -15px rgba(32, 46, 67, 0.25)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
