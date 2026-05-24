"use client";

import { useSyncExternalStore } from "react";

export type NodeType =
  | "trigger"
  | "llm"
  | "http"
  | "condition"
  | "transform"
  | "database"
  | "slack"
  | "output";

export type NodeConfig = {
  triggerType?: "webhook" | "schedule" | "manual";
  cron?: string;
  prompt?: string;
  model?: string;
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  expression?: string;
  channel?: string;
  table?: string;
  query?: string;
  message?: string;
  destination?: string;
};

export type ProjectNode = {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: NodeConfig;
};

export type ProjectEdge = {
  id: string;
  from: string;
  to: string;
};

export type RunStep = {
  nodeId: string;
  label: string;
  output: string;
  ms: number;
  status: "success" | "error";
};

export type RunLog = {
  id: string;
  startedAt: string;
  durationMs: number;
  status: "success" | "error";
  steps: RunStep[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  runs: RunLog[];
};

const STORAGE_KEY = "hypero-projects";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function defaultConfigForType(type: NodeType): NodeConfig {
  switch (type) {
    case "trigger":
      return { triggerType: "webhook" };
    case "llm":
      return {
        model: "hypero-1",
        prompt: "Summarize the incoming payload in one sentence.",
      };
    case "http":
      return { method: "GET", url: "https://api.example.com/v1/data" };
    case "condition":
      return { expression: "payload.priority === 'high'" };
    case "transform":
      return { expression: "{ id: payload.id, name: payload.name }" };
    case "database":
      return { table: "leads", query: "INSERT INTO leads (id) VALUES ($1)" };
    case "slack":
      return { channel: "#alerts", message: "New event: {{payload.title}}" };
    case "output":
      return { destination: "api-response" };
  }
}

const NODE_LABELS: Record<NodeType, string> = {
  trigger: "Trigger",
  llm: "AI Agent",
  http: "HTTP Request",
  condition: "Condition",
  transform: "Transform",
  database: "Database",
  slack: "Slack",
  output: "Output",
};

export function defaultLabelForType(type: NodeType): string {
  return NODE_LABELS[type];
}

// ---------- Store ----------

type State = {
  projects: Project[];
  ready: boolean;
};

let state: State = { projects: [], ready: false };
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
  } catch {
    // ignore
  }
}

function ensureLoaded() {
  if (typeof window === "undefined") return;
  if (state.ready) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Project[];
      state = { projects: parsed, ready: true };
    } else {
      state = { projects: [], ready: true };
    }
  } catch {
    state = { projects: [], ready: true };
  }
}

function setProjects(updater: (prev: Project[]) => Project[]) {
  ensureLoaded();
  state = { projects: updater(state.projects), ready: true };
  persist();
  notify();
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  // cross-tab sync
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      const parsed = e.newValue ? (JSON.parse(e.newValue) as Project[]) : [];
      state = { projects: parsed, ready: true };
      notify();
    } catch {
      // ignore
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): State {
  ensureLoaded();
  return state;
}

function getServerSnapshot(): State {
  return { projects: [], ready: false };
}

export function useProjects() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useProject(id: string | undefined) {
  const { projects, ready } = useProjects();
  const project = id ? projects.find((p) => p.id === id) : undefined;
  return { project, ready };
}

// ---------- Mutations ----------

export function createProject(input: {
  name: string;
  description?: string;
  template?: TemplateKey;
}): Project {
  const seed = input.template ? TEMPLATES[input.template]() : { nodes: [], edges: [] };
  const project: Project = {
    id: uid("prj"),
    name: input.name.trim() || "Untitled project",
    description: input.description?.trim() || "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    nodes: seed.nodes,
    edges: seed.edges,
    runs: [],
  };
  setProjects((prev) => [project, ...prev]);
  return project;
}

export function deleteProject(id: string) {
  setProjects((prev) => prev.filter((p) => p.id !== id));
}

export function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "description" | "nodes" | "edges">>,
) {
  setProjects((prev) =>
    prev.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p,
    ),
  );
}

