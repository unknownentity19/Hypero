"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Database,
  GitBranch,
  Globe,
  MessageSquare,
  Sparkles,
  Webhook,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Node = {
  id: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  accent?: boolean;
};

const NODES: Node[] = [
  {
    id: "trigger",
    label: "Webhook",
    sub: "Trigger",
    icon: <Webhook className="h-4 w-4" />,
    x: 40,
    y: 90,
  },
  {
    id: "fetch",
    label: "HTTP Request",
    sub: "Fetch CRM lead",
    icon: <Globe className="h-4 w-4" />,
    x: 240,
    y: 40,
  },
  {
    id: "agent",
    label: "AI Agent",
    sub: "Classify & enrich",
    icon: <Bot className="h-4 w-4" />,
    x: 240,
    y: 150,
    accent: true,
  },
  {
    id: "branch",
    label: "Condition",
    sub: "If priority = high",
    icon: <GitBranch className="h-4 w-4" />,
    x: 460,
    y: 90,
  },
  {
    id: "db",
    label: "Postgres",
    sub: "Update record",
    icon: <Database className="h-4 w-4" />,
    x: 660,
    y: 40,
  },
  {
    id: "slack",
    label: "Slack",
    sub: "Notify owner",
    icon: <MessageSquare className="h-4 w-4" />,
    x: 660,
    y: 150,
  },
];

const EDGES: [string, string][] = [
  ["trigger", "fetch"],
  ["trigger", "agent"],
  ["fetch", "branch"],
  ["agent", "branch"],
  ["branch", "db"],
  ["branch", "slack"],
];

function getNode(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function WorkflowPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          </span>
          <span className="ml-2 text-xs text-muted-foreground font-mono">
            workflows / lead-router
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Canvas */}
      <div className="relative h-[260px] sm:h-[280px] w-full bg-grid">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 760 240"
          preserveAspectRatio="xMidYMid meet"
        >
          {EDGES.map(([from, to], i) => {
            const a = getNode(from);
            const b = getNode(to);
            const x1 = a.x + 110;
            const y1 = a.y + 24;
            const x2 = b.x;
            const y2 = b.y + 24;
            const cx = (x1 + x2) / 2;
            return (
              <g key={`${from}-${to}`}>
                <path
                  d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                  stroke="rgb(var(--border-strong))"
                  strokeWidth="1.5"
                  fill="none"
                />
                <motion.circle
                  r="3"
                  fill="rgb(var(--gradient-via))"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                  style={{
                    offsetPath: `path("M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}")`,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {NODES.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            className={cn(
              "absolute flex h-12 w-[110px] flex-col rounded-lg border bg-card px-2.5 py-1.5 shadow-sm",
              node.accent
                ? "border-foreground/40 bg-accent"
                : "border-border",
            )}
            style={{ left: node.x, top: node.y }}
          >
            <div className="flex items-center gap-1.5 text-foreground">
              {node.icon}
              <span className="text-[11px] font-medium">{node.label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate">
              {node.sub}
            </span>
          </motion.div>
        ))}

        {/* Floating sparkle */}
        <motion.div
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Sparkles className="h-3 w-3 text-foreground" />
          AI reasoning
        </motion.div>
      </div>

      {/* Footer status */}
      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Zap className="h-3 w-3" />6 nodes · 2 branches
        </span>
        <span className="font-mono">avg 184ms</span>
      </div>
    </div>
  );
}
