import {
  Bot,
  Clock,
  Code2,
  Database,
  GitBranch,
  Globe,
  MessageSquare,
  Rows3,
  Webhook,
} from "lucide-react";
import type { NodeKind } from "./types";

/** Shared kind → icon component lookup. Keeps the canvas, palette, and
 * inspector visually consistent. */
export function NodeIcon({
  kind,
  className,
}: {
  kind: NodeKind;
  className?: string;
}) {
  const cls = className ?? "h-4 w-4";
  switch (kind) {
    case "webhook":
      return <Webhook className={cls} />;
    case "schedule":
      return <Clock className={cls} />;
    case "http":
      return <Globe className={cls} />;
    case "agent":
      return <Bot className={cls} />;
    case "condition":
      return <GitBranch className={cls} />;
    case "transform":
      return <Code2 className={cls} />;
    case "slack":
      return <MessageSquare className={cls} />;
    case "postgres":
      return <Database className={cls} />;
    case "notion":
      return <Rows3 className={cls} />;
  }
}
