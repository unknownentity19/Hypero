"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={cn(
          "relative rounded-2xl border border-border bg-card p-6 transition-colors",
          "hover:border-border-strong",
          className,
        )}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
