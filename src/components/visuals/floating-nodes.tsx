import { Bot, Database, MessageSquare, Sparkles, Zap } from "lucide-react";

const FLOATERS = [
  {
    icon: <Bot className="h-3.5 w-3.5" />,
    label: "agent.run()",
    className: "left-[6%] top-[18%] sm:left-[8%] sm:top-[24%]",
    delay: 0,
  },
  {
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "reasoning",
    className: "right-[8%] top-[14%] sm:right-[10%] sm:top-[20%]",
    delay: 0.4,
  },
  {
    icon: <Database className="h-3.5 w-3.5" />,
    label: "postgres.query",
    className: "hidden md:inline-flex left-[4%] top-[44%]",
    delay: 0.8,
  },
  {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    label: "slack.notify",
    className: "hidden md:inline-flex right-[4%] top-[50%]",
    delay: 1.1,
  },
  {
    icon: <Zap className="h-3.5 w-3.5" />,
    label: "trigger",
    className: "hidden lg:inline-flex right-[18%] top-[36%]",
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
        <span
          key={f.label}
          className={`animate-floater absolute inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-sm shadow-sm ${f.className}`}
          style={{ animationDelay: `${f.delay}s, ${f.delay}s` }}
        >
          <span className="text-foreground">{f.icon}</span>
          <span className="font-mono">{f.label}</span>
        </span>
      ))}
    </div>
  );
}
