import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: true, // Geliştirme aşamasında şimdilik tamamen kapatıyoruz ki hata almayalım
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.topuz.com' } // Gelecekteki bot için şimdiden açtık
    ],
  },
};

export default withPWA(nextConfig);