"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minus,
  MousePointer2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GRID, NODE_H, NODE_META, NODE_W } from "./constants";
import { NodeIcon } from "./node-icon";
import {
  NODE_CATEGORY,
  type Edge,
  type NodeKind,
  type Workflow,
  type WorkflowNode,
} from "./types";

/**
 * Pannable, zoomable workflow canvas.
 *
 * The canvas is a "limitless graph" — every node coordinate lives in *world
 * space*, and a single transformed layer (`translate(x, y) scale(s)`) maps
 * the world onto the visible viewport. Input handlers convert mouse client
 * coords back to world coords so dragging nodes, connecting edges, and
 * dropping from the palette all feel consistent at any zoom level.
 *
 * Controls:
 *   - Drag empty space → pan
 *   - Wheel             → pan (trackpad two-finger)
 *   - Ctrl/Cmd + wheel  → zoom around cursor
 *   - +, −, 100%, fit   → toolbar buttons
 *   - Backspace         → delete selected node
 */

const CATEGORY_TONE: Record<string, string> = {
  trigger:
    "border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-500/5",
  ai: "border-violet-500/40 dark:border-violet-500/30 bg-violet-500/5",
  logic: "border-amber-500/40 dark:border-amber-500/30 bg-amber-500/5",
  action: "border-sky-500/40 dark:border-sky-500/30 bg-sky-500/5",
};

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;
const PAN_DRAG_THRESHOLD = 4;

type Viewport = { x: number; y: number; scale: number };

export type CanvasProps = {
  workflow: Workflow;
  selectedId: string | null;
  draftEdge: { fromId: string; x: number; y: number } | null;
  runningNodeId: string | null;
  finishedNodeIds: Set<string>;
  onSelectNode: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onStartConnect: (id: string, worldX: number, worldY: number) => void;
  onUpdateDraft: (worldX: number, worldY: number) => void;
  onCompleteConnect: (toId: string | null) => void;
  /** Called when a palette item is dropped onto the canvas. World coords. */
  onAddNode: (kind: NodeKind, worldX: number, worldY: number) => void;
};

