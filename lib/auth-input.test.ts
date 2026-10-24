import { describe, expect, it } from "vitest";
import { displayName, parseSignIn, parseSignUp } from "./auth-input";

describe("parseSignIn", () => {
  it("normalizes the email", () => {
    expect(parseSignIn({ email: " Ana@Example.COM ", password: "x" })).toEqual({
      ok: true,
      email: "ana@example.com",
      password: "x",
    });
  });
  it("rejects bad input", () => {
    expect(parseSignIn({ email: "nope", password: "x" })).toMatchObject({
      error: "email",
    });
    expect(parseSignIn({ email: "a@b.de" })).toMatchObject({
      error: "password",
    });
    expect(parseSignIn(null)).toMatchObject({ ok: false });
  });
});

describe("parseSignUp", () => {
  const valid = { email: "a@b.de", password: "long enough", name: " Ana " };
  it("accepts valid input and trims the name", () => {
    expect(parseSignUp(valid)).toMatchObject({ ok: true, name: "Ana" });
  });
  it("enforces password and name limits", () => {
    expect(parseSignUp({ ...valid, password: "short" })).toMatchObject({
      error: "password",
    });
    expect(parseSignUp({ ...valid, password: "ä".repeat(37) })).toMatchObject({
      error: "password",
    });
    expect(parseSignUp({ ...valid, name: "  " })).toMatchObject({
      error: "name",
    });
    expect(parseSignUp({ ...valid, name: "x".repeat(41) })).toMatchObject({
      error: "name",
    });
  });
});

describe("displayName", () => {
  it("uses the sign-up name or a neutral fallback", () => {
    expect(displayName({ display_name: " Ana " })).toBe("Ana");
    expect(displayName({})).toBe("Neighbor");
    expect(displayName(null)).toBe("Neighbor");
    expect(displayName({ display_name: "x".repeat(41) })).toBe("Neighbor");
  });
});
