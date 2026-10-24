import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

const origin = "https://machmaso.example";

describe("safeNextPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeNextPath("/", origin)).toBe("/");
    expect(safeNextPath("/?view=list#discover", origin)).toBe(
      "/?view=list#discover",
    );
    expect(safeNextPath(`${origin}/somewhere`, origin)).toBe("/somewhere");
  });

  it("falls back to / for missing or external targets", () => {
    for (const next of [
      null,
      "",
      "https://evil.example/",
      "//evil.example",
      "/\\evil.example",
      "\\\\evil.example",
      " //evil.example",
      "javascript:alert(1)",
      "https://machmaso.example.evil.example/",
      "http://machmaso.example/",
      "/\tevil",
    ])
      expect(safeNextPath(next, origin)).toBe("/");
  });

  it("does not redirect back into auth callbacks", () => {
    expect(safeNextPath("/auth/confirm?next=/", origin)).toBe("/");
    expect(safeNextPath(`${origin}/auth/confirm`, origin)).toBe("/");
  });
});
