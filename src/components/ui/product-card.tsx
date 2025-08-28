"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
//  import { useToast } from '@/hooks/use-toast';
import { getLeastPriceOption, createProductWithPricing } from "@/lib/utils";

interface ProductCardProps {
  product: IProduct;
  onProductClick?: () => void;
  layout?: "horizontal" | "vertical";
}

export function ProductCard({
  product,
  onProductClick,
  layout = "vertical",
}: ProductCardProps) {
  // const { toast } = useToast();
  const { addItem } = useCart();

  // Get the least price option if multiple pricing options exist
  const leastPriceOption =
    product.pricing && product.pricing.length > 0
      ? getLeastPriceOption(product.pricing)
      : null;

  // Use least price option for display if available
  const displayPrice = leastPriceOption?.price || product.priceActual;
  const displayMRP = leastPriceOption?.mrp || product.priceMRP;
  const displaySize = leastPriceOption?.volume || product.sizeMl;

  const discountPercentage = Math.round(
    ((displayMRP - displayPrice) / displayMRP) * 100
  );

  const handleAddToCart = () => {
    let productToAdd = product;

    // If there's a least price option, create product with that pricing
    if (leastPriceOption) {
      productToAdd = createProductWithPricing(product, leastPriceOption);
    }

    addItem(productToAdd, 1);

    // if (result.success) {
    //   if (result.discarded > 0) {
    //     toast({
    //       title: 'Cart limit reached! ⚠️',
    //       description: `${result.added} × ${product.name} added to cart. ${result.discarded} items discarded (max 10 items allowed).`,
    //       variant: 'destructive',
    //     });
    //   } else {
    //     toast({
    //       title: 'Added to cart! 🛍️',
    //       description: `${product.name} has been added to your cart.`,
    //     });
    //   }
    // } else {
    //   toast({
    //     title: 'Cart is full! 🛒',
    //     description: 'Your cart has reached the maximum limit of 10 items. Please remove some items to add more.',
    //     variant: 'destructive',
    //   });
    // }
  };

  return (
    <Card
      className="group overflow-hidden border-2 border-primary/20 hover:border-primary/40 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card cursor-pointer"
      onClick={onProductClick}
    >
      {layout === "horizontal" ? (
        // Horizontal layout
        <div className="flex">
          {/* Left Section - Product Image */}
          <div className="relative w-2/5 aspect-square overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 md:top-3 md:left-3 bg-primary text-primary-foreground text-xs md:text-sm">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>

          {/* Right Section - Product Details */}
          <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Product Name and Size */}
              <div>
                <h3 className="font-semibold text-sm md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {product.pricing && product.pricing.length > 1 && (
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
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
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
                {product.pricing && product.pricing.length > 1 && (
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
