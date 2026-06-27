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
      draggable={false}
      // Deter casual saving/dragging of the mark: `pointer-events-none`
      // means a right-click targets the surrounding element (no "Save image"
      // entry) and the image can't be dragged out, while link clicks still
      // pass through. `select-none` + `-webkit-user-drag` cover the rest.
      className={cn(
        "shrink-0 object-contain pointer-events-none select-none [-webkit-user-drag:none]",
        sizeClass,
        className,
      )}
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
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
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
