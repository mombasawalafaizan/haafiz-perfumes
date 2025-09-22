import { Metadata } from "next";
import { ProductCard } from "@/components/common/product-card";
import { SortSelect } from "@/components/common/sort-select";
import { getProductsByCategory } from "@/lib/actions/product";

export const dynamic = "force-dynamic"; // For current frequent addition of products

export const metadata: Metadata = {
  title: "Authentic Attars | Haafiz Perfumes",
  description:
    "Discover our collection of traditional attars with modern sophistication. Premium fragrances crafted with authentic ingredients.",
  keywords: [
    "attars",
    "traditional attars",
    "premium fragrances",
    "haafiz perfumes",
    "attar collection",
  ],
  openGraph: {
    title: "Authentic Attars | Haafiz Perfumes",
    description:
      "Discover our collection of traditional attars with modern sophistication.",
    type: "website",
  },
};

interface AttarsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AttarsPage({ searchParams }: AttarsPageProps) {
  const sortParam = (await searchParams)?.sort as string;
  const sortOption = (sortParam as TSortOption) || "name-asc";
  const attars = await getProductsByCategory("attar", sortOption);

  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 md:py-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:mb-2">
              Authentic Attars
            </h1>
            <p className="hidden md:block text-muted-foreground">
              Discover our collection of traditional attars with modern
              sophistication
            </p>
          </div>
          <SortSelect currentSort={sortOption} />
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-16">
        {attars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {attars.map((attar) => (
              <ProductCard key={attar.id} product={attar} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No attars found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
