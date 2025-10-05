import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComboOffer {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  priceMRP: number;
  priceActual: number;
  sizeMl: number;
  fragrance_family: string[];
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  additional_notes: string;
  description: string;
  category: string;
  featured: boolean;
  pricing?: Array<{
    mrp: number;
    price: number;
    volume: number;
    stock: number;
    quality: string;
    sku: string;
  }>;
}

interface ComboCardProps {
  offer: ComboOffer;
  onAddToCart?: (offer: ComboOffer) => void;
}

export function ComboCard({ offer, onAddToCart }: ComboCardProps) {
  const discountPercentage = Math.round(
    ((offer.priceMRP - offer.priceActual) / offer.priceMRP) * 100
  );

  return (
    <Card className="group overflow-hidden border-2 border-primary/20 hover:border-primary/40 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={offer.imageUrl}
          alt={offer.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-lg px-3 py-1">
          {discountPercentage}% OFF
        </Badge>

        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold mb-1">{offer.name}</h3>
          <p className="text-white/90">{offer.description}</p>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                ₹{offer.priceActual.toLocaleString()}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ₹{offer.priceMRP.toLocaleString()}
              </span>
            </div>
            <p className="text-primary font-medium">
              Save ₹{(offer.priceMRP - offer.priceActual).toLocaleString()}
            </p>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-card hover:shadow-elegant transition-all duration-300"
            onClick={() => onAddToCart?.(offer)}
          >
            Add Combo to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
