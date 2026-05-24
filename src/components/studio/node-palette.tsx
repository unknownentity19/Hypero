"use client";

import { GripVertical } from "lucide-react";
import { NODE_META, NODE_ORDER } from "./node-meta";
import type { NodeType } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function NodePalette({
  onAdd,
}: {
  onAdd: (type: NodeType) => void;
}) {
  return (
    <div className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Node palette
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag onto the canvas or click to add.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {NODE_ORDER.map((type) => {
          const meta = NODE_META[type];
          const Icon = meta.icon;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onAdd(type)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/x-hypero-node", type);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className={cn(
                "group flex w-full items-start gap-2.5 rounded-lg border border-border bg-background p-2.5 text-left transition-colors hover:bg-accent",
                "cursor-grab active:cursor-grabbing",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                  meta.accent,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-foreground">
                  {meta.label}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {meta.description}
                </span>
              </span>
              <GripVertical className="mt-1 h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
      <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
        Tip: click a node on the canvas to edit its config. Press{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">
          ⌫
        </kbd>{" "}
        to delete.
      </div>
    </div>
  );
}