function snap(v: number) {
  return Math.round(v / GRID) * GRID;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function port(node: WorkflowNode, side: "left" | "right") {
  return {
    x: side === "right" ? node.x + NODE_W : node.x,
    y: node.y + NODE_H / 2,
  };
}

function edgePath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function Canvas({
  workflow,
  selectedId,
  draftEdge,
  runningNodeId,
  finishedNodeIds,
  onSelectNode,
  onMoveNode,
  onDeleteNode,
  onDeleteEdge,
  onStartConnect,
  onUpdateDraft,
  onCompleteConnect,
  onAddNode,
}: CanvasProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = React.useState<Viewport>({
    x: 0,
    y: 0,
    scale: 1,
  });

  // Active gesture state. Refs are the right tool here — the gesture is a
  // mouse-driven side effect, not React-rendered state.
  const dragNodeRef = React.useRef<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const panRef = React.useRef<{
    startClientX: number;
    startClientY: number;
    startVx: number;
    startVy: number;
    moved: boolean;
  } | null>(null);
  // Carries the "did this gesture pan?" flag from mouseup to the trailing
  // click, since panRef is already cleared by the time click fires.
  const panMovedRef = React.useRef(false);

  const screenToWorld = React.useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      return {
        x: (cx - viewport.x) / viewport.scale,
        y: (cy - viewport.y) / viewport.scale,
      };
    },
    [viewport.x, viewport.y, viewport.scale],
  );

  // ----- Wheel handling --------------------------------------------------
  // We attach via ref + addEventListener so we can call preventDefault on
  // wheel events (React's wheel handler is passive in modern React).
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      const isZoom = e.ctrlKey || e.metaKey;
      e.preventDefault();
      if (isZoom) {
        const rect = node.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        setViewport((v) => {
          const factor = Math.exp(-e.deltaY * 0.0015);
          const nextScale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
          // Keep the world point under the cursor stationary on screen.
          const wx = (cx - v.x) / v.scale;
          const wy = (cy - v.y) / v.scale;
          return {
            x: cx - wx * nextScale,
            y: cy - wy * nextScale,
            scale: nextScale,
          };
        });
      } else {
        setViewport((v) => ({
          ...v,
          x: v.x - e.deltaX,
          y: v.y - e.deltaY,
        }));
      }
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  // ----- Touch (Android / iOS) -------------------------------------------
  // One-finger drag on empty canvas pans the world. Two fingers pinch-zoom
  // around the gesture's centroid. Touches that originate on a node/edge
  // bubble up untouched so node drag/connect still work.
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let panStart:
      | { clientX: number; clientY: number; vx: number; vy: number; moved: boolean }
      | null = null;
    let pinchStart:
      | { distance: number; cx: number; cy: number; vx: number; vy: number; vScale: number }
      | null = null;

    function distance(a: Touch, b: Touch) {
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }
    function midpoint(a: Touch, b: Touch, rect: DOMRect) {
      return {
        cx: (a.clientX + b.clientX) / 2 - rect.left,
        cy: (a.clientY + b.clientY) / 2 - rect.top,
      };
    }

    const onTouchStart = (e: TouchEvent) => {
      // Don't hijack touches that started on nodes / toolbar / etc.
      if (e.target !== node) return;
      const rect = node.getBoundingClientRect();
      if (e.touches.length === 1) {
        const t = e.touches[0]!;
        setViewport((v) => {
          panStart = {
            clientX: t.clientX,
            clientY: t.clientY,
            vx: v.x,
            vy: v.y,
            moved: false,
          };
          return v;
        });
      } else if (e.touches.length === 2) {
        e.preventDefault();
        panStart = null;
        const a = e.touches[0]!;
        const b = e.touches[1]!;
        const { cx, cy } = midpoint(a, b, rect);
        setViewport((v) => {
          pinchStart = {
            distance: distance(a, b),
            cx,
            cy,
            vx: v.x,
            vy: v.y,
            vScale: v.scale,
          };
          return v;
        });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const rect = node.getBoundingClientRect();
      if (e.touches.length === 2 && pinchStart) {
        e.preventDefault();
        const a = e.touches[0]!;
        const b = e.touches[1]!;
        const dist = distance(a, b);
        const factor = dist / pinchStart.distance;
        const nextScale = clamp(
          pinchStart.vScale * factor,
          MIN_SCALE,
          MAX_SCALE,
        );
        // World-point under the gesture centroid stays put.
        const wx = (pinchStart.cx - pinchStart.vx) / pinchStart.vScale;
        const wy = (pinchStart.cy - pinchStart.vy) / pinchStart.vScale;
        setViewport({
          x: pinchStart.cx - wx * nextScale,
          y: pinchStart.cy - wy * nextScale,
          scale: nextScale,
        });
        return;
      }
      if (e.touches.length === 1 && panStart) {
        const t = e.touches[0]!;
        const dx = t.clientX - panStart.clientX;
        const dy = t.clientY - panStart.clientY;
        if (!panStart.moved && Math.hypot(dx, dy) > PAN_DRAG_THRESHOLD) {
          panStart.moved = true;
        }
        if (panStart.moved) {
          e.preventDefault();
          setViewport((v) => ({
            ...v,
            x: panStart!.vx + dx,
            y: panStart!.vy + dy,
          }));
        }
      }
    };

    const onTouchEnd = () => {
      panStart = null;
      pinchStart = null;
    };

    node.addEventListener("touchstart", onTouchStart, { passive: false });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    node.addEventListener("touchend", onTouchEnd);
    node.addEventListener("touchcancel", onTouchEnd);
    return () => {
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  // ----- Mouse handling --------------------------------------------------
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start panning on empty canvas (clicks on nodes/edges/buttons stop
    // propagation themselves).
    if (e.target !== e.currentTarget) return;
    panRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startVx: viewport.x,
      startVy: viewport.y,
      moved: false,
    };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Node drag — write raw world coords on every frame and snap only on
    // release. Snapping mid-drag makes the node feel sticky / steppy.
    if (dragNodeRef.current) {
      const { nodeId, offsetX, offsetY } = dragNodeRef.current;
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      onMoveNode(nodeId, x - offsetX, y - offsetY);
      return;
    }
    // Pan.
    if (panRef.current) {
      const dx = e.clientX - panRef.current.startClientX;
      const dy = e.clientY - panRef.current.startClientY;
      if (
        !panRef.current.moved &&
        Math.hypot(dx, dy) > PAN_DRAG_THRESHOLD
      ) {
        panRef.current.moved = true;
      }
      if (panRef.current.moved) {
        setViewport((v) => ({
          ...v,
          x: panRef.current!.startVx + dx,
          y: panRef.current!.startVy + dy,
        }));
      }
    }
    // Live draft edge.
    if (draftEdge) {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      onUpdateDraft(x, y);
    }
  };

  const onMouseUp = () => {
    // Snap-to-grid on release so the node settles to a clean position
    // without fighting the cursor mid-drag.
    if (dragNodeRef.current) {
      const dragged = workflow.nodes.find(
        (n) => n.id === dragNodeRef.current!.nodeId,
      );
      if (dragged) {
        onMoveNode(dragged.id, snap(dragged.x), snap(dragged.y));
      }
    }
    dragNodeRef.current = null;
    if (draftEdge) onCompleteConnect(null);
    // Remember whether this gesture actually moved so the trailing click
    // (which fires after mouseup, once panRef is cleared) can tell a pan
    // apart from a plain click-to-deselect.
    panMovedRef.current = panRef.current?.moved ?? false;
    panRef.current = null;
  };

  // Treat a non-moved mousedown→mouseup on empty canvas as deselect.
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (panMovedRef.current) {
      panMovedRef.current = false;
      return;
    }
    onSelectNode(null);
  };

  // Drag-and-drop from the palette.
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("application/x-hypero-node")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const kind = e.dataTransfer.getData(
      "application/x-hypero-node",
    ) as NodeKind | "";
    if (!kind) return;
    e.preventDefault();
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    // Drop the node so its centre lands under the cursor.
    onAddNode(kind, snap(x - NODE_W / 2), snap(y - NODE_H / 2));
  };

  // Keyboard delete for selected node.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedId) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteNode(selectedId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, onDeleteNode]);

  // ----- Toolbar actions -------------------------------------------------
  const zoomBy = (factor: number) => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setViewport((v) => {
      const nextScale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
      const wx = (cx - v.x) / v.scale;
      const wy = (cy - v.y) / v.scale;
      return {
        x: cx - wx * nextScale,
        y: cy - wy * nextScale,
        scale: nextScale,
      };
    });
  };

  const resetZoom = () => setViewport({ x: 0, y: 0, scale: 1 });

  const fitToView = () => {
    const node = containerRef.current;
    if (!node) return;
    if (workflow.nodes.length === 0) {
      resetZoom();
      return;
    }
    const padding = 60;
    const minX = Math.min(...workflow.nodes.map((n) => n.x));
    const minY = Math.min(...workflow.nodes.map((n) => n.y));
    const maxX = Math.max(...workflow.nodes.map((n) => n.x + NODE_W));
    const maxY = Math.max(...workflow.nodes.map((n) => n.y + NODE_H));
    const w = maxX - minX;
    const h = maxY - minY;
    const rect = node.getBoundingClientRect();
    const availW = rect.width - padding * 2;
    const availH = rect.height - padding * 2;
    const scale = clamp(
      Math.min(availW / w, availH / h, 1),
      MIN_SCALE,
      MAX_SCALE,
    );
    const x = (rect.width - w * scale) / 2 - minX * scale;
    const y = (rect.height - h * scale) / 2 - minY * scale;
    setViewport({ x, y, scale });
  };

  // ----- Render ----------------------------------------------------------
  // The dotted-grid background pans and scales with the viewport so the
  // canvas reads as a true infinite plane. We compute background position
  // in client units so it stays anchored to world coordinates.
  const dotSize = 24 * viewport.scale;
  const gridStyle: React.CSSProperties = {
    backgroundImage:
      "radial-gradient(circle at 1px 1px, rgb(var(--grid) / 0.85) 1px, transparent 0)",
    backgroundSize: `${dotSize}px ${dotSize}px`,
    backgroundPosition: `${viewport.x}px ${viewport.y}px`,
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={gridStyle}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl border border-border bg-card",
        panRef.current?.moved ? "cursor-grabbing" : "cursor-grab",
      )}
      role="region"
      aria-label="Workflow canvas"
    >
      {/* World layer — translate + scale all child content in one go. */}
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
        }}
      >
        {/* Edges. The SVG is sized to a comfortably large fixed footprint
            and uses overflow:visible so paths render past its bounds when
            the user scrolls into far-away regions of the world. */}
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={20000}
          height={20000}
          style={{ overflow: "visible" }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="rgb(var(--border-strong))"
              />
            </marker>
          </defs>
          {workflow.edges.map((edge) => (
            <EdgeView
              key={edge.id}
              edge={edge}
              workflow={workflow}
              isLive={
                !!runningNodeId &&
                (edge.from === runningNodeId || edge.to === runningNodeId)
              }
              onDelete={() => onDeleteEdge(edge.id)}
            />
          ))}
          {draftEdge ? (
            <DraftEdge
              workflow={workflow}
              fromId={draftEdge.fromId}
              x={draftEdge.x}
              y={draftEdge.y}
            />
          ) : null}
        </svg>

        {/* Nodes. Wrapped in a pointer-events:auto group so canvas-level
            handlers below still receive mousedowns when clicking empty
            world space (the world layer itself is pointer-events:none). */}
        <div className="pointer-events-auto">
          {workflow.nodes.map((node) => (
            <NodeView
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              running={runningNodeId === node.id}
              done={finishedNodeIds.has(node.id)}
              onSelect={() => onSelectNode(node.id)}
              onMouseDown={(e) => {
                e.stopPropagation();
                const { x, y } = screenToWorld(e.clientX, e.clientY);
                dragNodeRef.current = {
                  nodeId: node.id,
                  offsetX: x - node.x,
                  offsetY: y - node.y,
                };
                onSelectNode(node.id);
              }}
              onStartConnect={(e) => {
                e.stopPropagation();
                const { x, y } = screenToWorld(e.clientX, e.clientY);
                onStartConnect(node.id, x, y);
              }}
              onCompleteConnect={() => {
                if (draftEdge) onCompleteConnect(node.id);
              }}
            />
          ))}
        </div>
      </div>

      {/* Empty-state hint, anchored to viewport (not world). */}
      {workflow.nodes.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-dashed border-border bg-background/60 px-6 py-5 text-center backdrop-blur">
            <p className="text-sm font-medium text-foreground">
              Drag a node from the palette
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Or load a template above to get started.
            </p>
          </div>
        </div>
      ) : null}

      {/* Zoom toolbar */}
      <div className="pointer-events-auto absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm backdrop-blur">
        <ToolbarButton
          label="Zoom out"
          onClick={(e) => {
            e.stopPropagation();
            zoomBy(0.8);
          }}
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetZoom();
          }}
          className="inline-flex h-7 min-w-[3.5rem] items-center justify-center rounded-full px-2 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          {Math.round(viewport.scale * 100)}%
        </button>
        <ToolbarButton
          label="Zoom in"
          onClick={(e) => {
            e.stopPropagation();
            zoomBy(1.25);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="Fit to view"
          onClick={(e) => {
            e.stopPropagation();
            fitToView();
          }}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Hints */}
      <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-2 rounded-full border border-border bg-card/80 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur md:inline-flex">
        <MousePointer2 className="h-3 w-3" />
        <span>drag empty space to pan · ⌘ + scroll to zoom</span>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function EdgeView({
  edge,
  workflow,
  isLive,
  onDelete,
}: {
  edge: Edge;
  workflow: Workflow;
  isLive: boolean;
  onDelete: () => void;
}) {
  const from = workflow.nodes.find((n) => n.id === edge.from);
  const to = workflow.nodes.find((n) => n.id === edge.to);
  if (!from || !to) return null;
  const a = port(from, "right");
  const b = port(to, "left");
  const d = edgePath(a.x, a.y, b.x, b.y);
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  return (
    <g className="pointer-events-auto">
      <path d={d} stroke="transparent" strokeWidth={14} fill="none" />
      <path
        d={d}
        stroke="rgb(var(--border-strong))"
        strokeWidth={1.6}
        fill="none"
        markerEnd="url(#arrow)"
      />
      {isLive ? (
        <motion.circle
          r={3.5}
          fill="rgb(var(--gradient-via))"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ offsetPath: `path("${d}")` }}
        />
      ) : null}
      <foreignObject
        x={midX - 10}
        y={midY - 10}
        width={20}
        height={20}
        className="pointer-events-auto"
      >
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete edge"
          className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </foreignObject>
    </g>
  );
}

