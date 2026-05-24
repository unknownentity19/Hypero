import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  CircleDot,
  Cpu,
  GitBranch,
  Keyboard,
  Sparkles,
  Terminal as TerminalIcon,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react";
import { Container, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/docs/code-block";
import { InlineCode } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Terminal — Hypero",
  description:
    "Run Hypero from your terminal. Install the CLI, generate workflows, run agents, and tail logs without leaving the shell.",
};

const FEATURES = [
  {
    icon: <Wand2 className="h-4 w-4" />,
    title: "Generate from a prompt",
    desc: "Describe a workflow in English; the CLI scaffolds nodes, edges, and a config you can edit on disk.",
  },
  {
    icon: <Workflow className="h-4 w-4" />,
    title: "Run any project locally",
    desc: "Execute a workflow against real inputs, with streamed logs, structured output, and exit codes you can pipe.",
  },
  {
    icon: <GitBranch className="h-4 w-4" />,
    title: "Git-native projects",
    desc: "Every workflow is a folder of JSON + prompts. Diff, branch, review, and ship them like normal code.",
  },
  {
    icon: <Cpu className="h-4 w-4" />,
    title: "Agent REPL",
    desc: "Drop into an interactive shell with your agent — tools, memory, and traces all live.",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    title: "Deploy in one command",
    desc: "`hyp deploy` ships your workflow as a versioned API endpoint with logs, retries, and rollback.",
  },
  {
    icon: <Boxes className="h-4 w-4" />,
    title: "Works in any pipeline",
    desc: "Drop it into CI, Docker, a Makefile, or a Justfile. No daemons, no background services.",
  },
];

const COMPATIBILITY = [
  { name: "macOS", note: "Apple Silicon + Intel" },
  { name: "Linux", note: "x86_64 + arm64" },
  { name: "Windows", note: "WSL2 + native" },
  { name: "Node", note: ">= 20" },
  { name: "Bun", note: ">= 1.1" },
  { name: "Deno", note: ">= 1.40" },
];

