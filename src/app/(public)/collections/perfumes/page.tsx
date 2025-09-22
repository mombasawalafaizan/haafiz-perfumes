import { Metadata } from "next";
import { ProductCard } from "@/components/common/product-card";
import { SortSelect } from "@/components/common/sort-select";
import { getProductsByCategory } from "@/lib/actions/product";

export const dynamic = "force-dynamic"; // For current frequent addition of products

export const metadata: Metadata = {
  title: "Premium Perfumes | Haafiz Perfumes",
  description:
    "Discover our collection of luxury perfumes crafted with the finest ingredients. Premium fragrances for every occasion.",
  keywords: [
    "perfumes",
    "luxury perfumes",
    "premium fragrances",
    "haafiz perfumes",
    "perfume collection",
  ],
  openGraph: {
    title: "Premium Perfumes | Haafiz Perfumes",
    description:
      "Discover our collection of luxury perfumes crafted with the finest ingredients.",
    type: "website",
  },
};

interface PerfumesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PerfumesPage({
  searchParams,
}: PerfumesPageProps) {
  const sortParam = (await searchParams)?.sort as string;
  const sortOption = (sortParam as TSortOption) || "name-asc";
  const perfumes = await getProductsByCategory("perfume", sortOption);

  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 md:py-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:mb-2">
              Premium Perfumes
            </h1>
            <p className="hidden md:block text-muted-foreground">
              Discover our collection of luxury perfumes crafted with the finest
              ingredients
            </p>
          </div>
          <SortSelect currentSort={sortOption} />
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-16">
        {perfumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {perfumes.map((perfume) => (
              <ProductCard key={perfume.id} product={perfume} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No perfumes found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
