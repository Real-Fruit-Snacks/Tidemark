import { describe, it, expect } from "vitest";
// `obsidian` is aliased to tests/obsidian-stub.ts via vitest.config.ts, which
// supplies minimal parseYaml/stringifyYaml implementations.
import {
  findFrontmatterEnd,
  parseFrontmatterStrict,
  buildFrontmatterBlock,
  setNestedValue,
} from "../src/frontmatterParser";

describe("findFrontmatterEnd", () => {
  it("returns 0 when there is no frontmatter", () => {
    expect(findFrontmatterEnd("Just a note")).toBe(0);
  });

  it("handles an empty frontmatter block", () => {
    expect(findFrontmatterEnd("---\n---\nbody")).toBe("---\n---\n".length);
  });

  it("returns the offset past a populated block", () => {
    const text = "---\nname: Bob\n---\nbody";
    expect(findFrontmatterEnd(text)).toBe("---\nname: Bob\n---\n".length);
  });

  it("tolerates CRLF line endings", () => {
    const text = "---\r\nname: Bob\r\n---\r\nbody";
    expect(findFrontmatterEnd(text)).toBe("---\r\nname: Bob\r\n---\r\n".length);
  });

  it("returns 0 when the block is never closed", () => {
    expect(findFrontmatterEnd("---\nname: Bob\nno closing fence")).toBe(0);
  });
});

describe("parseFrontmatterStrict", () => {
  it("succeeds with empty data when there is no frontmatter", () => {
    expect(parseFrontmatterStrict("hello")).toEqual({ ok: true, data: {} });
  });

  it("succeeds with empty data for an empty block", () => {
    expect(parseFrontmatterStrict("---\n---\nx")).toEqual({ ok: true, data: {} });
  });

  it("fails closed on an unclosed block", () => {
    const r = parseFrontmatterStrict("---\nname: Bob\nno fence");
    expect(r.ok).toBe(false);
  });

  it("returns parsed data for a valid block", () => {
    const r = parseFrontmatterStrict("---\nname: Bob\n---\nbody");
    expect(r).toEqual({ ok: true, data: { name: "Bob" } });
  });
});

describe("buildFrontmatterBlock", () => {
  it("prepends a new block when the document has none (end 0)", () => {
    const { block, end } = buildFrontmatterBlock("body text", { name: "Bob" });
    expect(end).toBe(0);
    expect(block.startsWith("---\n")).toBe(true);
    expect(block.endsWith("---\n")).toBe(true);
    expect(block).toContain("name: Bob");
  });

  it("merges an update into existing frontmatter and reports its end", () => {
    const text = "---\nname: Bob\n---\nbody";
    const { block, end } = buildFrontmatterBlock(text, { role: "admin" });
    expect(end).toBe(findFrontmatterEnd(text));
    expect(block).toContain("name: Bob");
    expect(block).toContain("role: admin");
  });

  it("throws instead of clobbering an unclosed block", () => {
    expect(() => buildFrontmatterBlock("---\nname: Bob\nno fence", { a: 1 })).toThrow();
  });
});

describe("setNestedValue (prototype-pollution safety)", () => {
  it("sets a simple key", () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, "a", 1);
    expect(obj.a).toBe(1);
  });

  it("creates nested objects via dot notation", () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, "server.ip", "10.0.0.1");
    expect(obj).toEqual({ server: { ip: "10.0.0.1" } });
  });

  it("writes into arrays via bracket notation", () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, "ports[1]", 80);
    expect(obj.ports).toEqual([null, 80]);
  });

  it("refuses __proto__ so the prototype is never polluted", () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, "__proto__.polluted", "yes");
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "polluted")).toBe(false);
  });

  it("refuses constructor and prototype as intermediate keys", () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, "constructor.x", 1);
    setNestedValue(obj, "prototype.y", 2);
    expect(obj.constructor).toBe(Object);
    expect(Object.keys(obj)).toHaveLength(0);
  });

  it("enforces the maximum array index", () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, "big[5000]", "x");
    expect((obj.big as unknown[]).length).toBe(0);
  });

  it("does a direct assignment when nested properties are disabled", () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, "a.b", 5, false);
    expect(obj["a.b"]).toBe(5);
    expect(obj.a).toBeUndefined();
  });
});
