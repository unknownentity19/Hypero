"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bot,
  Database,
  GitBranch,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import {
  createProject,
  deleteProject,
  generateGraphFromPrompt,
  TEMPLATE_META,
  TEMPLATES,
  applyGeneratedGraph,
  useProjects,
  type TemplateKey,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading workspace…
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, ready: projectsReady } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/signin?next=/dashboard");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowCreate(true);
    }
  }, [searchParams]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [projects, query]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading workspace…
      </div>
    );
  }

  const firstName = user.name.split(" ")[0] ?? user.name;

  const totalRuns = projects.reduce((acc, p) => acc + p.runs.length, 0);
  const totalNodes = projects.reduce((acc, p) => acc + p.nodes.length, 0);
  const aiNodes = projects.reduce(
    (acc, p) => acc + p.nodes.filter((n) => n.type === "llm").length,
    0,
  );

  return (
    <Section className="py-10">
      <Container>
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline">Dashboard</Badge>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 text-muted-foreground">
              You&apos;re signed in to the{" "}
              <span className="font-mono text-foreground">{user.workspace}</span>{" "}
              workspace.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4" /> New project
            </Button>
            <Button
              size="md"
              variant="ghost"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              Sign out
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: "Projects",
              value: String(projects.length),
              sub: projects.length === 0 ? "Create your first" : "All time",
            },
            {
              label: "Nodes built",
              value: String(totalNodes),
              sub: `${aiNodes} AI nodes`,
            },
            {
              label: "Runs",
              value: String(totalRuns),
              sub: "Last 10 per project",
            },
            { label: "Plan", value: "Free", sub: "Unlimited dev runs" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Projects + side */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                Your projects
              </h2>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects"
                  className="pl-8 h-9"
                />
              </div>
            </div>

            {!projectsReady ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                projects…
              </div>
            ) : projects.length === 0 ? (
              <EmptyState onCreate={() => setShowCreate(true)} />
            ) : filteredProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No projects match{" "}
                  <span className="font-mono text-foreground">
                    &ldquo;{query}&rdquo;
                  </span>
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredProjects.map((p) => (
                  <li
                    key={p.id}
                    className="group relative flex flex-col rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                  >
                    <Link
                      href={`/studio/${p.id}`}
                      className="flex flex-1 flex-col gap-3 p-5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">
                            {p.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {p.description || "—"}
                          </p>
                        </div>
                        <ProjectMiniGraph
                          nodes={p.nodes.length}
                          edges={p.edges.length}
                        />
                      </div>
                      <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Workflow className="h-3 w-3" />
                          {p.nodes.length} nodes
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Activity className="h-3 w-3" />
                          {p.runs.length} runs
                        </span>
                        <span>{relativeTime(p.updatedAt)}</span>
                      </div>
                    </Link>
                    <div className="absolute right-3 top-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpenId((id) => (id === p.id ? null : p.id));
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-opacity hover:bg-accent hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Project menu"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                      {menuOpenId === p.id ? (
                        <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                          <Link
                            href={`/studio/${p.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent"
                          >
                            <Pencil className="h-3 w-3" /> Open in studio
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpenId(null);
                              if (
                                window.confirm(
                                  `Delete project “${p.name}”? This cannot be undone.`,
                                )
                              ) {
                                deleteProject(p.id);
                              }
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-accent"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold">Start from a template</h2>
              </div>
              <ul className="flex flex-col">
                {TEMPLATE_META.filter((t) => t.key !== "blank").map((t) => (
                  <li key={t.key}>
                    <button
                      type="button"
                      onClick={() => {
                        const p = createProject({
                          name: t.name,
                          description: t.description,
                          template: t.key,
                        });
                        router.push(`/studio/${p.id}`);
                      }}
                      className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                        {iconForTemplate(t.key)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {t.tag}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4" />
                Recent runs
              </div>
              {projects.flatMap((p) => p.runs.map((r) => ({ p, r }))).length ===
              0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Run a project from the studio to see logs here.
                </p>
              ) : (
                <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
                  {projects
                    .flatMap((p) =>
                      p.runs.map((r) => ({ project: p, run: r })),
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.run.startedAt).getTime() -
                        new Date(a.run.startedAt).getTime(),
                    )
                    .slice(0, 5)
                    .map(({ project, run }) => (
                      <li
                        key={run.id}
                        className="flex items-center justify-between"
                      >
                        <span className="inline-flex items-center gap-2">
                          <GitBranch className="h-3 w-3" />
                          <Link
                            href={`/studio/${project.id}`}
                            className="font-mono text-foreground hover:underline"
                          >
                            {project.name}
                          </Link>
                          <span>· {run.status}</span>
                        </span>
                        <span>{run.durationMs}ms</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </Container>

      {showCreate ? (
        <CreateProjectDialog
          onClose={() => setShowCreate(false)}
          onCreate={(opts) => {
            const p = createProject(opts);
            if (opts.aiPrompt) {
              const seed = generateGraphFromPrompt(opts.aiPrompt);
              applyGeneratedGraph(p.id, seed);
            }
            setShowCreate(false);
            router.push(`/studio/${p.id}`);
          }}
        />
      ) : null}
    </Section>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background">
        <Workflow className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        No projects yet
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Spin up your first visual AI workflow. Start blank, or pick a template
        — then refine it in the studio.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button size="md" onClick={onCreate}>
          <Plus className="h-4 w-4" /> Create project
        </Button>
        <Button size="md" variant="outline" href="/studio">
          Open studio
        </Button>
      </div>
    </div>
  );
}

function CreateProjectDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: {
    name: string;
    description: string;
    template?: TemplateKey;
    aiPrompt?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<TemplateKey>("blank");
  const [aiPrompt, setAiPrompt] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[8vh]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-sm font-semibold">Create a project</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Name</Label>
            <Input
              id="proj-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lead routing v2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Description (optional)</Label>
            <Input
              id="proj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Score inbound leads with AI and notify Slack"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Starting point</Label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_META.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemplate(t.key)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                    template === t.key
                      ? "border-foreground bg-accent"
                      : "border-border hover:bg-accent",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {iconForTemplate(t.key)}
                    <span className="text-sm font-medium">{t.name}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground line-clamp-2">
                    {t.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-prompt" className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              Or describe it (AI scaffolds the graph)
            </Label>
            <textarea
              id="ai-prompt"
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="When a Stripe payment fails, summarize with AI and send a recovery email."
              className="w-full rounded-lg border border-border bg-background p-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40"
            />
            <p className="text-[11px] text-muted-foreground">
              If filled, AI generation replaces the template choice.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() =>
              onCreate({
                name: name || "Untitled project",
                description,
                template: aiPrompt.trim() ? "blank" : template,
                aiPrompt: aiPrompt.trim() || undefined,
              })
            }
          >
            <ArrowRight className="h-4 w-4" /> Create &amp; open
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProjectMiniGraph({
  nodes,
  edges,
}: {
  nodes: number;
  edges: number;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
      <span>{nodes}n</span>
      <span className="text-foreground/30">·</span>
      <span>{edges}e</span>
    </div>
  );
}

function iconForTemplate(key: TemplateKey) {
  switch (key) {
    case "blank":
      return <Plus className="h-3.5 w-3.5" />;
    case "lead-router":
      return <GitBranch className="h-3.5 w-3.5" />;
    case "support-triage":
      return <Bot className="h-3.5 w-3.5" />;
    case "invoice-extract":
      return <Database className="h-3.5 w-3.5" />;
    case "content-pipeline":
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

function relativeTime(iso: string) {
  const d = Date.parse(iso);
  const diff = Math.max(0, Date.now() - d);
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// Stash to avoid eager template tree-shake elimination when imported lazily.
void TEMPLATES;
