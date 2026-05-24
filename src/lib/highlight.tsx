import * as React from "react";

export type Lang =
  | "bash"
  | "shell"
  | "ts"
  | "tsx"
  | "js"
  | "json"
  | "sql"
  | "yaml"
  | "http"
  | "text";

type TokenName =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "type"
  | "builtin"
  | "function"
  | "operator"
  | "punct"
  | "property"
  | "variable"
  | "tag"
  | "command"
  | "flag"
  | "boolean"
  | "constant"
  | "url"
  | "key"
  | "regex";

const COLOR: Record<TokenName, string> = {
  comment: "text-zinc-400 dark:text-zinc-500 italic",
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-orange-600 dark:text-orange-400",
  keyword: "text-violet-600 dark:text-violet-400",
  type: "text-amber-600 dark:text-amber-400",
  builtin: "text-sky-600 dark:text-sky-400",
  function: "text-blue-600 dark:text-blue-400",
  operator: "text-foreground/70",
  punct: "text-foreground/60",
  property: "text-pink-600 dark:text-pink-400",
  variable: "text-rose-600 dark:text-rose-400",
  tag: "text-rose-600 dark:text-rose-400",
  command: "text-cyan-700 dark:text-cyan-400",
  flag: "text-amber-700 dark:text-amber-300",
  boolean: "text-blue-600 dark:text-blue-400",
  constant: "text-blue-600 dark:text-blue-400",
  url: "text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/40",
  key: "text-pink-600 dark:text-pink-400",
  regex: "text-red-600 dark:text-red-400",
};

type Rule = { name: TokenName; pattern: string };

// Each rule's pattern must use only non-capturing groups (?:...) since the
// composite regex relies on a single named group per rule.
const COMMON_STRING =
  String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\`(?:[^\\\`]|\\.)*\``;

const GRAMMARS: Record<Lang, Rule[]> = {
  text: [],
  bash: [
    { name: "comment", pattern: String.raw`#.*` },
    { name: "string", pattern: COMMON_STRING },
    {
      name: "command",
      pattern: String.raw`(?:^|\n|;|&&|\|\|)\s*(?:hypero|npm|pnpm|yarn|npx|node|deno|bun|git|docker|kubectl|curl|wget|cat|ls|cd|mkdir|rm|cp|mv|echo|export|sudo|brew|apt|apt-get|psql|sqlite3|ssh|scp|tar|grep|sed|awk|find|env|source|chmod|chown|make)\b`,
    },
    { name: "flag", pattern: String.raw`(?:^|\s)--?[\w-]+` },
    { name: "url", pattern: String.raw`https?://[\w./:%#?=&+~-]+` },
    { name: "variable", pattern: String.raw`\$\{?\w+\}?` },
    { name: "number", pattern: String.raw`\b\d+(?:\.\d+)?\b` },
    { name: "operator", pattern: String.raw`\|\||&&|[|&;><]` },
  ],
  shell: [
    { name: "comment", pattern: String.raw`#.*` },
    { name: "string", pattern: COMMON_STRING },
    {
      name: "command",
      pattern: String.raw`(?:^|\n|;|&&|\|\|)\s*(?:hypero|npm|pnpm|yarn|npx|node|deno|bun|git|docker|kubectl|curl|wget|cat|ls|cd|mkdir|rm|cp|mv|echo|export|sudo|brew|apt|apt-get|psql|sqlite3|ssh|scp|tar|grep|sed|awk|find|env|source|chmod|chown|make)\b`,
    },
    { name: "flag", pattern: String.raw`(?:^|\s)--?[\w-]+` },
    { name: "url", pattern: String.raw`https?://[\w./:%#?=&+~-]+` },
    { name: "variable", pattern: String.raw`\$\{?\w+\}?` },
    { name: "number", pattern: String.raw`\b\d+(?:\.\d+)?\b` },
    { name: "operator", pattern: String.raw`\|\||&&|[|&;><]` },
  ],
  ts: [
    { name: "comment", pattern: String.raw`//[^\n]*|/\*[\s\S]*?\*/` },
    { name: "string", pattern: COMMON_STRING },
    {
      name: "keyword",
      pattern: String.raw`\b(?:const|let|var|function|return|if|else|for|while|do|import|export|from|as|async|await|class|new|throw|try|catch|finally|switch|case|break|continue|default|extends|implements|interface|type|enum|in|of|this|super|void|yield|delete|typeof|instanceof|with|public|private|protected|readonly|static|abstract|declare|namespace|module|satisfies)\b`,
    },
    {
      name: "boolean",
      pattern: String.raw`\b(?:true|false|null|undefined)\b`,
    },
    {
      name: "type",
      pattern: String.raw`\b(?:string|number|boolean|bigint|symbol|any|unknown|never|object|Promise|Array|Record|Partial|Required|Pick|Omit|Readonly|Map|Set|Date|Error|RegExp|JSON|Math|Object|Array)\b`,
    },
    {
      name: "function",
      pattern: String.raw`\b[a-zA-Z_$][\w$]*(?=\s*\()`,
    },
    {
      name: "property",
      pattern: String.raw`(?<=\.)[a-zA-Z_$][\w$]*`,
    },
    { name: "number", pattern: String.raw`\b\d+(?:\.\d+)?\b` },
    { name: "operator", pattern: String.raw`=>|===|!==|==|!=|<=|>=|&&|\|\||\+\+|--|[+\-*/%=<>!&|^~?:]` },
    { name: "punct", pattern: String.raw`[{}()\[\];,.]` },
  ],
  tsx: [],
  js: [],
  json: [
    { name: "key", pattern: String.raw`"(?:[^"\\]|\\.)*"(?=\s*:)` },
    { name: "string", pattern: String.raw`"(?:[^"\\]|\\.)*"` },
    { name: "boolean", pattern: String.raw`\b(?:true|false|null)\b` },
    { name: "number", pattern: String.raw`-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b` },
    { name: "punct", pattern: String.raw`[{}\[\]:,]` },
  ],
  sql: [
    { name: "comment", pattern: String.raw`--[^\n]*` },
    { name: "string", pattern: String.raw`'(?:[^'\\]|\\.)*'` },
    {
      name: "keyword",
      pattern:
        String.raw`\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|NULL|LIMIT|OFFSET|ORDER|BY|GROUP|HAVING|CASE|WHEN|THEN|ELSE|END|DISTINCT|RETURNING|CONFLICT|DO|NOTHING|EXISTS|IN|UNION|ALL|WITH|VIEW|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|CHECK|UNIQUE|CONSTRAINT|BEGIN|COMMIT|ROLLBACK)\b`,
    },
    { name: "function", pattern: String.raw`\b[a-zA-Z_][\w]*(?=\s*\()` },
    { name: "number", pattern: String.raw`\b\d+(?:\.\d+)?\b` },
    { name: "punct", pattern: String.raw`[(),;]` },
  ],
  yaml: [
    { name: "comment", pattern: String.raw`#[^\n]*` },
    { name: "string", pattern: COMMON_STRING },
    {
      name: "key",
      pattern: String.raw`(?:^|\n)[\s-]*[\w.-]+(?=\s*:)`,
    },
    { name: "boolean", pattern: String.raw`\b(?:true|false|null|yes|no|on|off)\b` },
    { name: "number", pattern: String.raw`\b\d+(?:\.\d+)?\b` },
    { name: "operator", pattern: String.raw`[:|>-]` },
  ],
  http: [
    {
      name: "keyword",
      pattern: String.raw`\b(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b`,
    },
    { name: "url", pattern: String.raw`https?://[\w./:%#?=&+~-]+|/[\w./:%#?=&+~-]*` },
    { name: "string", pattern: COMMON_STRING },
    { name: "property", pattern: String.raw`(?:^|\n)[A-Z][\w-]*(?=:)` },
    { name: "number", pattern: String.raw`\b\d+\b` },
  ],
};

