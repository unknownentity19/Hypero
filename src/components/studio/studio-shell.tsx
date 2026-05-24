"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  Play,
  Sparkles,
} from "lucide-react";
import {
  appendRun,
  applyGeneratedGraph,
  createEdge,
  createNodeOnProject,
  deleteEdge,
  deleteNode,
  generateGraphFromPrompt,
  moveNode,
  simulateRun,
  updateNode,
  updateProject,
  useProject,
} from "@/lib/projects";
import type { NodeType, ProjectNode, RunLog } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Canvas } from "./canvas";
import { Inspector } from "./inspector";
import { NodePalette } from "./node-palette";
import { RunLogPanel } from "./run-log";
import { cn } from "@/lib/utils";

const NODE_W = 196;
const NODE_H = 70;

export function StudioShell({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { project, ready } = useProject(projectId);

  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [renaming, setRenaming] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [runLog, setRunLog] = React.useState<RunLog | null>(null);
  const [activeStepIndex, setActiveStepIndex] = React.useState<number | null>(null);
  const [runOpen, setRunOpen] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (project) setNameDraft(project.name);
  }, [project?.id, project?.name]);

  // Show a transient "Saved" indicator when the project updates.
  React.useEffect(() => {
    if (!project) return;
    setSavedAt(Date.now());
  }, [project?.updatedAt]);

  if (!ready) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading studio…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-medium">Project not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted or this device doesn&apos;t have it.
        </p>
        <Button href="/studio" variant="outline" size="md">
          Start a new project
        </Button>
      </div>
    );
  }

  const selectedNode =
    project.nodes.find((n) => n.id === selectedNodeId) ?? null;

  const handleCreateNode = (type: NodeType, x: number, y: number) => {
    const node = createNodeOnProject(projectId, { type, x, y });
    setSelectedNodeId(node.id);
  };

  const handleAddNodeAtCenter = (type: NodeType) => {
    // Spawn near the densest area of existing nodes (or a default spot)
    const baseX =
      project.nodes.length === 0
        ? 80
        : Math.max(...project.nodes.map((n) => n.x)) + 220;
    const baseY = 160 + Math.floor(Math.random() * 80) - 40;
    const node = createNodeOnProject(projectId, {
      type,
      x: baseX,
      y: baseY,
    });
    setSelectedNodeId(node.id);
  };

  const handleNodeChange = (
    nodeId: string,
    patch: Partial<Omit<ProjectNode, "id">>,
  ) => {
    updateNode(projectId, nodeId, patch);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // Small artificial delay so the UI feels responsive.
    await new Promise((r) => setTimeout(r, 700));
    const seed = generateGraphFromPrompt(prompt);
    applyGeneratedGraph(projectId, seed);
    setSelectedNodeId(null);
    setGenerating(false);
    setPrompt("");
  };

  const handleRun = async () => {
    if (project.nodes.length === 0) return;
    const log = simulateRun(project);
    setRunLog(log);
    setRunOpen(true);
    setActiveStepIndex(0);
    for (let i = 0; i < log.steps.length; i++) {
      setActiveStepIndex(i);
      // simulate node execution time
      await new Promise((r) => setTimeout(r, Math.min(log.steps[i]!.ms, 700)));
    }
    setActiveStepIndex(null);
    appendRun(projectId, log);
  };

  const activeNodeId =
    activeStepIndex !== null && runLog
      ? runLog.steps[activeStepIndex]?.nodeId ?? null
      : null;

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== project.name) {
      updateProject(projectId, { name: trimmed });
    } else {
      setNameDraft(project.name);
    }
    setRenaming(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div className="min-w-0 flex items-center gap-2">
            {renaming ? (
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitName();
                  if (e.key === "Escape") {
                    setNameDraft(project.name);
                    setRenaming(false);
                  }
                }}
                className="h-8 min-w-[12rem] rounded-md border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            ) : (
              <button
                type="button"
                onClick={() => setRenaming(true)}
                className="group inline-flex max-w-[18rem] items-center gap-1.5 truncate rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-accent"
                title="Rename project"
              >
                <span className="truncate">{project.name}</span>
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
              </button>
            )}
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {project.nodes.length} nodes · {project.edges.length} edges
            </span>
          </div>
        </div>

        {/* AI prompt bar */}
        <div className="hidden md:flex flex-1 max-w-xl items-center">
          <div className="relative w-full">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-500" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
              placeholder="Describe a workflow… e.g. ‘When a new lead comes in, score with AI and notify Slack’"
              className="h-9 w-full rounded-full border border-border bg-background pl-8 pr-24 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
                "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              {generating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Generating
                </>
              ) : (
                <>Generate</>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-opacity",
              savedAt && Date.now() - savedAt < 1500 ? "opacity-100" : "opacity-70",
            )}
          >
            <Check className="h-3 w-3 text-emerald-500" /> Saved
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRunOpen((o) => !o)}
            className="hidden md:inline-flex"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                runOpen && "rotate-180",
              )}
            />
            {runLog ? `Last run · ${runLog.durationMs}ms` : "Run log"}
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={activeStepIndex !== null || project.nodes.length === 0}
          >
            {activeStepIndex !== null ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile AI bar */}
      <div className="md:hidden border-b border-border bg-card px-4 py-2">
        <div className="relative">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-500" />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGenerate();
            }}
            placeholder="Describe a workflow…"
            className="h-9 w-full rounded-full border border-border bg-background pl-8 pr-20 text-[13px] focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
          >
            {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Go"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <NodePalette onAdd={handleAddNodeAtCenter} />

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <Canvas
              nodes={project.nodes}
              edges={project.edges}
              selectedNodeId={selectedNodeId}
              activeStepNodeId={activeNodeId}
              onSelect={setSelectedNodeId}
              onMove={(id, x, y) => moveNode(projectId, id, x, y)}
              onCreate={handleCreateNode}
              onConnect={(from, to) => createEdge(projectId, from, to)}
              onDeleteNode={(id) => deleteNode(projectId, id)}
              onDeleteEdge={(id) => deleteEdge(projectId, id)}
            />
          </div>
          <RunLogPanel
            log={runLog}
            activeStepIndex={activeStepIndex}
            open={runOpen && runLog !== null}
            onClose={() => setRunOpen(false)}
          />
        </div>

        <Inspector
          node={selectedNode}
          onChange={(patch) => {
            if (selectedNode) handleNodeChange(selectedNode.id, patch);
          }}
          onDelete={() => {
            if (selectedNode) {
              deleteNode(projectId, selectedNode.id);
              setSelectedNodeId(null);
            }
          }}
        />
      </div>
    </div>
  );
}

// Re-export node constants so canvas/inspector remain colocated.
export const STUDIO_NODE_SIZE = { w: NODE_W, h: NODE_H };
