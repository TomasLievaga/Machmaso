import { describe, expect, it } from "vitest";
import { parseListingInput, type ListingInput } from "./listing-input";

const today = "2026-10-24";
const base: ListingInput = {
  title: "  Evening rally  ",
  description: "A friendly game.",
  intention: "together",
  category: "tennis",
  neighborhood: "Lehel",
  mode: "arrangement",
  date: "",
  start: "",
  end: "",
  days: [],
  compensation: "free",
  amount: "",
  unit: "",
  offer: "",
  wanted: "",
};
const parse = (patch: Partial<Record<keyof ListingInput, unknown>>) =>
  parseListingInput({ ...base, ...patch }, today);
const errorOf = (patch: Partial<Record<keyof ListingInput, unknown>>) => {
  const result = parse(patch);
  return result.ok ? null : result.error;
};

describe("parseListingInput", () => {
  it("accepts a minimal listing and trims text", () => {
    const result = parse({});
    expect(result).toEqual({
      ok: true,
      draft: {
        title: "Evening rally",
        description: "A friendly game.",
        intention: "together",
        category: "tennis",
        neighborhood: "Lehel",
        lat: 48.1424,
        lng: 11.5923,
        availability: { mode: "arrangement" },
        compensation: "free",
      },
    });
  });

  it("ignores ownership, ids and coordinates sent by the browser", () => {
    const result = parseListingInput(
      {
        ...base,
        author_id: "someone-else",
        author_name: "Mallory",
        id: "x",
        lat: 0,
        lng: 0,
        own: true,
      },
      today,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.draft).not.toHaveProperty("author_id");
    expect(result.draft).not.toHaveProperty("author_name");
    expect(result.draft).not.toHaveProperty("id");
    expect(result.draft).not.toHaveProperty("own");
    expect([result.draft.lat, result.draft.lng]).toEqual([48.1424, 11.5923]);
  });

  it("rejects non-object input and unknown enum values", () => {
    expect(parseListingInput(null, today)).toEqual({
      ok: false,
      error: "invalid",
    });
    expect(parseListingInput("x", today).ok).toBe(false);
    expect(errorOf({ intention: "selling" })).toBe("invalid");
    expect(errorOf({ category: "chess" })).toBe("invalid");
    expect(errorOf({ compensation: "crypto" })).toBe("invalid");
    expect(errorOf({ neighborhood: "Berlin" })).toBe("invalid");
    expect(errorOf({ neighborhood: 0 })).toBe("invalid");
    expect(errorOf({ mode: "sometimes" })).toBe("invalid");
  });

  it("requires non-blank text and enforces lengths in code points", () => {
    expect(errorOf({ title: "   " })).toBe("required");
    expect(errorOf({ description: 42 })).toBe("required");
    expect(errorOf({ title: "x".repeat(91) })).toBe("length");
    expect(parse({ title: "😀".repeat(90) }).ok).toBe(true);
    expect(errorOf({ description: "x".repeat(1201) })).toBe("length");
  });

  it("requires both sides of an exchange", () => {
    expect(errorOf({ intention: "exchange" })).toBe("required");
    expect(errorOf({ intention: "exchange", offer: "Soup" })).toBe("required");
    expect(
      errorOf({
        intention: "exchange",
        offer: "Soup",
        wanted: "x".repeat(501),
      }),
    ).toBe("length");
    const result = parse({
      intention: "exchange",
      offer: " Soup ",
      wanted: "Herbs",
    });
    expect(result.ok && [result.draft.offer, result.draft.wanted]).toEqual([
      "Soup",
      "Herbs",
    ]);
  });

  it("drops exchange text for other intentions", () => {
    const result = parse({ offer: "Soup", wanted: "Herbs" });
    expect(result.ok && result.draft).not.toHaveProperty("offer");
  });

  it("validates specific dates", () => {
    expect(errorOf({ mode: "date", date: "" })).toBe("date");
    expect(errorOf({ mode: "date", date: today })).toBe("date");
    expect(errorOf({ mode: "date", date: "2026-10-23" })).toBe("date");
    expect(errorOf({ mode: "date", date: "2027-02-30" })).toBe("date");
    expect(errorOf({ mode: "date", date: "27-01-01" })).toBe("date");
    expect(parse({ mode: "date", date: "2026-10-25" })).toMatchObject({
      ok: true,
      draft: { availability: { mode: "date", date: "2026-10-25" } },
    });
    expect(errorOf({ mode: "date", date: "2026-11-01", start: "10:00" })).toBe(
      "time",
    );
    expect(
      errorOf({
        mode: "date",
        date: "2026-11-01",
        start: "10:00",
        end: "09:00",
      }),
    ).toBe("time");
    expect(
      parse({ mode: "date", date: "2026-11-01", start: "10:00", end: "11:30" }),
    ).toMatchObject({
      ok: true,
      draft: { availability: { start: "10:00", end: "11:30" } },
    });
  });

  it("validates recurring schedules", () => {
    const recurring = { mode: "recurring", start: "17:00", end: "18:00" };
    expect(errorOf({ ...recurring, days: [] })).toBe("days");
    expect(errorOf({ ...recurring, days: [7] })).toBe("invalid");
    expect(errorOf({ ...recurring, days: ["1"] })).toBe("invalid");
    expect(errorOf({ ...recurring, days: [1], end: "" })).toBe("time");
    expect(errorOf({ ...recurring, days: [1], start: "25:00" })).toBe("time");
    expect(parse({ ...recurring, days: [4, 1, 4] })).toMatchObject({
      ok: true,
      draft: { availability: { mode: "recurring", days: [1, 4] } },
    });
  });

  it("validates paid compensation", () => {
    const paid = { compensation: "paid", unit: "hour" };
    expect(errorOf({ ...paid, amount: "" })).toBe("amount");
    expect(errorOf({ ...paid, amount: "0" })).toBe("amount");
    expect(errorOf({ ...paid, amount: "-5" })).toBe("amount");
    expect(errorOf({ ...paid, amount: "1e3" })).toBe("amount");
    expect(errorOf({ ...paid, amount: "12.345" })).toBe("amount");
    expect(errorOf({ ...paid, amount: "10000.01" })).toBe("amount");
    expect(errorOf({ ...paid, amount: "12", unit: "day" })).toBe("amount");
    expect(parse({ ...paid, amount: "12.50" })).toMatchObject({
      ok: true,
      draft: { amount: 12.5, unit: "hour" },
    });
    const free = parse({ amount: "12", unit: "hour" });
    expect(free.ok && free.draft).not.toHaveProperty("amount");
  });
});
