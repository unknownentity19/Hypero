import {
  Bot,
  Database,
  GitBranch,
  Globe,
  MessageSquare,
  Send,
  Shuffle,
  Webhook,
} from "lucide-react";
import type { NodeType } from "@/lib/projects";

export const NODE_META: Record<
  NodeType,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    text: string;
    dot: string;
    category: "trigger" | "logic" | "ai" | "io" | "integration";
  }
> = {
  trigger: {
    label: "Trigger",
    description: "Start when an event fires.",
    icon: Webhook,
    accent:
      "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    category: "trigger",
  },
  llm: {
    label: "AI Agent",
    description: "Reason with an LLM.",
    icon: Bot,
    accent:
      "bg-violet-500/10 border-violet-500/40 text-violet-700 dark:text-violet-400",
    text: "text-violet-700 dark:text-violet-400",
    dot: "bg-violet-500",
    category: "ai",
  },
  http: {
    label: "HTTP Request",
    description: "Call any HTTP endpoint.",
    icon: Globe,
    accent:
      "bg-sky-500/10 border-sky-500/40 text-sky-700 dark:text-sky-400",
    text: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500",
    category: "io",
  },
  condition: {
    label: "Condition",
    description: "Branch on a predicate.",
    icon: GitBranch,
    accent:
      "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    category: "logic",
  },
  transform: {
    label: "Transform",
    description: "Map and reshape data.",
    icon: Shuffle,
    accent:
      "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-700 dark:text-fuchsia-400",
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    dot: "bg-fuchsia-500",
    category: "logic",
  },
  database: {
    label: "Database",
    description: "Read or write a row.",
    icon: Database,
    accent:
      "bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-400",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    category: "io",
  },
  slack: {
    label: "Slack",
    description: "Post to a channel.",
    icon: MessageSquare,
    accent:
      "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    category: "integration",
  },
  output: {
    label: "Output",
    description: "Finalize and return.",
    icon: Send,
    accent:
      "bg-foreground/5 border-foreground/40 text-foreground",
    text: "text-foreground",
    dot: "bg-foreground",
    category: "io",
  },
};

export const NODE_ORDER: NodeType[] = [
  "trigger",
  "llm",
  "http",
  "condition",
  "transform",
  "database",
  "slack",
  "output",
];
