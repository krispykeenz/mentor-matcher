import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const config = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
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
