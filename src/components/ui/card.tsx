import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  as?: "div" | "article";
};

export function Card({
  className,
  hover = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card p-6",
        hover &&
          "transition-[transform,border-color] duration-200 ease-out will-change-transform hover:-translate-y-[3px] hover:border-border-strong motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
