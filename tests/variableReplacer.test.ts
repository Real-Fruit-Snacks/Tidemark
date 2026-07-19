import { describe, it, expect, beforeEach } from "vitest";
import {
  escapeRegex,
  getVariablePattern,
  invalidatePatternCache,
  findKey,
  getNestedValue,
  replaceVariables,
  getVariableAtPosition,
  replacementForVariable,
  buildVariableEdits,
  scanDocumentVariables,
  MAX_DOCUMENT_SIZE,
} from "../src/variableReplacer";
import { DEFAULT_SETTINGS, PluginSettings, Variable } from "../src/types";

function settings(overrides: Partial<PluginSettings> = {}): PluginSettings {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

beforeEach(() => {
  invalidatePatternCache();
});

describe("escapeRegex", () => {
  it("escapes all regex metacharacters", () => {
    expect(escapeRegex("a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o")).toBe(
      "a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o"
    );
  });

  it("leaves ordinary characters untouched", () => {
    expect(escapeRegex("plain_text-123")).toBe("plain_text-123");
  });
});

describe("getVariablePattern", () => {
  it("matches simple and defaulted variables with default delimiters", () => {
    const pattern = getVariablePattern(settings());
    const text = "a {{name}} b {{ip:1.2.3.4}}";
    const matches = [...text.matchAll(pattern)];
    expect(matches.map((m) => m[1])).toEqual(["name", "ip"]);
    expect(matches[1][2]).toBe("1.2.3.4");
  });

  it("caches the pattern across calls with identical settings", () => {
    const a = getVariablePattern(settings());
    const b = getVariablePattern(settings());
    expect(a).toBe(b);
  });

  it("rebuilds the pattern after cache invalidation", () => {
    const a = getVariablePattern(settings());
    invalidatePatternCache();
    const b = getVariablePattern(settings());
    expect(a).not.toBe(b);
  });

  it("falls back to the default delimiters when a delimiter is over-long (ReDoS guard)", () => {
    const overLong = getVariablePattern(settings({ openDelimiter: "<<<<<<<<<<<<" }));
    // The fallback ignores the over-long delimiter and still matches {{ }}.
    const matches = [..."x {{name}} y".matchAll(overLong)];
    expect(matches.map((m) => m[1])).toEqual(["name"]);
    // It must NOT honor the rejected over-long delimiter.
    expect([..."<<<<<<<<<<<< name >>".matchAll(overLong)]).toHaveLength(0);
  });

  it("supports custom delimiters", () => {
    const pattern = getVariablePattern(
      settings({ openDelimiter: "[[", closeDelimiter: "]]" })
    );
    const matches = [..."x [[foo]] y".matchAll(pattern)];
    expect(matches.map((m) => m[1])).toEqual(["foo"]);
  });
});

describe("findKey", () => {
  it("returns the exact key when present", () => {
    expect(findKey({ Foo: 1 }, "Foo", false)).toBe("Foo");
  });

  it("returns undefined for a case mismatch when case-sensitive", () => {
    expect(findKey({ Foo: 1 }, "foo", false)).toBeUndefined();
  });

  it("matches case-insensitively when enabled", () => {
    expect(findKey({ Foo: 1 }, "foo", true)).toBe("Foo");
  });

  it("refuses forbidden prototype keys", () => {
    expect(findKey({}, "__proto__", true)).toBeUndefined();
    expect(findKey({}, "constructor", true)).toBeUndefined();
    expect(findKey({}, "prototype", true)).toBeUndefined();
  });

  it("returns undefined for non-objects", () => {
    expect(findKey(null, "a", false)).toBeUndefined();
    expect(findKey("str", "a", false)).toBeUndefined();
  });
});

describe("getNestedValue", () => {
  const fm = {
    name: "Alice",
    server: { ip: "10.0.0.1", ports: [22, 80] },
    Mixed: "M",
  };

  it("reads a top-level value", () => {
    expect(getNestedValue(fm, "name")).toBe("Alice");
  });

  it("reads a nested value via dot notation", () => {
    expect(getNestedValue(fm, "server.ip")).toBe("10.0.0.1");
  });

  it("reads an array element via bracket notation", () => {
    expect(getNestedValue(fm, "server.ports[1]")).toBe(80);
  });

  it("returns undefined for a missing path", () => {
    expect(getNestedValue(fm, "server.nope")).toBeUndefined();
  });

  it("honors case-insensitive lookups", () => {
    expect(getNestedValue(fm, "mixed", true)).toBe("M");
    expect(getNestedValue(fm, "mixed", false)).toBeUndefined();
  });

  it("does a literal-key lookup when nested properties are disabled", () => {
    expect(getNestedValue({ "a.b": 5 }, "a.b", false, false)).toBe(5);
    expect(getNestedValue({ a: { b: 5 } }, "a.b", false, false)).toBeUndefined();
  });

  it("refuses to traverse prototype keys", () => {
    expect(getNestedValue(fm, "__proto__.polluted")).toBeUndefined();
  });
});

describe("replaceVariables", () => {
  it("replaces present variables and counts them", () => {
    const r = replaceVariables("{{name}} lives", { name: "Bob" }, settings());
    expect(r.result).toBe("Bob lives");
    expect(r.replacementCount).toBe(1);
    expect(r.missingCount).toBe(0);
  });

  it("uses the inline default when the variable is absent", () => {
    const r = replaceVariables("{{port:443}}", {}, settings());
    expect(r.result).toBe("443");
    expect(r.replacementCount).toBe(1);
  });

  it("treats empty-string frontmatter values as missing", () => {
    const r = replaceVariables("{{name}}", { name: "" }, settings());
    expect(r.result).toBe("[MISSING]");
    expect(r.missingCount).toBe(1);
  });

  it("preserves the original token when configured", () => {
    const r = replaceVariables(
      "{{name}}",
      {},
      settings({ preserveOriginalOnMissing: true })
    );
    expect(r.result).toBe("{{name}}");
    expect(r.missingCount).toBe(1);
  });

  it("joins arrays with the configured separator", () => {
    const r = replaceVariables(
      "{{tags}}",
      { tags: ["a", "b", "c"] },
      settings({ arrayJoinSeparator: " | " })
    );
    expect(r.result).toBe("a | b | c");
  });

  it("serializes objects as JSON", () => {
    const r = replaceVariables("{{obj}}", { obj: { a: 1 } }, settings());
    expect(r.result).toBe('{"a":1}');
  });

  it("skips replacement for documents over the size cap", () => {
    const big = "x".repeat(MAX_DOCUMENT_SIZE + 1);
    const r = replaceVariables(big, { name: "z" }, settings());
    expect(r.result).toBe(big);
    expect(r.replacementCount).toBe(0);
  });
});

describe("getVariableAtPosition", () => {
  const line = "a {{name}} b";

  it("finds the variable when the cursor is inside it", () => {
    const v = getVariableAtPosition(line, 5, settings());
    expect(v?.name).toBe("name");
    expect(v?.status).toBe("missing");
  });

  it("returns null when the cursor is outside any variable", () => {
    expect(getVariableAtPosition(line, 0, settings())).toBeNull();
  });

  it("reports has-default status when a default is present", () => {
    const v = getVariableAtPosition("{{p:8080}}", 3, settings());
    expect(v?.status).toBe("has-default");
    expect(v?.defaultValue).toBe("8080");
  });
});

describe("replacementForVariable", () => {
  it("stringifies an existing scalar value", () => {
    const v: Variable = { name: "n", value: 42, status: "exists" };
    expect(replacementForVariable(v, settings())).toBe("42");
  });

  it("joins an existing array value", () => {
    const v: Variable = { name: "n", value: [1, 2], status: "exists" };
    expect(replacementForVariable(v, settings())).toBe("1, 2");
  });

  it("returns the default for a has-default variable", () => {
    const v: Variable = { name: "n", value: undefined, status: "has-default", defaultValue: "d" };
    expect(replacementForVariable(v, settings())).toBe("d");
  });

  it("returns null for a missing variable when preserving originals", () => {
    const v: Variable = { name: "n", value: undefined, status: "missing" };
    expect(replacementForVariable(v, settings({ preserveOriginalOnMissing: true }))).toBeNull();
  });

  it("returns the missing text otherwise", () => {
    const v: Variable = { name: "n", value: undefined, status: "missing" };
    expect(replacementForVariable(v, settings())).toBe("[MISSING]");
  });
});

describe("scanDocumentVariables + buildVariableEdits", () => {
  const doc = "---\nname: Bob\n---\nHi {{name}} and {{missing}}";

  it("locates variables with correct line/char positions", () => {
    const fm = { name: "Bob" };
    const vars = scanDocumentVariables(doc, fm, 17, settings());
    expect(vars.map((v) => v.name)).toEqual(["name", "missing"]);
    const first = vars[0];
    // Body line "Hi {{name}} ..." is on document line 3 (0-indexed).
    expect(first.position?.line).toBe(3);
    expect(first.position?.start).toBe(3);
    expect(first.status).toBe("exists");
    expect(vars[1].status).toBe("missing");
  });

  it("produces one edit per replaceable variable and skips preserved misses", () => {
    const fm = { name: "Bob" };
    const vars = scanDocumentVariables(doc, fm, 17, settings({ preserveOriginalOnMissing: true }));
    const { edits, replaced, missing } = buildVariableEdits(vars, settings({ preserveOriginalOnMissing: true }));
    expect(replaced).toBe(1);
    expect(missing).toBe(1);
    // Only the "exists" variable yields an edit; the preserved miss is skipped.
    expect(edits).toHaveLength(1);
    expect(edits[0].text).toBe("Bob");
  });
});
