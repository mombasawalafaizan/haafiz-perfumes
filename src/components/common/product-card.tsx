"use client";

import { useMemo, useCallback } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/use-mobile";
//  import { useToast } from '@/hooks/use-toast';
import { IProductDetail } from "@/types/product";

interface ProductCardProps {
  product: IProductDetail;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  // const { toast } = useToast();
  const { addItem } = useCart();
  const isMobile = useIsMobile();
  const layout = isMobile ? "horizontal" : "vertical";

  // Memoize expensive operations
  const placeholderImage = useMemo(
    () =>
      product.category === "attar"
        ? "/attar_placeholder.jpg"
        : "/perfume_placeholder.jpg",
    [product.category]
  );

  const productImageUrl = useMemo(() => {
    const primaryProductImage = product.product_images?.find(
      (pi) => pi.is_primary
    );
    return primaryProductImage?.images?.backblaze_url || placeholderImage;
  }, [product.product_images, placeholderImage]);

  const lowestPriceVariant = useMemo(() => {
    return product.product_variants?.reduce(
      (lowest, current) => (current.price < lowest.price ? current : lowest),
      product.product_variants?.[0]
    );
  }, [product.product_variants]);

  const displayData = useMemo(() => {
    if (!lowestPriceVariant) return null;

    const displayPrice = lowestPriceVariant.price;
    const displayMRP = lowestPriceVariant.mrp;
    const displaySize = lowestPriceVariant.volume || 50;
    const discountPercentage = Math.round(
      ((displayMRP - displayPrice) / displayMRP) * 100
    );

    return {
      displayPrice,
      displayMRP,
      displaySize,
      discountPercentage,
    };
  }, [lowestPriceVariant]);

  const handleAddToCart = useCallback(() => {
    if (!lowestPriceVariant || !displayData) return;

    // Pass the original product (IProductDetail) and selected variant ID to addItem
    addItem(product, lowestPriceVariant.id, 1);
  }, [product, displayData, lowestPriceVariant, addItem]);

  if (!lowestPriceVariant || !displayData) {
    return null; // Don't render if no variants
  }

  const { displayPrice, displayMRP, displaySize, discountPercentage } =
    displayData;

  return (
    <Card
      className="group overflow-hidden border-2 border-primary/20 hover:border-primary/40 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card cursor-pointer"
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      {layout === "horizontal" ? (
        // Horizontal layout
        <div className="flex relative">
          {/* Left Section - Product Image */}
          <div className="relative w-1/3 aspect-[3/4] overflow-hidden">
            <Image
              src={productImageUrl}
              alt={product.name}
              fill
              sizes="33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Right Section - Product Details */}
          <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Product Name and Size */}
              <div>
                <h3 className="font-semibold text-md md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {product.product_variants &&
                  product.product_variants.length > 1 && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {displaySize}ml
                    </p>
                  )}
              </div>

              {/* Price Information */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-base md:text-xl font-bold text-primary">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  {displayMRP > displayPrice && (
                    <span className="text-xs md:text-sm text-muted-foreground line-through">
                      ₹{displayMRP.toLocaleString()}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="text-xs md:text-sm text-primary mb-2 font-medium">
                    Save ₹{(displayMRP - displayPrice).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="w-full btn-gradient-golden text-black font-semibold hover:opacity-90 shadow-card hover:shadow-elegant transition-all duration-300 text-xs md:text-sm py-2"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
            >
              <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      ) : (
        // Vertical layout
        <>
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={productImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 md:top-3 md:left-3 bg-primary text-primary-foreground text-xs md:text-sm">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>

          <CardContent className="p-3 md:p-4">
            <div className="space-y-2 md:space-y-3">
              <div>
                <h3 className="font-semibold text-sm md:text-lg text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                {product.product_variants &&
                  product.product_variants.length > 1 && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {displaySize}ml
                    </p>
                  )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-base md:text-xl font-bold text-primary">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  {displayMRP > displayPrice && (
                    <span className="text-xs md:text-sm text-muted-foreground line-through">
                      ₹{displayMRP.toLocaleString()}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="text-xs md:text-sm text-primary font-medium">
                    Save ₹{(displayMRP - displayPrice).toLocaleString()}
                  </p>
                )}
              </div>

              <Button
                className="w-full btn-gradient-golden text-black font-semibold hover:opacity-90 shadow-card hover:shadow-elegant transition-all duration-300 text-xs md:text-sm py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
              >
                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
