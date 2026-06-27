"use client";

import * as React from "react";
import {
  Download,
  FileCode2,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Canvas } from "./canvas";
import { Inspector } from "./inspector";
import { Palette } from "./palette";
import { RunLog } from "./run-log";
import { NODE_META, STORAGE_KEY } from "./constants";
import { TEMPLATES } from "./templates";
import type {
  Edge,
  NodeKind,
  RunState,
  Workflow,
  WorkflowNode,
} from "./types";
import { runWorkflow } from "./runner";

/** Generate a short, URL-safe id. Plenty for client-only state. */
function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Look up a template by id and produce a fresh Workflow from its builder. */
function buildTemplate(id: string): Workflow {
  const t = TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
  return t.build();
}

/**
 * Stable, deterministic seed used during SSR and the first client render so
 * server and client output match exactly. Real data — random ids, persisted
 * draft — is swapped in inside `useEffect` after hydration.
 */
const INITIAL_WORKFLOW: Workflow = {
  id: "wf_initial",
  name: "Untitled workflow",
  nodes: [],
  edges: [],
};

/** Validate a workflow loaded from storage. Drops nodes whose kind we no
 * longer support (e.g. after a schema change) and edges that reference
 * missing nodes, so a stale draft can never crash the studio. */
function sanitizeWorkflow(input: unknown): Workflow | null {
  if (!input || typeof input !== "object") return null;
  const wf = input as Partial<Workflow>;
  if (typeof wf.id !== "string" || typeof wf.name !== "string") return null;
  if (!Array.isArray(wf.nodes) || !Array.isArray(wf.edges)) return null;
  const validKinds = new Set(Object.keys(NODE_META));
  const nodes: WorkflowNode[] = [];
  for (const raw of wf.nodes as WorkflowNode[]) {
    if (!raw || typeof raw !== "object") continue;
    if (typeof raw.id !== "string") continue;
    if (!validKinds.has(raw.kind as string)) continue;
    if (typeof raw.x !== "number" || typeof raw.y !== "number") continue;
    nodes.push({
      ...raw,
      label: typeof raw.label === "string" ? raw.label : NODE_META[raw.kind].label,
      // Re-merge default config so nodes saved before a schema bump keep
      // working: existing keys win, missing keys fall back to defaults.
      config: {
        ...(NODE_META[raw.kind].defaultConfig as object),
        ...(raw.config as object),
      } as WorkflowNode["config"],
    });
  }
  const ids = new Set(nodes.map((n) => n.id));
  const edges: Edge[] = [];
  for (const raw of wf.edges as Edge[]) {
    if (!raw || typeof raw.id !== "string") continue;
    if (!ids.has(raw.from) || !ids.has(raw.to)) continue;
    edges.push({ id: raw.id, from: raw.from, to: raw.to });
  }
  return { id: wf.id, name: wf.name, nodes, edges };
}

function loadFromStorage(): Workflow {
  if (typeof window === "undefined") return buildTemplate("lead-router");
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildTemplate("lead-router");
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeWorkflow(parsed) ?? buildTemplate("lead-router");
  } catch {
    return buildTemplate("lead-router");
  }
}

