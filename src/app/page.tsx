import {
  ArrowRight,
  Bot,
  Boxes,
  CheckCircle2,
  Code2,
  Database,
  GitBranch,
  Globe,
  Lock,
  MessageSquare,
  Quote,
  Shield,
  Sparkles,
  Star,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { WorkflowPreview } from "@/components/visuals/workflow-preview";
import { FloatingNodes } from "@/components/visuals/floating-nodes";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IntegrationIcon } from "@/components/visuals/integration-icons";
import { CodeBlock } from "@/components/docs/code-block";

const TRUSTED = [
  "Linear",
  "Loom",
  "Vercel",
  "Notion",
  "Stripe",
  "Retool",
  "Ramp",
];

const VALUE_PROPS = [
  {
    icon: <Workflow className="h-4 w-4" />,
    title: "Visual canvas",
    desc: "Compose triggers, agents, integrations, and logic on a single surface anyone on your team can read.",
  },
  {
    icon: <Bot className="h-4 w-4" />,
    title: "AI agents as steps",
    desc: "Drop reasoning into any workflow. Memory, tool-calling, and guardrails are first class — not bolt-ons.",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    title: "Production runtime",
    desc: "Durable retries, version history, audit logs, and an API endpoint per workflow. Ship to prod from day one.",
  },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Design on the canvas",
    desc: "Drag triggers, agents, integrations, and logic onto a shared canvas. Iterate live with your team.",
    icon: <Workflow className="h-4 w-4" />,
  },
  {
    n: "02",
    title: "Plug in intelligence",
    desc: "Configure agents with tools and memory, or call any model from a node. Use ours, or bring your own keys.",
    icon: <Bot className="h-4 w-4" />,
  },
  {
    n: "03",
    title: "Ship to production",
    desc: "Every workflow is automatically a versioned API endpoint with observability, retries, and audit logs.",
    icon: <Boxes className="h-4 w-4" />,
  },
];

const FEATURE_CARDS = [
  {
    icon: <Workflow className="h-4 w-4" />,
    title: "Visual workflow builder",
    desc: "A canvas with nodes for triggers, branches, loops, and integrations. Multiplayer by default.",
    href: "/features#workflow-builder",
  },
  {
    icon: <Bot className="h-4 w-4" />,
    title: "AI agent runtime",
    desc: "Agents with tools, memory, and structured reasoning traces. Hot-swap models per workflow.",
    href: "/features#agents",
  },
  {
    icon: <GitBranch className="h-4 w-4" />,
    title: "Durable execution",
    desc: "Retries, parallel branches, dynamic loops, pause-and-resume — exactly-once semantics built in.",
    href: "/features#multi-step",
  },
  {
    icon: <Globe className="h-4 w-4" />,
    title: "200+ integrations",
    desc: "Native connectors for Slack, Postgres, GitHub, Stripe, and a generic HTTP node for everything else.",
    href: "/features#integrations",
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Reasoning observability",
    desc: "Replay any agent run, diff plans side-by-side, and pin issues directly on the canvas.",
    href: "/features#reasoning",
  },
  {
    icon: <Code2 className="h-4 w-4" />,
    title: "Typed API & SDK",
    desc: "Every workflow ships as a typed REST endpoint and a TypeScript SDK with auto-generated types.",
    href: "/features#api",
  },
];

const INTEGRATIONS = [
  "OpenAI",
  "Anthropic",
  "Slack",
  "Postgres",
  "Notion",
  "GitHub",
  "Linear",
  "Stripe",
  "HubSpot",
  "Sendgrid",
  "AWS",
  "HTTP",
];

const STATS = [
  { value: "12k+", label: "Active builders" },
  { value: "3M+", label: "Runs per day" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "184ms", label: "Avg. p95 latency" },
];