export function appendRun(id: string, run: RunLog) {
  setProjects((prev) =>
    prev.map((p) =>
      p.id === id
        ? { ...p, runs: [run, ...p.runs].slice(0, 10), updatedAt: nowIso() }
        : p,
    ),
  );
}

export function createNodeOnProject(
  id: string,
  input: { type: NodeType; x: number; y: number; label?: string },
): ProjectNode {
  const node: ProjectNode = {
    id: uid("node"),
    type: input.type,
    label: input.label || NODE_LABELS[input.type],
    x: input.x,
    y: input.y,
    config: defaultConfigForType(input.type),
  };
  setProjects((prev) =>
    prev.map((p) =>
      p.id === id
        ? { ...p, nodes: [...p.nodes, node], updatedAt: nowIso() }
        : p,
    ),
  );
  return node;
}

export function updateNode(
  projectId: string,
  nodeId: string,
  patch: Partial<Omit<ProjectNode, "id">>,
) {
  setProjects((prev) =>
    prev.map((p) =>
      p.id === projectId
        ? {
            ...p,
            nodes: p.nodes.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    ...patch,
                    config: patch.config ? { ...n.config, ...patch.config } : n.config,
                  }
                : n,
            ),
            updatedAt: nowIso(),
          }
        : p,
    ),
  );
}

export function moveNode(
  projectId: string,
  nodeId: string,
  x: number,
  y: number,
) {
  setProjects((prev) =>
    prev.map((p) =>
      p.id === projectId
        ? {
            ...p,
            nodes: p.nodes.map((n) =>
              n.id === nodeId ? { ...n, x, y } : n,
            ),
            updatedAt: nowIso(),
          }
        : p,
    ),
  );
}

export function deleteNode(projectId: string, nodeId: string) {
  setProjects((prev) =>
    prev.map((p) =>
      p.id === projectId
        ? {
            ...p,
            nodes: p.nodes.filter((n) => n.id !== nodeId),
            edges: p.edges.filter(
              (e) => e.from !== nodeId && e.to !== nodeId,
            ),
            updatedAt: nowIso(),
          }
        : p,
    ),
  );
}

export function createEdge(
  projectId: string,
  from: string,
  to: string,
): ProjectEdge | null {
  if (from === to) return null;
  const project = state.projects.find((p) => p.id === projectId);
  if (!project) return null;
  const exists = project.edges.some((e) => e.from === from && e.to === to);
  if (exists) return null;
  const edge: ProjectEdge = { id: uid("edge"), from, to };
  setProjects((prev) =>
    prev.map((p) =>
      p.id === projectId
        ? { ...p, edges: [...p.edges, edge], updatedAt: nowIso() }
        : p,
    ),
  );
  return edge;
}

export function deleteEdge(projectId: string, edgeId: string) {
  setProjects((prev) =>
    prev.map((p) =>
      p.id === projectId
        ? {
            ...p,
            edges: p.edges.filter((e) => e.id !== edgeId),
            updatedAt: nowIso(),
          }
        : p,
    ),
  );
}

// ---------- Templates ----------

export type TemplateKey = "blank" | "lead-router" | "support-triage" | "invoice-extract" | "content-pipeline";

type TemplateSeed = { nodes: ProjectNode[]; edges: ProjectEdge[] };

function n(
  partial: Omit<ProjectNode, "id" | "config"> & { config?: NodeConfig },
): ProjectNode {
  return {
    id: uid("node"),
    config: { ...defaultConfigForType(partial.type), ...(partial.config ?? {}) },
    ...partial,
  };
}

function e(from: string, to: string): ProjectEdge {
  return { id: uid("edge"), from, to };
}

