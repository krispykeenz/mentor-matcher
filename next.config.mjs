import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const config = {
  images: {
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
  disable: isDev,
  register: true,
  skipWaiting: true,
})(config);
