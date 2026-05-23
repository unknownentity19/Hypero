import { cn } from "@/lib/utils";

export function CodeBlock({
  children,
  language = "bash",
  className,
}: {
  children: string;
  language?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-muted/40",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
        <span className="font-mono">{language}</span>
        <span className="font-mono">copy</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-relaxed text-foreground font-mono">
        {children}
      </pre>
    </div>
  );
}
