import Discovery from "@/components/discovery";
import { createSamples } from "@/lib/data";

// Generate future dates per page load and share the same data during hydration.
export const dynamic = "force-dynamic";
export default function Home() {
  return <Discovery initialListings={createSamples()} />;
}