// Aliases share the ts grammar.
GRAMMARS.tsx = GRAMMARS.ts;
GRAMMARS.js = GRAMMARS.ts;

const compiled = new Map<Lang, RegExp>();

function getRegex(lang: Lang): RegExp | null {
  if (compiled.has(lang)) return compiled.get(lang)!;
  const rules = GRAMMARS[lang];
  if (!rules || rules.length === 0) {
    compiled.set(lang, null as unknown as RegExp);
    return null;
  }
  // Wrap each rule's pattern in a single named group.
  const parts = rules.map((r, i) => `(?<g${i}_${r.name}>${r.pattern})`);
  const re = new RegExp(parts.join("|"), "gms");
  compiled.set(lang, re);
  return re;
}

type Token = { type: TokenName | "text"; text: string };

export function tokenize(code: string, lang: Lang = "text"): Token[] {
  const re = getRegex(lang);
  if (!re) return [{ type: "text", text: code }];
  re.lastIndex = 0;
  const tokens: Token[] = [];
  let lastEnd = 0;
  for (const m of code.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > lastEnd) {
      tokens.push({ type: "text", text: code.slice(lastEnd, start) });
    }
    const groupName = Object.entries(m.groups ?? {}).find(
      ([, v]) => v != null,
    )?.[0];
    const typeName = (groupName?.split("_")[1] as TokenName) ?? "text";
    tokens.push({ type: typeName, text: m[0] });
    lastEnd = start + m[0].length;
  }
  if (lastEnd < code.length) {
    tokens.push({ type: "text", text: code.slice(lastEnd) });
  }
  return tokens;
}

export function Highlight({
  code,
  lang = "text",
}: {
  code: string;
  lang?: Lang;
}) {
  const tokens = React.useMemo(() => tokenize(code, lang), [code, lang]);
  return (
    <>
      {tokens.map((t, i) =>
        t.type === "text" ? (
          <span key={i}>{t.text}</span>
        ) : (
          <span key={i} className={COLOR[t.type]}>
            {t.text}
          </span>
        ),
      )}
    </>
  );
}

/** Short inline code token with subtle background. */
export function InlineCode({
  children,
  lang = "ts",
  className,
}: {
  children: string;
  lang?: Lang;
  className?: string;
}) {
  return (
    <code
      className={[
        "rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[0.9em]",
        className ?? "",
      ].join(" ")}
    >
      <Highlight code={children} lang={lang} />
    </code>
  );
}
