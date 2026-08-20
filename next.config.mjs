import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracing: true,
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'undici', '@prisma/client', 'prisma'],
    outputFileTracingIncludes: {
      '/**': ['./prisma/**/*', './dev.db', './prisma/dev.db'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.online-yedekparca.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'api.topuz.com' }
    ],
  },
};

export default withPWA(nextConfig);