"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LAYERS = [
  {
    title: "Triggers",
    desc: "Webhooks, schedules, events, manual runs",
    items: ["HTTP", "Schedule", "Event Bus", "Form"],
  },
  {
    title: "Reasoning Layer",
    desc: "AI agents that plan, decide, and call tools",
    items: ["Agent", "Memory", "Planner", "Tool calls"],
    accent: true,
  },
  {
    title: "Workflow Engine",
    desc: "Deterministic steps, branches, and retries",
    items: ["Steps", "Conditions", "Loops", "Retry"],
  },
  {
    title: "Integrations",
    desc: "200+ connectors and HTTP for everything else",
    items: ["Slack", "Postgres", "Notion", "OpenAI"],
  },
];

export function ArchitectureDiagram({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card p-6 sm:p-8",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {LAYERS.map((layer, i) => (
          <motion.div
            key={layer.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={cn(
              "relative flex flex-col gap-3 rounded-xl border p-4",
              layer.accent
                ? "border-foreground/30 bg-accent"
                : "border-border bg-background",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {layer.title}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                0{i + 1}
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {layer.desc}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {layer.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Request → Reasoning → Action → Result</span>
        <span className="font-mono">end-to-end · streaming</span>
      </div>
    </div>
  );
}
