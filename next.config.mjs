import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const config = {
  ...(isDemo
    ? {
        // GitHub Pages static hosting
        output: 'export',
        trailingSlash: true,
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  images: {
    ...(isDemo ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      // Allow Firebase Storage emulator in development
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9199',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9199',
        pathname: '/v0/b/**',
      },
    ],
  },
  transpilePackages: ['lucide-react'],
};

export default withPWA({
  dest: 'public',
  disable: isDev || isDemo,
  register: true,
  skipWaiting: true,
})(config);
