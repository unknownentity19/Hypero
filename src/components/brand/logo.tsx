import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const MARK_SIZES: Record<Size, string> = {
  sm: "h-6 w-6 rounded-[7px]",
  md: "h-7 w-7 rounded-[8px]",
  lg: "h-10 w-10 rounded-[10px]",
};

const TEXT_SIZES: Record<Size, string> = {
  sm: "text-[14px]",
  md: "text-[15px]",
  lg: "text-[18px]",
};

/**
 * Hypero logomark — a stylized ringed planet with a 4-pointed
 * sparkle cutout suggesting AI / orbit / connection.
 *
 * Renders as `currentColor` so the planet picks up the parent text
 * color (white inside the dark rounded square in light mode, black
 * inside the white rounded square in dark mode, etc.).
 */
export function LogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex items-center justify-center bg-foreground text-background shrink-0",
        MARK_SIZES[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[82%] w-[82%]"
      >
        <g transform="rotate(-14 100 100)">
          {/* Ring (donut) */}
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="
              M 20 100
              a 80 24 0 1 0 160 0
              a 80 24 0 1 0 -160 0
              Z
              M 32 100
              a 68 14 0 1 1 136 0
              a 68 14 0 1 1 -136 0
              Z
            "
          />
          {/* Planet with sparkle cutout */}
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="
              M 54 96
              a 46 46 0 1 0 92 0
              a 46 46 0 1 0 -92 0
              Z
              M 100 70
              C 108 84 116 86 144 96
              C 116 106 108 108 100 122
              C 92 108 84 106 56 96
              C 84 86 92 84 100 70
              Z
            "
          />
        </g>
      </svg>
    </span>
  );
}

/**
 * Full Hypero lockup — logomark + wordmark.
 */
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          TEXT_SIZES[size],
        )}
      >
        Hypero
      </span>
    </span>
  );
}
