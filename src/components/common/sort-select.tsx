"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "date-old-new"
  | "date-new-old"
  | "price-low-high"
  | "price-high-low";

interface SortSelectProps {
  currentSort?: string;
  className?: string;
}

export function SortSelect({
  currentSort = "name-asc",
  className = "",
}: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "name-asc") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.push(newUrl);
  };

  return (
    <div className={`flex items-center justify-end space-x-2 ${className}`}>
      <label
        htmlFor="sort-select"
        className="text-sm font-medium text-foreground"
      >
        Sort by:
      </label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-select" className="w-[200px] border-foreground">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name: A-Z</SelectItem>
          <SelectItem value="name-desc">Name: Z-A</SelectItem>
          <SelectItem value="price-low-high">Price: Low to High</SelectItem>
          <SelectItem value="price-high-low">Price: High to Low</SelectItem>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="date-old-new">Date: Old to New</SelectItem>
          <SelectItem value="date-new-old">Date: New to Old</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
