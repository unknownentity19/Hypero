"use client";

import type { Edge, NodeKind, Workflow, WorkflowNode } from "./types";

type Spec = {
  key: string;
  kind: NodeKind;
  label: string;
  x: number;
  y: number;
  config: WorkflowNode["config"];
};

function id() {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function build(
  name: string,
  specs: Spec[],
  pairs: [string, string][],
): Workflow {
  const idByKey = new Map<string, string>();
  const nodes: WorkflowNode[] = specs.map((s) => {
    const nid = id();
    idByKey.set(s.key, nid);
    return {
      id: nid,
      kind: s.kind,
      label: s.label,
      x: s.x,
      y: s.y,
      // The spec config is fully typed at the call-site below.
      config: s.config,
    };
  });
  const edges: Edge[] = pairs
    .map(([from, to]) => {
      const f = idByKey.get(from);
      const t = idByKey.get(to);
      if (!f || !t) return null;
      return { id: id(), from: f, to: t };
    })
    .filter((e): e is Edge => e !== null);
  return { id: id(), name, nodes, edges };
}

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  build: () => Workflow;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "lead-router",
    name: "Lead router",
    description:
      "Webhook → AI agent classifies → branch routes to Slack or DB.",
    build: () =>
      build(
        "Lead router",
        [
          {
            key: "t",
            kind: "webhook",
            label: "New lead",
            x: 32,
            y: 96,
            config: { path: "/hooks/new-lead", method: "POST" },
          },
          {
            key: "a",
            kind: "agent",
            label: "Classify priority",
            x: 296,
            y: 96,
            config: {
              model: "gpt-4o",
              instructions:
                "Classify the lead as 'high', 'medium', or 'low' priority and explain in one sentence.",
              tools: ["http", "search"],
            },
          },
          {
            key: "c",
            kind: "condition",
            label: "If high priority",
            x: 560,
            y: 96,
            config: { expression: "$.priority == 'high'" },
          },
          {
            key: "s",
            kind: "slack",
            label: "Notify #sales",
            x: 824,
            y: 16,
            config: {
              channel: "#sales",
              message: "🔥 High-priority lead: {{ input.email }}",
            },
          },
          {
            key: "p",
            kind: "postgres",
            label: "Insert lead",
            x: 824,
            y: 176,
            config: {
              query:
                "INSERT INTO leads (email, priority) VALUES ($1, $2);",
            },
          },
        ],
        [
          ["t", "a"],
          ["a", "c"],
          ["c", "s"],
          ["c", "p"],
        ],
      ),
  },
  {
    id: "support-triage",
    name: "Support triage",
    description:
      "Schedule → fetch tickets → reasoning agent drafts replies → Slack.",
    build: () =>
      build(
        "Support triage",
        [
          {
            key: "t",
            kind: "schedule",
            label: "Every 5 minutes",
            x: 32,
            y: 112,
            config: { cron: "*/5 * * * *" },
          },
          {
            key: "h",
            kind: "http",
            label: "Fetch open tickets",
            x: 296,
            y: 112,
            config: {
              url: "https://api.zendesk.com/v2/tickets?status=open",
              method: "GET",
            },
          },
          {
            key: "a",
            kind: "agent",
            label: "Draft reply",
            x: 560,
            y: 112,
            config: {
              model: "claude-3.5-sonnet",
              instructions:
                "Draft a polite, accurate reply with citations.",
              tools: ["search"],
            },
          },
          {
            key: "n",
            kind: "notion",
            label: "Log to Notion",
            x: 824,
            y: 112,
            config: {
              database: "Tickets",
              properties: '{ "Status": "Replied" }',
            },
          },
        ],
        [
          ["t", "h"],
          ["h", "a"],
          ["a", "n"],
        ],
      ),
  },
  {
    id: "blank",
    name: "Blank canvas",
    description: "Start from zero. Drag nodes from the palette.",
    build: () => build("Untitled workflow", [], []),
  },
];