export const TEMPLATES: Record<TemplateKey, () => TemplateSeed> = {
  blank: () => ({ nodes: [], edges: [] }),
  "lead-router": () => {
    const trigger = n({
      type: "trigger",
      label: "New lead webhook",
      x: 60,
      y: 140,
      config: { triggerType: "webhook" },
    });
    const enrich = n({
      type: "http",
      label: "Enrich from Clearbit",
      x: 280,
      y: 60,
      config: { method: "GET", url: "https://api.clearbit.com/v2/people" },
    });
    const agent = n({
      type: "llm",
      label: "Score & summarize",
      x: 280,
      y: 220,
      config: {
        model: "hypero-1",
        prompt:
          "Score this lead 0-100 and write a one-line summary for the AE. Return JSON {score, summary}.",
      },
    });
    const branch = n({
      type: "condition",
      label: "If score >= 80",
      x: 520,
      y: 140,
      config: { expression: "result.score >= 80" },
    });
    const db = n({
      type: "database",
      label: "Upsert lead",
      x: 760,
      y: 60,
      config: { table: "leads", query: "INSERT … ON CONFLICT DO UPDATE" },
    });
    const slack = n({
      type: "slack",
      label: "Notify AE channel",
      x: 760,
      y: 220,
      config: { channel: "#ae-hot", message: "Hot lead: {{result.summary}}" },
    });
    return {
      nodes: [trigger, enrich, agent, branch, db, slack],
      edges: [
        e(trigger.id, enrich.id),
        e(trigger.id, agent.id),
        e(enrich.id, branch.id),
        e(agent.id, branch.id),
        e(branch.id, db.id),
        e(branch.id, slack.id),
      ],
    };
  },
  "support-triage": () => {
    const trigger = n({
      type: "trigger",
      label: "Inbound ticket",
      x: 60,
      y: 160,
      config: { triggerType: "webhook" },
    });
    const classify = n({
      type: "llm",
      label: "Classify intent",
      x: 280,
      y: 80,
      config: {
        model: "hypero-1",
        prompt: "Classify as: billing | bug | feature | other.",
      },
    });
    const summarize = n({
      type: "llm",
      label: "Draft reply",
      x: 280,
      y: 240,
      config: {
        model: "hypero-1",
        prompt:
          "Draft a helpful first response in the brand voice. Be concise and warm.",
      },
    });
    const route = n({
      type: "condition",
      label: "Route by intent",
      x: 520,
      y: 160,
      config: { expression: "intent === 'bug'" },
    });
    const eng = n({
      type: "slack",
      label: "Page on-call eng",
      x: 760,
      y: 80,
      config: { channel: "#eng-oncall", message: "New bug: {{ticket.title}}" },
    });
    const reply = n({
      type: "output",
      label: "Send draft reply",
      x: 760,
      y: 240,
      config: { destination: "support@yourco.com" },
    });
    return {
      nodes: [trigger, classify, summarize, route, eng, reply],
      edges: [
        e(trigger.id, classify.id),
        e(trigger.id, summarize.id),
        e(classify.id, route.id),
        e(summarize.id, route.id),
        e(route.id, eng.id),
        e(route.id, reply.id),
      ],
    };
  },
  "invoice-extract": () => {
    const trigger = n({
      type: "trigger",
      label: "Email attachment",
      x: 60,
      y: 160,
      config: { triggerType: "webhook" },
    });
    const extract = n({
      type: "llm",
      label: "Extract line items",
      x: 280,
      y: 160,
      config: {
        model: "hypero-1",
        prompt:
          "Extract vendor, total, currency, due date, and line items as JSON.",
      },
    });
    const transform = n({
      type: "transform",
      label: "Normalize",
      x: 520,
      y: 160,
      config: { expression: "normalizeInvoice(extracted)" },
    });
    const db = n({
      type: "database",
      label: "Save to invoices",
      x: 760,
      y: 160,
      config: { table: "invoices" },
    });
    return {
      nodes: [trigger, extract, transform, db],
      edges: [
        e(trigger.id, extract.id),
        e(extract.id, transform.id),
        e(transform.id, db.id),
      ],
    };
  },
  "content-pipeline": () => {
    const trigger = n({
      type: "trigger",
      label: "Daily 9am",
      x: 60,
      y: 160,
      config: { triggerType: "schedule", cron: "0 9 * * *" },
    });
    const research = n({
      type: "http",
      label: "Pull trending topics",
      x: 280,
      y: 80,
      config: { method: "GET", url: "https://api.trends.example/today" },
    });
    const draft = n({
      type: "llm",
      label: "Draft long-form post",
      x: 280,
      y: 240,
      config: {
        model: "hypero-1",
        prompt:
          "Write a 600-word blog draft. Cite sources. Match brand voice guidelines.",
      },
    });
    const review = n({
      type: "condition",
      label: "Needs review?",
      x: 520,
      y: 160,
      config: { expression: "draft.confidence < 0.8" },
    });
    const slack = n({
      type: "slack",
      label: "Ping editor",
      x: 760,
      y: 80,
      config: { channel: "#content", message: "Draft ready: {{draft.title}}" },
    });
    const publish = n({
      type: "output",
      label: "Publish to CMS",
      x: 760,
      y: 240,
      config: { destination: "cms" },
    });
    return {
      nodes: [trigger, research, draft, review, slack, publish],
      edges: [
        e(trigger.id, research.id),
        e(trigger.id, draft.id),
        e(research.id, review.id),
        e(draft.id, review.id),
        e(review.id, slack.id),
        e(review.id, publish.id),
      ],
    };
  },
};

