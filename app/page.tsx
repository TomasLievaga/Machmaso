import Discovery from "@/components/discovery";
import { loadListings } from "@/lib/listings";

// Load listings per request; demo fallback dates are also generated per load.
export const dynamic = "force-dynamic";
export default async function Home() {
  const { listings, source } = await loadListings();
  return <Discovery initialListings={listings} demoData={source === "demo"} />;
}
