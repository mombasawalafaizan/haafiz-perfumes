'use client';

import { ProductCard } from '@/components/ui/product-card';
import { getProductsByCategory } from '@/data/products';
import { useIsMobile } from '@/hooks/use-mobile';

export default function PerfumesPage() {
  const perfumes = getProductsByCategory('perfume');
  const isMobile = useIsMobile();

  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Premium Perfumes</h1>
        <p className="text-muted-foreground">
          Discover our collection of luxury perfumes crafted with the finest ingredients
        </p>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {perfumes.map((perfume) => (
            <ProductCard
              key={perfume.id}
              product={perfume}
              layout={isMobile ? "horizontal" : "vertical"} 
              onProductClick={() => {
                window.location.href = `/products/${perfume.id}`;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
