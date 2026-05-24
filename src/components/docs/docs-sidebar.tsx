"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type DocSection = {
  id: string;
  label: string;
  items: { id: string; label: string }[];
};

export function DocsSidebar({ sections }: { sections: DocSection[] }) {
  const allIds = sections.flatMap((s) => s.items.map((i) => i.id));
  const [active, setActive] = useState<string>(allIds[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  return (
    <motion.nav
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-label="Docs navigation"
      className="hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-4"
    >
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.id}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
              {section.label}
            </p>
            <ul className="mt-2 flex flex-col gap-0.5 border-l border-border">
              {section.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id} className="relative">
                    {isActive ? (
                      <motion.span
                        layoutId="docs-active"
                        className="absolute left-[-1px] top-0 bottom-0 w-px bg-foreground"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    ) : null}
                    <a
                      href={`#${item.id}`}
                      className={cn(
                        "block py-1.5 pl-3 text-[13px] transition-colors",
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </motion.nav>
  );
}
