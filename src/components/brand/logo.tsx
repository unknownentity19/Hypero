import Image from "next/image";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const MARK_SIZES: Record<Size, { className: string; pixels: number }> = {
  sm: { className: "h-7 w-7", pixels: 28 },
  md: { className: "h-9 w-9", pixels: 36 },
  lg: { className: "h-11 w-11", pixels: 44 },
};

const TEXT_SIZES: Record<Size, string> = {
  sm: "text-[14px] tracking-[0.18em]",
  md: "text-[16px] tracking-[0.2em]",
  lg: "text-[18px] tracking-[0.22em]",
};

/**
 * Hypero logomark. We use the SVG provided (`/public/logo.svg`)
 * for crisp rendering at any size. `next/image` handles sizing,
 * the file is served from the public folder so it can be cached on the
 * edge without further config.
 */
export function LogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  const { className: sizeClass, pixels } = MARK_SIZES[size];
  return (
    <Image
      src="/logo.svg"
      width={pixels}
      height={pixels}
      alt=""
      aria-hidden
      priority
      className={cn("shrink-0 object-contain", sizeClass, className)}
    />
  );
}

/**
 * Full Hypero lockup — logomark + uppercase wordmark.
 */
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span
        className={cn(
          "font-semibold uppercase text-foreground",
          TEXT_SIZES[size],
        )}
      >
        Hypero
      </span>
    </span>
  );
}
