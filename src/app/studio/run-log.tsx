"use client";

import * as React from "react";
import { CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react";
import type { RunState, RunStep } from "./types";

function StatusIcon({ status }: { status: RunStep["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />;
    case "success":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "error":
      return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    default:
      return <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

/**
 * Streams the simulated run as a list of steps + per-step output.
 * Auto-scrolls to the bottom as new steps come in.
 */
export function RunLog({ run }: { run: RunState }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [run.steps]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Run log
        </p>
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] " +
            (run.status === "running"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : run.status === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : run.status === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                  : "border-border bg-muted text-muted-foreground")
          }
        >
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (run.status === "running"
                ? "bg-amber-500 animate-pulse"
                : run.status === "success"
                  ? "bg-emerald-500"
                  : run.status === "error"
                    ? "bg-red-500"
                    : "bg-muted-foreground/40")
            }
          />
          {run.status}
        </span>
      </div>

      <div ref={ref} className="flex-1 overflow-y-auto px-2 py-3">
        {run.steps.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Click <span className="font-medium text-foreground">Run</span> to
            simulate this workflow.
          </div>
        ) : (
          <ol className="flex flex-col gap-1">
            {run.steps.map((s, i) => {
              const ms =
                s.startedAt && s.finishedAt
                  ? Math.max(1, s.finishedAt - s.startedAt)
                  : null;
              return (
                <li
                  key={`${s.nodeId}-${i}`}
                  className="rounded-lg border border-transparent px-3 py-2 text-xs transition-colors hover:border-border hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon status={s.status} />
                    <span className="font-medium text-foreground">
                      {s.label}
                    </span>
                    {ms != null ? (
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {ms}ms
                      </span>
                    ) : null}
                  </div>
                  {s.output ? (
                    <pre className="mt-1.5 whitespace-pre-wrap rounded-md bg-muted/60 px-2.5 py-2 font-mono text-[11px] leading-relaxed text-foreground/80">
                      {s.output}
                    </pre>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
