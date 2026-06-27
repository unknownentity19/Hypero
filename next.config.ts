import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Strip console.* (except warn/error) from production bundles to trim JS.
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },

  // Tree-shake icon/animation barrels so only the symbols actually used end
  // up in each route's bundle. `lucide-react` is optimized by Next by
  // default; `framer-motion` and `cmdk` are added here because the studio
  // and a few interior pages still pull them in.
  experimental: {
    optimizePackageImports: ["framer-motion", "cmdk"],
  },

  // Hypero ships only its own assets — keep image config closed by default.
  images: {
    remotePatterns: [],
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
