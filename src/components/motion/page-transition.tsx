"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * Per-route mount fade powered by a pure CSS animation, deliberately
 * **without** framer-motion. Earlier versions used `motion.div` with
 * `initial={{ opacity: 0 }}`, which baked `style="opacity:0"` into the
 * SSR HTML; if hydration was slow or interrupted (rapid back/forward,
 * a Turbopack recompile in dev), the animation could fail to fire and
 * the page would stay invisible.
 *
 * A keyed `<div>` with `animation: studio-fade-in` solves both:
 * - The animation runs from the browser's CSS engine, not React state.
 * - `animation-fill-mode: backwards` means the element starts invisible
 *   (matching the keyframe), and the final declared opacity (1) sticks
 *   even if the animation is cancelled mid-flight.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