const TESTIMONIALS = [
  {
    quote:
      "We replaced three internal tools, two cron jobs, and a Zapier account with a single Hypero workflow. Our ops team owns it now.",
    name: "Amelia Chen",
    role: "Head of RevOps · Lattice",
    initials: "AC",
  },
  {
    quote:
      "Hypero is the first agent platform that feels like real software. Versioning, replay, observability — it all just works.",
    name: "Jonas Becker",
    role: "Founding engineer · Modal",
    initials: "JB",
  },
  {
    quote:
      "Our prototype-to-production loop went from weeks to hours. The canvas is the source of truth, the API is the deploy artifact.",
    name: "Priya Raman",
    role: "Engineering lead · Linear",
    initials: "PR",
  },
];

const SECURITY = [
  {
    icon: <Shield className="h-4 w-4" />,
    title: "SOC 2 Type II",
    desc: "Audited annually with full controls coverage.",
  },
  {
    icon: <Lock className="h-4 w-4" />,
    title: "End-to-end encryption",
    desc: "TLS in transit, AES-256 at rest, scoped credentials.",
  },
  {
    icon: <Database className="h-4 w-4" />,
    title: "BYO cloud",
    desc: "Run Hypero in your AWS, GCP, or Azure VPC.",
  },
  {
    icon: <MessageSquare className="h-4 w-4" />,
    title: "GDPR & DPA ready",
    desc: "Custom DPAs and EU data residency available.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <Section className="relative overflow-hidden pt-14 pb-24 sm:pt-20">
        <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade animate-grid" />
        <div
          className="orb -z-10"
          style={{
            background: "rgb(var(--gradient-from))",
            width: 380,
            height: 380,
            left: "-6%",
            top: "8%",
            opacity: 0.35,
          }}
        />
        <div
          className="orb -z-10"
          style={{
            background: "rgb(var(--gradient-to))",
            width: 320,
            height: 320,
            right: "-4%",
            top: "12%",
            opacity: 0.3,
          }}
        />

        <FloatingNodes />

        <Container className="relative">
          <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-12">
            {/* Left column: copy + CTAs + install */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Reveal>
                <a
                  href="/terminal"
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-mono">v1.0</span>
                  <span className="text-foreground/40">·</span>
                  <span>Studio + CLI are live</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </a>
              </Reveal>

              <Reveal delay={0.08}>
                <h1 className="text-[2.75rem] sm:text-6xl md:text-[4.25rem] font-semibold tracking-[-0.025em] leading-[1.02]">
                  <span className="block">Build AI workflows</span>
                  <span className="block">
                    <span className="text-foreground/45 font-normal">with </span>
                    <span className="font-serif italic font-normal text-gradient">
                      production
                    </span>
                    <span className="text-foreground"> code.</span>
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.16}>
                <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                  A visual canvas, an AI agent runtime, and a CLI — built for
                  engineers who&apos;d rather ship the workflow than wire the
                  glue around it.
                </p>
              </Reveal>

              <Reveal delay={0.22}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Button href="/studio" size="lg">
                    <Sparkles className="h-4 w-4" />
                    Open studio
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button href="/signup" size="lg" variant="outline">
                    Get started
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-1">
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Free for personal use
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    No credit card
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Visual + code, same project
                  </li>
                </ul>
              </Reveal>

              <Reveal delay={0.38} className="pt-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Terminal className="h-3 w-3" />
                  Or install the CLI
                </div>
                <div className="mt-2 max-w-xl">
                  <CodeBlock language="bash" title="~/projects">
{`# Install the CLI, sign in, scaffold a workflow from a prompt
$ npm install -g @hypero/cli && hyp login
$ hyp new lead-router --from "score leads and notify slack"
✓ 6 nodes · 5 edges · ready in ./lead-router`}
                  </CodeBlock>
                </div>
              </Reveal>
            </div>

            {/* Right column: stacked preview + mini run log */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Reveal delay={0.18}>
                <div className="relative">
                  <div
                    className="absolute -inset-3 -z-10 rounded-3xl opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(var(--gradient-from) / 0.18), rgb(var(--gradient-to) / 0.18))",
                      filter: "blur(40px)",
                    }}
                    aria-hidden
                  />
                  <WorkflowPreview />
                </div>
              </Reveal>

              <Reveal delay={0.32}>
                <div className="overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur">
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5 text-[11px] font-mono text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                      </span>
                      hyp run lead-router
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      live
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-3 py-3 text-[12px] leading-relaxed font-mono">
                    <code>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        →
                      </span>{" "}
                      <span className="text-foreground">trigger:webhook</span>
                      <span className="text-foreground/40">
                        {"  ".padEnd(8)}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ok
                      </span>{" "}
                      <span className="text-orange-600 dark:text-orange-400">
                        12ms
                      </span>
                      {"\n"}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        →
                      </span>{" "}
                      <span className="text-foreground">http:enrich</span>
                      <span className="text-foreground/40">{"     "}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ok
                      </span>{" "}
                      <span className="text-orange-600 dark:text-orange-400">
                        142ms
                      </span>
                      {"\n"}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        →
                      </span>{" "}
                      <span className="text-foreground">llm:score</span>
                      <span className="text-foreground/40">{"       "}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ok
                      </span>{" "}
                      <span className="text-orange-600 dark:text-orange-400">
                        612ms
                      </span>{" "}
                      <span className="text-foreground/40">{"{ "}</span>
                      <span className="text-pink-600 dark:text-pink-400">
                        score
                      </span>
                      <span className="text-foreground/40">: </span>
                      <span className="text-orange-600 dark:text-orange-400">
                        86
                      </span>
                      <span className="text-foreground/40">{" }"}</span>
                      {"\n"}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        →
                      </span>{" "}
                      <span className="text-foreground">if score≥80</span>
                      <span className="text-foreground/40">{"      "}</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        true
                      </span>
                      {"\n"}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        →
                      </span>{" "}
                      <span className="text-foreground">slack:notify</span>
                      <span className="text-foreground/40">{"    "}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ok
                      </span>{" "}
                      <span className="text-orange-600 dark:text-orange-400">
                        98ms
                      </span>
                      {"\n"}
                      <span className="text-violet-600 dark:text-violet-400">
                        ✓
                      </span>{" "}
                      <span className="text-foreground">workflow ok</span>{" "}
                      <span className="text-foreground/40">·</span>{" "}
                      <span className="text-orange-600 dark:text-orange-400">
                        865ms
                      </span>
                    </code>
                  </pre>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* TRUSTED BY */}
      <Section className="py-10">
        <Container>
          <Reveal>
            <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
              Trusted by builders at fast-moving teams
            </p>
          </Reveal>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {TRUSTED.map((name) => (
              <span
                key={name}
                className="text-base font-semibold tracking-tight text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      {/* VALUE PROPS */}
      <Section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="Why Hypero"
            title="The fastest path from idea to AI in production."
            description="Hypero replaces the patchwork of automation tools, prompt scripts, and custom backends with a single canvas built for both prototyping and production."
          />
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {VALUE_PROPS.map((v) => (
              <StaggerItem key={v.title}>
                <Card className="h-full">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-accent text-foreground">
                    {v.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      {/* HOW IT WORKS */}
      <Section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="How it works"
            title="Three steps. No glue code."
            description="From whiteboard to production in an afternoon."
          />
          <div className="relative mt-14">
            <div
              className="absolute left-0 right-0 top-9 hidden h-px bg-border md:block"
              aria-hidden
            />
            <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <StaggerItem key={step.n}>
                  <div className="relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                        {step.icon}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {step.n}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </Container>
      </Section>

      {/* FEATURE GRID */}
      <Section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="Platform"
            title="Everything you need, in one product."
            description="Each capability is a fully-developed feature, not a checkbox. Click any to dive deeper."
          />
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((f) => (
              <StaggerItem key={f.title}>
                <a href={f.href} className="block h-full">
                  <Card className="h-full">
                    <div className="flex items-start justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-accent text-foreground">
                        {f.icon}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </Card>
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      {/* INTEGRATIONS */}
      <Section className="py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <Reveal>
                <Badge variant="outline">Integrations</Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                  Connect Hypero to anything you already run.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Native connectors for the tools your team already uses, and a
                  first-class HTTP node for everything else. OAuth, API keys,
                  and scoped service accounts ship in the box.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    "OAuth + API key auth",
                    "Generic HTTP / GraphQL",
                    "Scoped service accounts",
                    "Custom JS / Python steps",
                  ].map((l) => (
                    <li
                      key={l}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-foreground" />
                      <span className="text-muted-foreground">{l}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-8 flex gap-3">
                  <Button href="/features#integrations" variant="outline">
                    Browse integrations
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-7">
              <Reveal delay={0.1}>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {INTEGRATIONS.map((name) => (
                    <div
                      key={name}
                      className="group flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card transition-all hover:border-border-strong hover:-translate-y-0.5"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent border border-border text-foreground transition-colors group-hover:bg-background">
                        <IntegrationIcon name={name} className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* STATS */}
      <Section className="py-20">
        <Container>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-start gap-1 bg-card p-6 sm:p-8"
              >
                <span className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  {s.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="What customers say"
            title="Loved by ops, eng, and AI teams."
            description="Hypero powers AI workflows at startups, scale-ups, and Fortune 500s."
          />
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <Card className="h-full flex flex-col gap-5">
                  <Quote className="h-5 w-5 text-foreground/30" />
                  <p className="text-[15px] leading-relaxed text-foreground/90">
                    {t.quote}
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                      {t.initials}
                    </span>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-center">
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-foreground text-foreground"
                  />
                ))}
              </span>
              <span>4.9 / 5 across 320+ reviews on G2 and Product Hunt</span>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* SECURITY */}
      <Section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="Security & compliance"
            title="Built for teams who care about both."
            description="Hypero is designed from day one for teams shipping AI in regulated environments."
          />
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {SECURITY.map((s) => (
              <StaggerItem key={s.title}>
                <Card className="h-full" hover={false}>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-accent text-foreground">
                    {s.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      {/* DEVELOPER FRIENDLY */}
      <Section className="py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 items-center">
            <div className="md:col-span-6">
              <Reveal>
                <Badge variant="outline">For developers</Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                  Visual canvas. Real code underneath.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Every workflow is a versioned artifact. Define it visually,
                  in YAML, or both — they always stay in sync. Each deploy
                  produces a typed REST endpoint and a TypeScript SDK.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    "Typed REST + TypeScript SDK per workflow",
                    "Custom JS or Python in any node",
                    "CLI for local dev, deploys, and rollbacks",
                    "Bring-your-own model providers",
                  ].map((l) => (
                    <li
                      key={l}
                      className="flex items-start gap-3 text-sm text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" />
                      <span className="text-muted-foreground">{l}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-8 flex gap-3">
                  <Button href="/docs">
                    Read the docs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-6">
              <Reveal delay={0.1}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                    <span className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      lead-router.ts
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-5 py-5 text-[12.5px] leading-relaxed font-mono text-foreground">
{`import { hypero } from "@hypero/sdk";

const client = hypero({ apiKey: process.env.HYP! });

const result = await client.workflows
  .leadRouter
  .run({
    email: "ada@hypero.dev",
    source: "website",
  });

console.log(result.priority);   // "high"
console.log(result.assignedTo); // "sales-east"`}
                  </pre>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* FINAL CTA */}
      <Section className="pt-10 pb-4">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-16 text-center">
            <div
              className="absolute inset-0 -z-10 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgb(var(--gradient-via) / 0.4) 0%, transparent 60%)",
              }}
              aria-hidden
            />
            <div className="absolute inset-0 -z-20 bg-grid bg-grid-fade" aria-hidden />
            <div className="flex flex-col items-center gap-5 max-w-2xl mx-auto">
              <Badge variant="outline">Get started</Badge>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                Ship something intelligent today.
              </h2>
              <p className="text-muted-foreground">
                Spin up a workspace, drop in a trigger, and ship your first
                AI-powered workflow in under five minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button href="/signup" size="lg">
                  Start building free <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/pricing" size="lg" variant="outline">
                  See pricing
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                No credit card · Cancel anytime · SOC 2 Type II
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