function DraftEdge({
  workflow,
  fromId,
  x,
  y,
}: {
  workflow: Workflow;
  fromId: string;
  x: number;
  y: number;
}) {
  const from = workflow.nodes.find((n) => n.id === fromId);
  if (!from) return null;
  const a = port(from, "right");
  const d = edgePath(a.x, a.y, x, y);
  return (
    <path
      d={d}
      stroke="rgb(var(--gradient-via))"
      strokeWidth={1.6}
      strokeDasharray="4 4"
      fill="none"
    />
  );
}

function NodeView({
  node,
  selected,
  running,
  done,
  onSelect,
  onMouseDown,
  onStartConnect,
  onCompleteConnect,
}: {
  node: WorkflowNode;
  selected: boolean;
  running: boolean;
  done: boolean;
  onSelect: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartConnect: (e: React.MouseEvent) => void;
  onCompleteConnect: () => void;
}) {
  const category = NODE_CATEGORY[node.kind];
  const tone = CATEGORY_TONE[category] ?? CATEGORY_TONE.action;
  const meta = NODE_META[node.kind];

  // Drag feel: position the node with `transform: translate3d` rather than
  // `left/top` so the browser can promote it to its own compositor layer
  // and updates don't trigger layout. Box-shadow transitions are CSS-only —
  // routing them through framer-motion's `animate` prop introduced visible
  // lag during drags because every workflow update re-spawned a transition.
  const ringShadow = running
    ? "0 0 0 3px rgb(var(--gradient-via) / 0.35)"
    : selected
      ? "0 0 0 2px rgb(var(--foreground) / 0.55)"
      : "0 1px 2px rgb(0 0 0 / 0.05)";

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseUp={onCompleteConnect}
      style={{
        width: NODE_W,
        height: NODE_H,
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        boxShadow: ringShadow,
        // Hint to the compositor that the node will animate frequently.
        willChange: "transform",
        transition: "box-shadow 150ms ease-out",
      }}
      className={cn(
        "absolute left-0 top-0 cursor-grab select-none rounded-xl border bg-card",
        tone,
      )}
      role="button"
      tabIndex={0}
      aria-label={`${meta.label} node: ${node.label}`}
      aria-pressed={selected}
    >
      <div className="flex h-full items-center gap-3 px-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/80 text-foreground backdrop-blur">
          <NodeIcon kind={node.kind} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>{meta.label}</span>
            <AnimatePresence>
              {running ? (
                <motion.span
                  key="running"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[9px] text-foreground"
                >
                  <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
                  running
                </motion.span>
              ) : done ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-400"
                >
                  ok
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
          <p className="truncate text-[13px] font-medium text-foreground">
            {node.label}
          </p>
        </div>
      </div>

      <span
        aria-hidden
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="block h-3 w-3 rounded-full border border-border bg-background" />
      </span>
      <button
        type="button"
        onMouseDown={onStartConnect}
        aria-label="Connect output"
        className="absolute right-0 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        <span className="block h-2 w-2 rounded-full bg-current" />
      </button>

      {selected ? (
        <div className="pointer-events-none absolute -top-2 -right-2 inline-flex h-5 items-center gap-1 rounded-full border border-border bg-background px-1.5 text-[10px] text-muted-foreground">
          <Trash2 className="h-3 w-3" />
          <span className="font-mono">⌫</span>
        </div>
      ) : null}
    </div>
  );
}
