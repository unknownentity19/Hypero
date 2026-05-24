"use client";

import { Check, CircleDashed, Loader2 } from "lucide-react";
import type { RunLog, RunStep } from "@/lib/projects";
import { cn } from "@/lib/utils";

type Props = {
  log: RunLog | null;
  activeStepIndex: number | null;
  open: boolean;
  onClose: () => void;
};

export function RunLogPanel({ log, activeStepIndex, open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Run output
          </span>
          {log ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]",
                log.status === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  log.status === "success" ? "bg-emerald-500" : "bg-red-500",
                )}
              />
              {log.status} · {log.durationMs}ms
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> running…
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          hide
        </button>
      </div>
      <ol className="max-h-56 overflow-y-auto divide-y divide-border">
        {log?.steps.map((step, i) => (
          <StepRow
            key={`${step.nodeId}-${i}`}
            step={step}
            index={i}
            state={
              activeStepIndex === null
                ? "done"
                : i < activeStepIndex
                  ? "done"
                  : i === activeStepIndex
                    ? "running"
                    : "pending"
            }
          />
        ))}
      </ol>
    </div>
  );
}

function StepRow({
  step,
  index,
  state,
}: {
  step: RunStep;
  index: number;
  state: "pending" | "running" | "done";
}) {
  return (
    <li className="grid grid-cols-[24px_1fr_auto] items-center gap-3 px-4 py-2">
      <span className="text-xs text-muted-foreground font-mono">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm">
          {state === "done" ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : state === "running" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
          ) : (
            <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground truncate">
            {step.label}
          </span>
        </div>
        <p className="ml-5 text-[11px] text-muted-foreground truncate font-mono">
          {state === "pending" ? "—" : step.output}
        </p>
      </div>
      <span className="text-[11px] text-muted-foreground font-mono">
        {state === "pending" ? "—" : `${step.ms}ms`}
      </span>
    </li>
  );
}
