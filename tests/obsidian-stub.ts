// Test-only stand-in for the parts of the Obsidian API that pure modules
// import. The real `obsidian` package ships types only (no runtime entry), so
// it cannot be imported under Vitest; this stub is aliased in via
// vitest.config.ts. It implements just enough of parseYaml/stringifyYaml to
// exercise Tidemark's frontmatter block detection and merge logic.

export function parseYaml(s: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const line of s.split("\n")) {
    const m = line.match(/^([\w.-]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export function stringifyYaml(o: Record<string, unknown>): string {
  return (
    Object.entries(o)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join("\n") + "\n"
  );
}
