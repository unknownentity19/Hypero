import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outline" | "soft";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-foreground text-background",
    outline:
      "border border-border bg-background text-muted-foreground",
    soft:
      "bg-accent text-foreground border border-border",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
