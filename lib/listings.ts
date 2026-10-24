import type { SupabaseClient } from "@supabase/supabase-js";
import { createSamples, type Listing } from "./data";
import type { ListingDraft } from "./listing-input";

// Row shape of public.listings (see supabase/migrations). Check constraints
// in the database keep the text columns within the Listing union types.
// author_id only exists once the listing-authors migration is applied.
export type ListingRow = {
  id: string;
  title: string;
  description: string;
  intention: Listing["intention"];
  category: Listing["category"];
  neighborhood: string;
  lat: number;
  lng: number;
  author_name: string;
  availability: Listing["availability"];
  compensation: Listing["compensation"];
  amount: number | null;
  unit: Listing["unit"] | null;
  offer: string | null;
  wanted: string | null;
  author_id?: string | null;
};

export function fromRow(row: ListingRow, viewerId?: string): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    intention: row.intention,
    category: row.category,
    neighborhood: row.neighborhood,
    lat: row.lat,
    lng: row.lng,
    author: row.author_name,
    availability: row.availability,
    compensation: row.compensation,
    ...(row.amount !== null && row.unit !== null
      ? { amount: Number(row.amount), unit: row.unit }
      : {}),
    ...(row.offer !== null && row.wanted !== null
      ? { offer: row.offer, wanted: row.wanted }
      : {}),
    ...(viewerId && row.author_id === viewerId ? { own: true } : {}),
    ...(row.author_id ? {} : { fictional: true }),
  };
}

export function toRow(
  draft: ListingDraft,
  authorId: string,
  authorName: string,
) {
  return {
    title: draft.title,
    description: draft.description,
    intention: draft.intention,
    category: draft.category,
    neighborhood: draft.neighborhood,
    lat: draft.lat,
    lng: draft.lng,
    availability: draft.availability,
    compensation: draft.compensation,
    amount: draft.amount ?? null,
    unit: draft.unit ?? null,
    offer: draft.offer ?? null,
    wanted: draft.wanted ?? null,
    author_id: authorId,
    author_name: authorName,
  };
}

export type ListingSource = "supabase" | "demo";

// Loads listings from Supabase, or the built-in samples when Supabase is not
// configured or the request fails. `select("*")` keeps reads working before
// and after the author_id column exists.
export async function loadListings(
  supabase: SupabaseClient | null,
  viewerId?: string,
): Promise<{ listings: Listing[]; source: ListingSource }> {
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ListingRow[]>();
    if (!error && data)
      return {
        listings: data.map((row) => fromRow(row, viewerId)),
        source: "supabase",
      };
    console.error("Could not load listings from Supabase:", error?.message);
  }
  return { listings: createSamples(), source: "demo" };
}
