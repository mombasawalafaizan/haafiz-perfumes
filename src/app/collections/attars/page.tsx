'use client';

import { ProductCard } from '@/components/ui/product-card';
import { getProductsByCategory } from '@/data/products';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AttarsPage() {
  const attars = getProductsByCategory('attar');
  const isMobile = useIsMobile();

  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Authentic Attars</h1>
        <p className="text-muted-foreground">
          Discover our collection of traditional attars with modern sophistication
        </p>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {attars.map((attar) => (
            <ProductCard
              key={attar.id}
              product={attar}
              layout={isMobile ? "horizontal" : "vertical"} 
              onProductClick={() => {
                window.location.href = `/products/${attar.id}`;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
