/**
 * Single source of truth for site-wide config used in metadata,
 * OG images, sitemap, and robots.
 *
 * Override `NEXT_PUBLIC_SITE_URL` at deploy time (e.g. on Vercel) so
 * absolute URLs resolve correctly. Defaults to a sensible value for
 * local development.
 */

export const SITE = {
  name: "Hypero",
  shortDescription: "Build AI workflows visually.",
  description:
    "Hypero is the visual AI workflow builder for teams. Compose automations, AI agents, and tools in minutes — not months.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),
  twitter: "@hyperolabs",
  themeColor: "#ffffff",
  themeColorDark: "#09090b",
  ogImage: "/opengraph-image",
} as const;
