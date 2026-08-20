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
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'bayi.girdap.com.tr' },
      { protocol: 'http', hostname: 'bayi.girdap.com.tr' },
      { protocol: 'https', hostname: 'garantiis.com.tr' },
      { protocol: 'https', hostname: 'www.garantiis.com.tr' },
      { protocol: 'https', hostname: 'cdn.garantiis.com.tr' },
      { protocol: 'https', hostname: 'kombiklimaparca.com' },
      { protocol: 'https', hostname: 'www.kombiklimaparca.com' },
      { protocol: 'https', hostname: 'kombisanstore.com' },
      { protocol: 'https', hostname: 'www.kombisanstore.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.online-yedekparca.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'api.topuz.com' },
    ],
  },
};

export default withPWA(nextConfig);