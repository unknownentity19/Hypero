"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Highlight, type Lang } from "@/lib/highlight";
import { cn } from "@/lib/utils";

export function CodeBlock({
  children,
  language = "bash",
  className,
  title,
  showLineNumbers = false,
}: {
  children: string;
  language?: Lang | string;
  className?: string;
  title?: string;
  showLineNumbers?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(children);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const lang = (
    [
      "bash",
      "shell",
      "ts",
      "tsx",
      "js",
      "json",
      "sql",
      "yaml",
      "http",
      "text",
    ] as const
  ).includes(language as Lang)
    ? (language as Lang)
    : "text";

  const lines = children.split("\n");

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-muted/40",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
        <span className="font-mono inline-flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          </span>
          <span>{title ?? language}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 font-mono transition-colors hover:border-border hover:bg-background hover:text-foreground"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" /> copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-relaxed font-mono">
        {showLineNumbers ? (
          <code className="block">
            {lines.map((line, i) => (
              <span key={i} className="grid grid-cols-[2rem_1fr]">
                <span className="select-none pr-3 text-right text-muted-foreground/60">
                  {i + 1}
                </span>
                <span>
                  <Highlight code={line === "" ? " " : line} lang={lang} />
                </span>
              </span>
            ))}
          </code>
        ) : (
          <code>
            <Highlight code={children} lang={lang} />
          </code>
        )}
      </pre>
    </div>
  );
}
