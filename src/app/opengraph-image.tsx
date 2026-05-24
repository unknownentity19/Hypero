import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";

export const alt = `${SITE.name} — ${SITE.shortDescription}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 80% 0%, rgba(139,92,246,0.18), transparent 50%), radial-gradient(circle at 0% 100%, rgba(99,102,241,0.18), transparent 55%), #ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#09090b",
        }}
      >
        {/* Logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#09090b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 200 200">
              <g transform="rotate(-14 100 100)" fill="#ffffff" fillRule="evenodd">
                <path d="M 20 100 a 80 24 0 1 0 160 0 a 80 24 0 1 0 -160 0 Z M 32 100 a 68 14 0 1 1 136 0 a 68 14 0 1 1 -136 0 Z" />
                <path d="M 54 96 a 46 46 0 1 0 92 0 a 46 46 0 1 0 -92 0 Z M 100 70 C 108 84 116 86 144 96 C 116 106 108 108 100 122 C 92 108 84 106 56 96 C 84 86 92 84 100 70 Z" />
              </g>
            </svg>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            {SITE.name}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 86,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              maxWidth: 980,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Build AI workflows</span>
            <span
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              visually.
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#52525B",
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            {SITE.description}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#71717A",
          }}
        >
          <span>hypero.dev</span>
          <span style={{ display: "flex", gap: 16 }}>
            <span>Visual canvas</span>
            <span>·</span>
            <span>AI agents</span>
            <span>·</span>
            <span>Production runtime</span>
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
