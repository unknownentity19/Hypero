import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Hypero ships only its own assets — keep image config closed by default.
  images: {
    remotePatterns: [],
  },

  // Keep auth paths consistent everywhere (dev, `next start`, self-hosted, Vercel).
  // Defined here so the redirects fire regardless of host — `vercel.json`
  // alone would 404 in dev and on non-Vercel hosts.
  async redirects() {
    return [
      { source: "/login", destination: "/signin", permanent: true },
      { source: "/register", destination: "/signup", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
