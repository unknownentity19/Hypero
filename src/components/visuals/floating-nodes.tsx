"use client";

import { motion } from "framer-motion";
import { Bot, Database, MessageSquare, Sparkles, Zap } from "lucide-react";

const FLOATERS = [
  {
    icon: <Bot className="h-3.5 w-3.5" />,
    label: "agent.run()",
    className:
      "left-[10%] top-[20%] sm:left-[8%] sm:top-[28%]",
    delay: 0,
  },
  {
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "reasoning",
    className:
      "right-[8%] top-[14%] sm:right-[10%] sm:top-[20%]",
    delay: 0.4,
  },
  {
    icon: <Database className="h-3.5 w-3.5" />,
    label: "postgres.query",
    className:
      "left-[6%] bottom-[18%] sm:left-[12%] sm:bottom-[22%]",
    delay: 0.8,
  },
  {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    label: "slack.notify",
    className:
      "right-[10%] bottom-[14%] sm:right-[8%] sm:bottom-[26%]",
    delay: 1.1,
  },
  {
    icon: <Zap className="h-3.5 w-3.5" />,
    label: "trigger",
    className:
      "right-[20%] top-[44%] hidden md:inline-flex",
    delay: 1.4,
  },
];

export function FloatingNodes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {FLOATERS.map((f) => (
        <motion.span
          key={f.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: f.delay, ease: "easeOut" }}
          className={`absolute inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-sm shadow-sm animate-float ${f.className}`}
          style={{ animationDelay: `${f.delay}s` }}
        >
          <span className="text-foreground">{f.icon}</span>
          <span className="font-mono">{f.label}</span>
        </motion.span>
      ))}
    </div>
  );
}