export const TEMPLATE_META: {
  key: TemplateKey;
  name: string;
  description: string;
  tag: string;
}[] = [
  {
    key: "blank",
    name: "Blank canvas",
    description: "Start from scratch with an empty graph.",
    tag: "Empty",
  },
  {
    key: "lead-router",
    name: "Lead router",
    description: "Score inbound leads with AI and route hot ones to Slack.",
    tag: "Sales",
  },
  {
    key: "support-triage",
    name: "Support triage",
    description: "Classify tickets and draft a first reply automatically.",
    tag: "Support",
  },
  {
    key: "invoice-extract",
    name: "Invoice extraction",
    description: "Parse invoices from email into structured rows.",
    tag: "Ops",
  },
  {
    key: "content-pipeline",
    name: "Content pipeline",
    description: "Generate, review, and publish daily long-form posts.",
    tag: "Marketing",
  },
];

// ---------- AI generate from prompt ----------

/**
 * Generate a graph from a free-form description. This is a deterministic,
 * keyword-driven heuristic — it stands in for a real model call so the
 * studio works fully offline and as a demo.
 */
export function generateGraphFromPrompt(prompt: string): TemplateSeed {
  const lower = prompt.toLowerCase();
  const has = (...words: string[]) => words.some((w) => lower.includes(w));

  // Build a sensible chain of nodes based on keywords found.
  type Step = { type: NodeType; label: string; config?: NodeConfig };
  const steps: Step[] = [];

  // Trigger
  if (has("schedule", "daily", "every day", "cron", "9am", "morning")) {
    steps.push({
      type: "trigger",
      label: "Schedule (daily)",
      config: { triggerType: "schedule", cron: "0 9 * * *" },
    });
  } else if (has("email", "inbox", "mailbox")) {
    steps.push({
      type: "trigger",
      label: "New email",
      config: { triggerType: "webhook" },
    });
  } else {
    steps.push({
      type: "trigger",
      label: "Webhook",
      config: { triggerType: "webhook" },
    });
  }

  // Optional fetch
  if (has("api", "fetch", "http", "endpoint", "crm", "salesforce", "hubspot", "clearbit")) {
    steps.push({
      type: "http",
      label: "Fetch data",
      config: { method: "GET", url: "https://api.example.com/v1/data" },
    });
  }

  // LLM
  const llmLabel = has("summarize", "summary")
    ? "Summarize"
    : has("classify", "categor")
      ? "Classify"
      : has("draft", "write", "generate", "blog", "post", "reply", "email")
        ? "Draft content"
        : has("extract", "parse")
          ? "Extract fields"
          : has("score", "rank", "priorit")
            ? "Score & rank"
            : "AI Agent";
  steps.push({
    type: "llm",
    label: llmLabel,
    config: {
      model: "hypero-1",
      prompt: prompt.trim().slice(0, 240) || "Reason about the input and produce structured output.",
    },
  });

  if (has("transform", "normalize", "clean", "format")) {
    steps.push({
      type: "transform",
      label: "Transform",
    });
  }

  if (has("if", "when", "condition", "priorit", "route", "branch")) {
    steps.push({
      type: "condition",
      label: "Branch",
      config: { expression: "result.score >= 80" },
    });
  }

  if (has("database", "postgres", "save", "store", "record", "table")) {
    steps.push({
      type: "database",
      label: "Save record",
      config: { table: "events" },
    });
  }

  if (has("slack", "notify", "alert", "ping", "message")) {
    steps.push({
      type: "slack",
      label: "Notify Slack",
      config: { channel: "#alerts", message: "Update: {{result.summary}}" },
    });
  }

  if (has("publish", "post", "send", "email back", "reply")) {
    steps.push({
      type: "output",
      label: "Send output",
      config: { destination: "downstream" },
    });
  }

  if (steps.length < 3) {
    steps.push({
      type: "output",
      label: "Return result",
      config: { destination: "api-response" },
    });
  }

  const nodes: ProjectNode[] = steps.map((s, i) => ({
    id: uid("node"),
    type: s.type,
    label: s.label,
    x: 60 + i * 220,
    y: 160 + ((i % 2 === 0 ? -1 : 1) * 30),
    config: { ...defaultConfigForType(s.type), ...(s.config ?? {}) },
  }));

  const edges: ProjectEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ id: uid("edge"), from: nodes[i]!.id, to: nodes[i + 1]!.id });
  }

  return { nodes, edges };
}

