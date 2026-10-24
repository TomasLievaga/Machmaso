import {
  CircleDot,
  Sprout,
  CookingPot,
  PackageOpen,
  Pencil,
  Languages,
  Bike,
  Hammer,
} from "lucide-react";
import type { Category } from "@/lib/data";
export const categoryIcons = {
  tennis: CircleDot,
  plants: Sprout,
  cooking: CookingPot,
  moving: PackageOpen,
  drawing: Pencil,
  languages: Languages,
  cycling: Bike,
  diy: Hammer,
};
export function ActionIcon({
  category,
  size = 22,
}: {
  category: Category;
  size?: number;
}) {
  const Icon = categoryIcons[category];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
