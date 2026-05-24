"use client";

import { Trash2 } from "lucide-react";
import { NODE_META } from "./node-meta";
import type { ProjectNode } from "@/lib/projects";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  node: ProjectNode | null;
  onChange: (patch: Partial<Omit<ProjectNode, "id">>) => void;
  onDelete: () => void;
};

export function Inspector({ node, onChange, onDelete }: Props) {
  if (!node) {
    return (
      <aside className="flex h-full w-72 flex-col border-l border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Inspector
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 text-center text-xs text-muted-foreground">
          Select a node on the canvas to edit its configuration.
        </div>
      </aside>
    );
  }

  const meta = NODE_META[node.type];
  const Icon = meta.icon;

  const updateConfig = (key: string, value: string) => {
    onChange({ config: { [key]: value } });
  };

  return (
    <aside className="flex h-full w-80 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md border",
              meta.accent,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {meta.label}
            </p>
            <p className="text-[13px] font-medium text-foreground">
              {node.label}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-red-500"
          aria-label="Delete node"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={node.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
        </div>

        {node.type === "trigger" ? (
          <>
            <SelectField
              label="Trigger type"
              value={node.config.triggerType ?? "webhook"}
              onChange={(v) => updateConfig("triggerType", v)}
              options={[
                { value: "webhook", label: "Webhook" },
                { value: "schedule", label: "Schedule (cron)" },
                { value: "manual", label: "Manual" },
              ]}
            />
            {node.config.triggerType === "schedule" ? (
              <TextField
                label="Cron expression"
                value={node.config.cron ?? ""}
                placeholder="0 9 * * *"
                onChange={(v) => updateConfig("cron", v)}
                mono
              />
            ) : null}
          </>
        ) : null}

        {node.type === "llm" ? (
          <>
            <SelectField
              label="Model"
              value={node.config.model ?? "hypero-1"}
              onChange={(v) => updateConfig("model", v)}
              options={[
                { value: "hypero-1", label: "hypero-1 (default)" },
                { value: "hypero-1-mini", label: "hypero-1-mini (fast)" },
                { value: "hypero-1-pro", label: "hypero-1-pro (smart)" },
              ]}
            />
            <TextAreaField
              label="System prompt"
              value={node.config.prompt ?? ""}
              onChange={(v) => updateConfig("prompt", v)}
              placeholder="You are a helpful assistant…"
              rows={6}
            />
          </>
        ) : null}

        {node.type === "http" ? (
          <>
            <SelectField
              label="Method"
              value={node.config.method ?? "GET"}
              onChange={(v) => updateConfig("method", v)}
              options={[
                { value: "GET", label: "GET" },
                { value: "POST", label: "POST" },
                { value: "PUT", label: "PUT" },
                { value: "DELETE", label: "DELETE" },
              ]}
            />
            <TextField
              label="URL"
              value={node.config.url ?? ""}
              onChange={(v) => updateConfig("url", v)}
              placeholder="https://api.example.com/v1"
              mono
            />
          </>
        ) : null}

        {node.type === "condition" ? (
          <TextAreaField
            label="Predicate"
            value={node.config.expression ?? ""}
            onChange={(v) => updateConfig("expression", v)}
            placeholder="result.score >= 80"
            rows={3}
            mono
          />
        ) : null}

        {node.type === "transform" ? (
          <TextAreaField
            label="Expression"
            value={node.config.expression ?? ""}
            onChange={(v) => updateConfig("expression", v)}
            placeholder="{ id: payload.id, name: payload.name }"
            rows={4}
            mono
          />
        ) : null}

        {node.type === "database" ? (
          <>
            <TextField
              label="Table"
              value={node.config.table ?? ""}
              onChange={(v) => updateConfig("table", v)}
              placeholder="leads"
              mono
            />
            <TextAreaField
              label="SQL"
              value={node.config.query ?? ""}
              onChange={(v) => updateConfig("query", v)}
              placeholder="INSERT INTO …"
              rows={4}
              mono
            />
          </>
        ) : null}

        {node.type === "slack" ? (
          <>
            <TextField
              label="Channel"
              value={node.config.channel ?? ""}
              onChange={(v) => updateConfig("channel", v)}
              placeholder="#alerts"
              mono
            />
            <TextAreaField
              label="Message"
              value={node.config.message ?? ""}
              onChange={(v) => updateConfig("message", v)}
              placeholder="New event: {{payload.title}}"
              rows={3}
            />
          </>
        ) : null}

        {node.type === "output" ? (
          <TextField
            label="Destination"
            value={node.config.destination ?? ""}
            onChange={(v) => updateConfig("destination", v)}
            placeholder="api-response"
            mono
          />
        ) : null}

        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-3 text-[11px] text-muted-foreground">
          <p className="font-medium text-foreground">Node id</p>
          <p className="mt-1 font-mono break-all">{node.id}</p>
        </div>
      </div>
    </aside>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={mono ? "font-mono text-[12px]" : undefined}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40",
          "transition-colors resize-y",
          mono && "font-mono text-[12px] leading-relaxed",
        )}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40",
          "transition-colors",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
