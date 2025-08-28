'use client';

import { ComboCard } from '@/components/ui/combo-card';
import { comboOffers } from '@/data/products';

export default function CombosPage() {
  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Combo Offers</h1>
        <p className="text-muted-foreground">
          Exclusive curated sets and special offers for the perfect fragrance experience
        </p>
      </div>

      {/* Combos Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comboOffers.map((offer) => (
            <ComboCard key={offer.id} offer={offer} onAddToCart={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}