export function applyGeneratedGraph(projectId: string, seed: TemplateSeed) {
  setProjects((prev) =>
    prev.map((p) =>
      p.id === projectId
        ? {
            ...p,
            nodes: seed.nodes,
            edges: seed.edges,
            updatedAt: nowIso(),
          }
        : p,
    ),
  );
}

// ---------- Run simulation ----------

const SAMPLE_OUTPUTS: Record<NodeType, string[]> = {
  trigger: ["Event received", "Payload parsed", "Authenticated"],
  http: [
    "200 OK · 142 ms",
    "Fetched 14 records",
    "Cache miss — fresh from origin",
  ],
  llm: [
    "Generated 1 completion (312 tokens)",
    "Classified as priority=high (0.94)",
    "Extracted 8 fields with 0.97 confidence",
    "Drafted 612 character response",
  ],
  condition: ["Branch: true", "Branch: true", "Branch: false"],
  transform: ["Mapped 6 fields", "Normalized payload", "Validated schema"],
  database: ["Row upserted (id=42)", "1 row updated", "Inserted 3 rows"],
  slack: ["Posted to #alerts", "Message delivered", "Thread replied"],
  output: ["Response returned 200", "Forwarded to downstream", "Job complete"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function topoOrder(nodes: ProjectNode[], edges: ProjectEdge[]): ProjectNode[] {
  const indeg = new Map<string, number>();
  for (const n of nodes) indeg.set(n.id, 0);
  for (const e of edges) {
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  }
  const queue: string[] = [];
  for (const [id, d] of indeg.entries()) if (d === 0) queue.push(id);
  const order: ProjectNode[] = [];
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  while (queue.length) {
    const id = queue.shift()!;
    const node = byId.get(id);
    if (node) order.push(node);
    for (const e of edges.filter((ed) => ed.from === id)) {
      indeg.set(e.to, (indeg.get(e.to) ?? 1) - 1);
      if ((indeg.get(e.to) ?? 0) === 0) queue.push(e.to);
    }
  }
  // include any remaining (cycles) in original order
  for (const n of nodes) if (!order.includes(n)) order.push(n);
  return order;
}

export function simulateRun(project: Project): RunLog {
  const order = topoOrder(project.nodes, project.edges);
  const steps: RunStep[] = order.map((node) => {
    const ms = 40 + Math.floor(Math.random() * 380);
    return {
      nodeId: node.id,
      label: node.label,
      ms,
      output: pick(SAMPLE_OUTPUTS[node.type]),
      status: "success" as const,
    };
  });
  const durationMs = steps.reduce((acc, s) => acc + s.ms, 0);
  return {
    id: uid("run"),
    startedAt: nowIso(),
    durationMs,
    status: "success",
    steps,
  };
}
