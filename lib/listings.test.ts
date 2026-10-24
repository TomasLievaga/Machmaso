import { describe, expect, it } from "vitest";
import { fromRow, toRow, type ListingRow } from "./listings";

const row: ListingRow = {
  id: "row-1",
  title: "Rally",
  description: "Tennis",
  intention: "together",
  category: "tennis",
  neighborhood: "Lehel",
  lat: 48.1,
  lng: 11.5,
  author_name: "Ana",
  availability: { mode: "arrangement" },
  compensation: "free",
  amount: null,
  unit: null,
  offer: null,
  wanted: null,
  author_id: "user-a",
};

describe("ownership", () => {
  it("marks only the viewer's own listings", () => {
    expect(fromRow(row, "user-a").own).toBe(true);
    expect(fromRow(row, "user-b").own).toBeUndefined();
    expect(fromRow(row).own).toBeUndefined();
  });
  it("treats rows without an author as fictional samples", () => {
    expect(fromRow({ ...row, author_id: null }, "user-a")).toMatchObject({
      fictional: true,
    });
    expect(fromRow({ ...row, author_id: undefined }).fictional).toBe(true);
    expect(fromRow(row).fictional).toBeUndefined();
  });
  it("takes the author only from the verified user", () => {
    const draft = {
      title: "Rally",
      description: "Tennis",
      intention: "together" as const,
      category: "tennis" as const,
      neighborhood: "Lehel",
      lat: 48.1,
      lng: 11.5,
      availability: { mode: "arrangement" as const },
      compensation: "free" as const,
    };
    expect(toRow(draft, "verified-id", "Ana")).toMatchObject({
      author_id: "verified-id",
      author_name: "Ana",
      amount: null,
      unit: null,
      offer: null,
      wanted: null,
    });
  });
});
