import { describe, it, expect } from "vitest";
import { sanitizeFilename } from "../src/utils/fileOperations";

describe("sanitizeFilename", () => {
  it("returns null for empty input", () => {
    expect(sanitizeFilename("")).toBeNull();
  });

  it("replaces characters that are invalid across platforms with dashes", () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe("a-b-c-d-e-f-g-h-i-j");
  });

  it("collapses runs of whitespace and trims", () => {
    expect(sanitizeFilename("  hello    world  ")).toBe("hello world");
  });

  it("strips leading and trailing dots", () => {
    expect(sanitizeFilename("...report...")).toBe("report");
  });

  it("prefixes Windows reserved device names", () => {
    expect(sanitizeFilename("CON")).toBe("_CON");
    expect(sanitizeFilename("com1")).toBe("_com1");
    expect(sanitizeFilename("LPT9")).toBe("_LPT9");
  });

  it("returns null when nothing survives sanitization", () => {
    expect(sanitizeFilename("...")).toBeNull();
    expect(sanitizeFilename("   ")).toBeNull();
  });

  it("leaves a clean name unchanged", () => {
    expect(sanitizeFilename("2026-report v2")).toBe("2026-report v2");
  });
});
