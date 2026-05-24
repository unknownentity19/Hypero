"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { NODE_META } from "./node-meta";
import type { NodeType, ProjectEdge, ProjectNode } from "@/lib/projects";
import { cn } from "@/lib/utils";

const NODE_W = 196;
const NODE_H = 70;
const CANVAS_W = 2400;
const CANVAS_H = 1500;

type Props = {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  selectedNodeId: string | null;
  activeStepNodeId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onCreate: (type: NodeType, x: number, y: number) => void;
  onConnect: (from: string, to: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
};

type DragState =
  | { kind: "none" }
  | { kind: "node"; nodeId: string; offsetX: number; offsetY: number }
  | { kind: "connect"; from: string; x: number; y: number; hoverNodeId: string | null };

function getPorts(node: ProjectNode) {
  const inX = node.x;
  const inY = node.y + NODE_H / 2;
  const outX = node.x + NODE_W;
  const outY = node.y + NODE_H / 2;
  return { inX, inY, outX, outY };
}

function edgePath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.4);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function Canvas({
  nodes,
  edges,
  selectedNodeId,
  activeStepNodeId,
  onSelect,
  onMove,
  onCreate,
  onConnect,
  onDeleteNode,
  onDeleteEdge,
}: Props) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [drag, setDrag] = React.useState<DragState>({ kind: "none" });
  const [hoverEdge, setHoverEdge] = React.useState<string | null>(null);

  // Local fast-moving position overrides while dragging a node (avoid lag).
  const [localPos, setLocalPos] = React.useState<{ id: string; x: number; y: number } | null>(
    null,
  );

  const getCanvasPoint = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left + (canvasRef.current?.scrollLeft ?? 0),
      y: e.clientY - rect.top + (canvasRef.current?.scrollTop ?? 0),
    };
  };

  // Global pointer move / up while dragging a node or connecting
  React.useEffect(() => {
    if (drag.kind === "none") return;
    const onMoveEvt = (e: PointerEvent) => {
      const pt = getCanvasPoint(e);
      if (drag.kind === "node") {
        const x = Math.max(0, Math.min(CANVAS_W - NODE_W, pt.x - drag.offsetX));
        const y = Math.max(0, Math.min(CANVAS_H - NODE_H, pt.y - drag.offsetY));
        setLocalPos({ id: drag.nodeId, x, y });
      } else if (drag.kind === "connect") {
        setDrag({ ...drag, x: pt.x, y: pt.y });
      }
    };
    const onUp = (e: PointerEvent) => {
      if (drag.kind === "node") {
        if (localPos && localPos.id === drag.nodeId) {
          onMove(drag.nodeId, localPos.x, localPos.y);
        }
        setLocalPos(null);
      } else if (drag.kind === "connect") {
        // Hit-test against nodes for input port
        const pt = getCanvasPoint(e);
        const target = nodes.find((n) => {
          if (n.id === drag.from) return false;
          const { inX, inY } = getPorts(n);
          const d = Math.hypot(pt.x - inX, pt.y - inY);
          return d < 22;
        });
        if (target) {
          onConnect(drag.from, target.id);
        }
      }
      setDrag({ kind: "none" });
    };
    window.addEventListener("pointermove", onMoveEvt);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMoveEvt);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, localPos, nodes, onConnect, onMove]);

  // Delete-key handling
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedNodeId) {
          e.preventDefault();
          onDeleteNode(selectedNodeId);
          onSelect(null);
        }
      } else if (e.key === "Escape") {
        onSelect(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNodeId, onDeleteNode, onSelect]);

  const resolvedNodes = nodes.map((n) =>
    localPos && localPos.id === n.id ? { ...n, x: localPos.x, y: localPos.y } : n,
  );

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-auto bg-grid select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect(null);
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("application/x-hypero-node")) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={(e) => {
        const raw = e.dataTransfer.getData("application/x-hypero-node");
        if (!raw) return;
        e.preventDefault();
        const pt = getCanvasPoint(e);
        onCreate(
          raw as NodeType,
          Math.max(0, Math.min(CANVAS_W - NODE_W, pt.x - NODE_W / 2)),
          Math.max(0, Math.min(CANVAS_H - NODE_H, pt.y - NODE_H / 2)),
        );
      }}
    >
      <div
        className="relative"
        style={{ width: CANVAS_W, height: CANVAS_H }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        {/* Edges + transient connection */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={CANVAS_W}
          height={CANVAS_H}
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M 0 1 L 8 5 L 0 9 z"
                fill="rgb(var(--border-strong))"
              />
            </marker>
            <marker
              id="arrow-active"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="rgb(var(--gradient-via))" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const a = resolvedNodes.find((n) => n.id === edge.from);
            const b = resolvedNodes.find((n) => n.id === edge.to);
            if (!a || !b) return null;
            const { outX, outY } = getPorts(a);
            const { inX, inY } = getPorts(b);
            const active =
              activeStepNodeId !== null &&
              (edge.from === activeStepNodeId || edge.to === activeStepNodeId);
            const isHover = hoverEdge === edge.id;
            return (
              <g key={edge.id} className="pointer-events-auto">
                {/* Wider invisible path for easier hover */}
                <path
                  d={edgePath(outX, outY, inX, inY)}
                  stroke="transparent"
                  strokeWidth={14}
                  fill="none"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverEdge(edge.id)}
                  onMouseLeave={() =>
                    setHoverEdge((id) => (id === edge.id ? null : id))
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEdge(edge.id);
                  }}
                />
                <path
                  d={edgePath(outX, outY, inX, inY)}
                  stroke={
                    active
                      ? "rgb(var(--gradient-via))"
                      : isHover
                        ? "rgb(var(--foreground))"
                        : "rgb(var(--border-strong))"
                  }
                  strokeWidth={active ? 2.2 : 1.6}
                  fill="none"
                  markerEnd={
                    active ? "url(#arrow-active)" : "url(#arrow)"
                  }
                />
                {active ? (
                  <motion.circle
                    r={3.5}
                    fill="rgb(var(--gradient-via))"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    style={{
                      offsetPath: `path("${edgePath(outX, outY, inX, inY)}")`,
                    }}
                  />
                ) : null}
              </g>
            );
          })}

          {drag.kind === "connect"
            ? (() => {
                const from = resolvedNodes.find((n) => n.id === drag.from);
                if (!from) return null;
                const { outX, outY } = getPorts(from);
                return (
                  <path
                    d={edgePath(outX, outY, drag.x, drag.y)}
                    stroke="rgb(var(--gradient-via))"
                    strokeWidth={1.8}
                    strokeDasharray="5 4"
                    fill="none"
                  />
                );
              })()
            : null}
        </svg>

        {/* Nodes */}
        {resolvedNodes.map((node) => {
          const meta = NODE_META[node.type];
          const Icon = meta.icon;
          const selected = node.id === selectedNodeId;
          const active = node.id === activeStepNodeId;
          return (
            <div
              key={node.id}
              data-node-id={node.id}
              className={cn(
                "absolute flex flex-col rounded-xl border bg-card shadow-sm transition-shadow",
                "cursor-grab active:cursor-grabbing",
                selected
                  ? "border-foreground ring-2 ring-foreground/20 shadow-lg"
                  : "border-border hover:border-foreground/40",
                active && "ring-2 ring-violet-500/40",
              )}
              style={{
                left: node.x,
                top: node.y,
                width: NODE_W,
                height: NODE_H,
                touchAction: "none",
              }}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                if ((e.target as HTMLElement).dataset.role === "port") return;
                if ((e.target as HTMLElement).dataset.role === "delete") return;
                e.stopPropagation();
                onSelect(node.id);
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const pt = {
                  x:
                    e.clientX -
                    rect.left +
                    (canvasRef.current?.scrollLeft ?? 0),
                  y:
                    e.clientY -
                    rect.top +
                    (canvasRef.current?.scrollTop ?? 0),
                };
                setDrag({
                  kind: "node",
                  nodeId: node.id,
                  offsetX: pt.x - node.x,
                  offsetY: pt.y - node.y,
                });
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(node.id);
              }}
            >
              {/* Input port */}
              <span
                data-role="port"
                className="absolute -left-2 top-1/2 -translate-y-1/2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background"
                title="Input"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              </span>

              {/* Output port (draggable) */}
              <button
                type="button"
                data-role="port"
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  e.stopPropagation();
                  e.preventDefault();
                  const pt = (() => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return { x: 0, y: 0 };
                    return {
                      x:
                        e.clientX -
                        rect.left +
                        (canvasRef.current?.scrollLeft ?? 0),
                      y:
                        e.clientY -
                        rect.top +
                        (canvasRef.current?.scrollTop ?? 0),
                    };
                  })();
                  setDrag({
                    kind: "connect",
                    from: node.id,
                    x: pt.x,
                    y: pt.y,
                    hoverNodeId: null,
                  });
                }}
                className={cn(
                  "absolute -right-2 top-1/2 -translate-y-1/2 inline-flex h-4 w-4 items-center justify-center rounded-full border bg-background",
                  "transition-colors hover:scale-110",
                  "border-border hover:border-foreground",
                )}
                aria-label="Drag to connect"
                title="Drag to connect"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              </button>

              <div className="flex items-start gap-2.5 px-3 pt-2.5">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                    meta.accent,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="block truncate text-[13px] font-medium text-foreground">
                      {node.label}
                    </span>
                  </div>
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                    {meta.label}
                  </span>
                </div>
                {selected ? (
                  <button
                    type="button"
                    data-role="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                      onSelect(null);
                    }}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Delete node"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
              <div className="mt-1 flex items-center gap-1.5 px-3 pb-2.5 text-[10px] text-muted-foreground">
                <ChevronDown className="h-3 w-3" />
                <span className="truncate font-mono">
                  {summarizeConfig(node)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {nodes.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto max-w-sm rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center backdrop-blur">
              <p className="text-sm font-medium text-foreground">
                Drop nodes here to start building
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag from the palette on the left, or use the AI prompt above
                to scaffold a workflow.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function summarizeConfig(node: ProjectNode) {
  const c = node.config;
  switch (node.type) {
    case "trigger":
      return c.triggerType === "schedule"
        ? `schedule · ${c.cron ?? "0 9 * * *"}`
        : c.triggerType ?? "webhook";
    case "llm":
      return c.model ?? "hypero-1";
    case "http":
      return `${c.method ?? "GET"} ${c.url ?? "—"}`;
    case "condition":
      return c.expression ?? "—";
    case "transform":
      return c.expression ?? "—";
    case "database":
      return c.table ?? "—";
    case "slack":
      return c.channel ?? "—";
    case "output":
      return c.destination ?? "—";
  }
}
