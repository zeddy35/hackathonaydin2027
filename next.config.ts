import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Served from Vercel's edge cache; AVIF first, WebP fallback.
    formats: ["image/avif", "image/webp"],
    // Sponsor logos and judge/mentor photos uploaded from the admin panel (Supabase Storage, public bucket).
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