export default function StudioPage() {
  // Render the deterministic seed during SSR / first paint to avoid a
  // hydration mismatch (templates use random ids). The real workflow is
  // swapped in by the effect below.
  const [workflow, setWorkflow] = React.useState<Workflow>(INITIAL_WORKFLOW);
  const [hydrated, setHydrated] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [run, setRun] = React.useState<RunState>({
    status: "idle",
    steps: [],
  });
  const abortRef = React.useRef<AbortController | null>(null);

  // Tracks an in-progress edge being drawn from a node's output port. We keep
  // the cursor position so the canvas can render the bezier draft edge live.
  const [draftEdge, setDraftEdge] = React.useState<{
    fromId: string;
    x: number;
    y: number;
  } | null>(null);

  // Hydrate from localStorage after mount. Server output stays deterministic;
  // the visual swap to the real workflow happens just after first paint.
  React.useEffect(() => {
    setWorkflow(loadFromStorage());
    setHydrated(true);
  }, []);

  // Autosave changes to localStorage once hydrated. Skipping the very first
  // render avoids overwriting a saved draft with the initial seed value.
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
    } catch {
      // Storage might be full or blocked; non-fatal.
    }
  }, [workflow, hydrated]);

  // Make sure any pending run is cancelled when this page unmounts. Without
  // this, navigating away mid-run leaves the runner pushing setState calls
  // into a stale React tree, which surfaces as a console error.
  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const selectedNode =
    workflow.nodes.find((n) => n.id === selectedId) ?? null;

  const runningNodeId = React.useMemo(() => {
    const last = run.steps[run.steps.length - 1];
    return last && last.status === "running" ? last.nodeId : null;
  }, [run.steps]);

  const finishedNodeIds = React.useMemo(() => {
    const s = new Set<string>();
    for (const step of run.steps)
      if (step.status === "success") s.add(step.nodeId);
    return s;
  }, [run.steps]);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  function addNode(kind: NodeKind, x?: number, y?: number) {
    const meta = NODE_META[kind];
    const node: WorkflowNode = {
      id: uid("n"),
      kind,
      label: meta.label,
      x: x ?? 240,
      y: y ?? 192,
      // Clone the typed default config so each node owns its own copy.
      config: structuredClone(meta.defaultConfig) as WorkflowNode["config"],
    };
    setWorkflow((w) => ({ ...w, nodes: [...w.nodes, node] }));
    setSelectedId(node.id);
  }

  function moveNode(id: string, x: number, y: number) {
    setWorkflow((w) => ({
      ...w,
      nodes: w.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }));
  }

  function deleteNode(id: string) {
    setWorkflow((w) => ({
      ...w,
      nodes: w.nodes.filter((n) => n.id !== id),
      edges: w.edges.filter((e) => e.from !== id && e.to !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  }

  function deleteEdge(id: string) {
    setWorkflow((w) => ({
      ...w,
      edges: w.edges.filter((e) => e.id !== id),
    }));
  }

  function changeNodeLabel(id: string, label: string) {
    setWorkflow((w) => ({
      ...w,
      nodes: w.nodes.map((n) => (n.id === id ? { ...n, label } : n)),
    }));
  }

  function changeNodeConfig(
    id: string,
    key: string,
    value: string | string[],
  ) {
    setWorkflow((w) => ({
      ...w,
      nodes: w.nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              config: {
                ...(n.config as Record<string, unknown>),
                [key]: value,
              } as WorkflowNode["config"],
            }
          : n,
      ),
    }));
  }

  function loadTemplate(id: string) {
    setWorkflow(buildTemplate(id));
    setSelectedId(null);
    setRun({ status: "idle", steps: [] });
  }

  function clearCanvas() {
    setWorkflow({
      id: uid("wf"),
      name: "Untitled workflow",
      nodes: [],
      edges: [],
    });
    setSelectedId(null);
    setRun({ status: "idle", steps: [] });
  }

  // ─── Edge wiring ───────────────────────────────────────────────────────────

  function startConnect(fromId: string, x: number, y: number) {
    setDraftEdge({ fromId, x, y });
  }

  function updateDraft(x: number, y: number) {
    setDraftEdge((d) => (d ? { ...d, x, y } : d));
  }

  function completeConnect(toId: string | null) {
    setDraftEdge((d) => {
      if (d && toId && toId !== d.fromId) {
        setWorkflow((w) => {
          if (w.edges.some((e) => e.from === d.fromId && e.to === toId)) {
            return w;
          }
          const edge: Edge = { id: uid("e"), from: d.fromId, to: toId };
          return { ...w, edges: [...w.edges, edge] };
        });
      }
      return null;
    });
  }

  // ─── Drag-drop new nodes from palette ──────────────────────────────────────
  // The canvas now owns drop coordinate translation (it knows about pan and
  // zoom). All we expose is `addNode(kind, worldX, worldY)`.

  // ─── Run simulation ────────────────────────────────────────────────────────

  async function handleRun() {
    if (run.status === "running") {
      abortRef.current?.abort();
      setRun((r) => ({ ...r, status: "idle" }));
      return;
    }
    if (workflow.nodes.length === 0) return;
    const controller = new AbortController();
    abortRef.current = controller;

    setRun({ status: "running", steps: [], startedAt: Date.now() });

    try {
      await runWorkflow(
        workflow,
        ({ step }) => {
          setRun((prev) => {
            // Replace the latest step for the same node, otherwise append.
            const last = prev.steps[prev.steps.length - 1];
            if (last && last.nodeId === step.nodeId) {
              return { ...prev, steps: [...prev.steps.slice(0, -1), step] };
            }
            return { ...prev, steps: [...prev.steps, step] };
          });
        },
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setRun((prev) => ({
          ...prev,
          status: prev.steps.some((s) => s.status === "error")
            ? "error"
            : "success",
          finishedAt: Date.now(),
        }));
      }
    } catch {
      setRun((prev) => ({ ...prev, status: "error" }));
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(workflow.name || "workflow")
      .replace(/\s+/g, "-")
      .toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="studio-root flex min-h-[calc(100vh-9rem)] w-full flex-col">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Badge variant="outline" className="hidden sm:inline-flex">
            <Sparkles className="h-3 w-3" />
            Studio
          </Badge>
          <input
            value={workflow.name}
            onChange={(e) =>
              setWorkflow((w) => ({ ...w, name: e.target.value }))
            }
            className="min-w-0 flex-1 truncate rounded-md bg-transparent px-1 py-1 text-sm font-medium text-foreground focus:bg-accent focus:outline-none"
            aria-label="Workflow name"
          />
          <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
            {workflow.nodes.length} nodes · {workflow.edges.length} edges
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden md:flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadTemplate(t.id)}
                className="inline-flex h-7 items-center rounded-full px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title={t.description}
              >
                <FileCode2 className="mr-1.5 h-3 w-3" />
                {t.name}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={workflow.nodes.length === 0}
          >
            {run.status === "running" ? (
              <>
                <Square className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Workspace */}
      <div className="grid min-h-[600px] flex-1 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        {/* Palette */}
        <aside className="hidden border-r border-border bg-card lg:block">
          <Palette onAdd={(kind) => addNode(kind)} />
        </aside>

        {/* Canvas */}
        <main className="relative min-h-0 p-3">
          <Canvas
            workflow={workflow}
            selectedId={selectedId}
            draftEdge={draftEdge}
            runningNodeId={runningNodeId}
            finishedNodeIds={finishedNodeIds}
            onSelectNode={setSelectedId}
            onMoveNode={moveNode}
            onDeleteNode={deleteNode}
            onDeleteEdge={deleteEdge}
            onStartConnect={startConnect}
            onUpdateDraft={updateDraft}
            onCompleteConnect={completeConnect}
            onAddNode={addNode}
          />

          {/* Empty-state CTA: only render when canvas is empty. */}
          {workflow.nodes.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
              <div className="pointer-events-auto max-w-sm rounded-2xl border border-border bg-card/90 p-6 text-center shadow-sm backdrop-blur">
                <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-accent text-foreground">
                  <Wand2 className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">
                  Build your first workflow
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Drag a node from the palette, connect them by dragging
                  between ports, then hit Run to simulate.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {TEMPLATES.filter((t) => t.id !== "blank").map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => loadTemplate(t.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-foreground transition-colors hover:bg-accent"
                    >
                      <FileCode2 className="h-3 w-3" />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Mobile palette via a native disclosure. Avoids extra deps. */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:hidden">
            <details className="group relative">
              <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm">
                <Plus className="h-4 w-4" />
                Add node
              </summary>
              <div className="absolute bottom-12 left-1/2 max-h-[60vh] w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <Palette onAdd={(kind) => addNode(kind)} />
              </div>
            </details>
          </div>
        </main>

        {/* Right: inspector + run log */}
        <aside className="hidden border-l border-border bg-card lg:flex lg:flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">
            <Inspector
              node={selectedNode}
              onChangeLabel={(label) =>
                selectedNode && changeNodeLabel(selectedNode.id, label)
              }
              onChangeConfig={(key, value) =>
                selectedNode && changeNodeConfig(selectedNode.id, key, value)
              }
              onDelete={() => selectedNode && deleteNode(selectedNode.id)}
              onClose={() => setSelectedId(null)}
            />
          </div>
          <div className="h-72 min-h-0 border-t border-border">
            <RunLog run={run} />
          </div>
        </aside>
      </div>
    </div>
  );
}
