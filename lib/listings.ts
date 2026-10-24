import { createSamples, type Listing } from "./data";
import { supabase } from "./supabase";

// Row shape of public.listings (see supabase/migrations). Check constraints
// in the database keep the text columns within the Listing union types.
type ListingRow = {
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
};

function fromRow(row: ListingRow): Listing {
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
  };
}

export type ListingSource = "supabase" | "demo";

// Loads listings from Supabase, or the built-in samples when Supabase is not
// configured or the request fails.
export async function loadListings(): Promise<{
  listings: Listing[];
  source: ListingSource;
}> {
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id, title, description, intention, category, neighborhood, lat, lng, author_name, availability, compensation, amount, unit, offer, wanted",
      )
      .order("created_at", { ascending: false })
      .returns<ListingRow[]>();
    if (!error && data)
      return { listings: data.map(fromRow), source: "supabase" };
    console.error("Could not load listings from Supabase:", error?.message);
  }
  return { listings: createSamples(), source: "demo" };
}