export default function TerminalPage() {
  return (
    <Section className="relative overflow-hidden pt-16 pb-24">
      <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade" />
      <Container>
        {/* HERO */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <TerminalIcon className="h-3 w-3" />
                Hypero CLI
              </Badge>
              <span className="font-mono text-[11px] text-muted-foreground">
                v1.0.0
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.04]">
              Hypero{" "}
              <span className="font-serif italic font-normal text-gradient">
                in your terminal.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              The same visual studio you know — as a CLI. Generate workflows
              from a prompt, run them locally with streamed logs, drop into an
              agent REPL, and deploy with one command. No browser tab required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button href="#install" size="lg">
                <TerminalIcon className="h-4 w-4" />
                Install the CLI
              </Button>
              <Button href="/studio" variant="outline" size="lg">
                <Sparkles className="h-4 w-4" />
                Open studio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              MIT licensed · Single static binary · No telemetry by default
            </p>
          </div>

          <div className="lg:col-span-6">
            <CodeBlock language="bash" title="zsh — first run">
{`# Install once, anywhere
$ npm install -g @hypero/cli

# Sign in (opens browser, paste token back)
$ hyp login
✓ Logged in as devon@hypero.dev

# Scaffold a project from a prompt
$ hyp new lead-router \\
    --from "score inbound leads and notify slack"
✓ Generated 6 nodes · 5 edges
↳ ./lead-router/workflow.json

# Run it locally
$ hyp run lead-router --input ./fixtures/lead.json
→ trigger:webhook   ok    12ms
→ http:enrich       ok   142ms
→ llm:score         ok   612ms   { score: 86 }
→ if score>=80      true   1ms
→ slack:notify      ok    98ms
✓ workflow ok · 865ms`}
            </CodeBlock>
          </div>
        </div>

        {/* INSTALL */}
        <div id="install" className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Install
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              One command. Any machine.
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              The CLI ships as a single static binary plus an npm package for
              users who already live in Node. Both go through the same
              auto-updater and read the same{" "}
              <InlineCode lang="ts">~/.hypero/config.json</InlineCode>.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {COMPATIBILITY.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    · {c.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <CodeBlock language="bash" title="macOS · Linux">
{`# Universal installer
$ curl -fsSL https://hypero.dev/install.sh | sh

# Homebrew
$ brew install hypero/tap/hyp

# Node-only? The npm package wraps the same binary.
$ npm install -g @hypero/cli`}
            </CodeBlock>
            <CodeBlock language="bash" title="Windows · PowerShell">
{`# Winget
> winget install Hypero.Cli

# Or via npm inside WSL or PowerShell + Node 20
> npm install -g @hypero/cli`}
            </CodeBlock>
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-24">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Why a CLI
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
            Everything the studio does — scriptable.
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-accent">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    {f.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* COOKBOOK */}
        <div className="mt-24 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Cookbook
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              From idea to deploy.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A typical session — describe a workflow, edit a node, run it
              against a fixture, then deploy.
            </p>

            <CodeBlock language="bash" title="1. Describe & generate">
{`$ hyp new support-triage \\
    --from "classify support tickets and draft a reply"
✓ wrote support-triage/workflow.json
✓ wrote support-triage/prompts/classify.md
✓ wrote support-triage/prompts/draft.md`}
            </CodeBlock>

            <CodeBlock language="bash" title="2. Inspect & edit">
{`$ cd support-triage
$ hyp graph
   ┌─[trigger:webhook]──────────────────┐
   │                                    ▼
   │                            [llm:classify]
   │                                    │
   ├──▶ [llm:draft]                     │
   │            │                       │
   │            └─────▶ [route]◀────────┘
   │                       │
   │                       ├─▶ [slack:engineering]
   │                       └─▶ [output:reply]
   └────────────────────────────────────┘`}
            </CodeBlock>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-transparent select-none">
              .
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              <span className="font-serif italic font-normal text-gradient">
                Ship it.
              </span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Test locally, then deploy. The deploy command writes a versioned
              endpoint and prints the URL.
            </p>

            <CodeBlock language="bash" title="3. Run against a fixture">
{`$ hyp run . --input fixtures/ticket.json --pretty
{
  "intent": "billing",
  "confidence": 0.94,
  "draft": "Hi Alex — thanks for reaching out. We see ...",
  "ms": 612
}`}
            </CodeBlock>

            <CodeBlock language="bash" title="4. Deploy">
{`$ hyp deploy --tag prod
↳ packing  support-triage@1.4.0   2.3 kB
↳ uploading  ✓
↳ versioning ✓ (rev #14)
✓ deployed to https://api.hypero.dev/v1/run/support-triage
  → previous rev: https://api.hypero.dev/v1/run/support-triage@13`}
            </CodeBlock>
          </div>
        </div>

        {/* JSON PROJECT SHAPE */}
        <div className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              On disk
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Workflows are just files.
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Every project is a folder of JSON and Markdown. Diff in your
              code review tool. Commit the prompts alongside the graph. The
              studio reads the same files — no proprietary format.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CircleDot className="mt-1 h-3 w-3 text-emerald-500 shrink-0" />
                <span>
                  <InlineCode lang="json">workflow.json</InlineCode> — the
                  graph: nodes, edges, and per-node config.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CircleDot className="mt-1 h-3 w-3 text-violet-500 shrink-0" />
                <span>
                  <InlineCode lang="ts">prompts/*.md</InlineCode> — system
                  prompts; referenced by node id.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CircleDot className="mt-1 h-3 w-3 text-blue-500 shrink-0" />
                <span>
                  <InlineCode lang="ts">fixtures/*.json</InlineCode> — sample
                  inputs for local runs and tests.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CircleDot className="mt-1 h-3 w-3 text-pink-500 shrink-0" />
                <span>
                  <InlineCode lang="yaml">hyp.config.yaml</InlineCode> —
                  per-project env, model, and deploy config.
                </span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <CodeBlock
              language="json"
              title="workflow.json"
              showLineNumbers
            >
{`{
  "name": "support-triage",
  "version": "1.4.0",
  "nodes": [
    { "id": "trigger", "type": "trigger", "config": { "kind": "webhook" } },
    { "id": "classify", "type": "llm", "config": {
        "model": "hypero-1",
        "prompt": "prompts/classify.md"
    } },
    { "id": "draft", "type": "llm", "config": {
        "model": "hypero-1",
        "prompt": "prompts/draft.md"
    } },
    { "id": "route", "type": "condition", "config": {
        "expression": "result.intent === 'bug'"
    } },
    { "id": "page", "type": "slack", "config": { "channel": "#eng-oncall" } },
    { "id": "reply", "type": "output", "config": { "destination": "email" } }
  ],
  "edges": [
    { "from": "trigger", "to": "classify" },
    { "from": "trigger", "to": "draft" },
    { "from": "classify", "to": "route" },
    { "from": "draft", "to": "route" },
    { "from": "route", "to": "page" },
    { "from": "route", "to": "reply" }
  ]
}`}
            </CodeBlock>
          </div>
        </div>

        {/* AGENT REPL */}
        <div className="mt-24 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              REPL
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Talk to your agent.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              <InlineCode lang="ts">hyp repl</InlineCode> drops into an
              interactive shell against any agent node. Tools, memory, and
              traces are live. Useful for debugging prompts and verifying that
              the model picks the right tool.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Keyboard className="h-3.5 w-3.5" />
              Tab completes tool names · Ctrl-R searches history · Ctrl-D exits
            </div>
          </div>
          <div className="lg:col-span-7">
            <CodeBlock language="bash" title="hyp repl support-triage:classify">
{`$ hyp repl support-triage:classify
hypero · support-triage > classify
  model: hypero-1   tools: 2   memory: ephemeral

› How do I get a refund for my October invoice?
  → tool: lookup_customer({ id: "cus_8…" })  142 ms
  → tool: list_invoices({ month: "2025-10" })  98 ms
  ↳ intent: "billing", confidence: 0.96
  ↳ summary: "Customer requesting refund for Oct invoice."

› quit
✓ session saved · .hypero/repl/2026-05-24T08-04.json`}
            </CodeBlock>
          </div>
        </div>

        {/* CLOSING CTA */}
        <div className="mt-24 rounded-3xl border border-border bg-card p-8 sm:p-12">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Try it
              </p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                Three commands and you&apos;re building.
              </h3>
              <p className="mt-2 text-muted-foreground">
                The CLI is free, MIT-licensed, and works offline against any
                local model.
              </p>
            </div>
            <div className="flex gap-3">
              <Button href="/studio" size="lg">
                <Sparkles className="h-4 w-4" /> Open studio
              </Button>
              <Button href="/docs" variant="outline" size="lg">
                Read the docs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-mono text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400/70" />
                <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              </span>
              <span>~/projects</span>
            </div>
            <pre className="mt-1 overflow-x-auto px-3 pb-3 text-[12.5px] leading-relaxed font-mono">
              <code>
                <span className="text-foreground/60">$ </span>
                <span className="text-cyan-700 dark:text-cyan-400">npm</span>{" "}
                <span>install -g </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  @hypero/cli
                </span>{" "}
                <span className="text-foreground/40">&amp;&amp;</span>{" "}
                <span className="text-cyan-700 dark:text-cyan-400">hyp</span>{" "}
                <span>login</span>{" "}
                <span className="text-foreground/40">&amp;&amp;</span>{" "}
                <span className="text-cyan-700 dark:text-cyan-400">hyp</span>{" "}
                <span>new</span>{" "}
                <span className="text-rose-600 dark:text-rose-400">my-flow</span>
              </code>
            </pre>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Looking for the source?{" "}
          <Link
            href="/docs"
            className="text-foreground underline-offset-4 hover:underline"
          >
            See the full reference in the docs
          </Link>
          .
        </p>
      </Container>
    </Section>
  );
}
