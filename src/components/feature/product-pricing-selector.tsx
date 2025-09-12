"use client";

import { useState, useEffect } from "react";
import { IProductVariant } from "@/types/product";

interface ProductPricingSelectorProps {
  variants: IProductVariant[];
}

export function ProductPricingSelector({
  variants,
}: ProductPricingSelectorProps) {
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(null);

  // Set default to first variant on mount
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const discountPercentage =
            variant.mrp > variant.price
              ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
              : 0;

          return (
            <div
              key={variant.id}
              className={`py-2 px-4 border-2 rounded-lg cursor-pointer transition-all w-fit flex gap-0.5 flex-col items-center justify-center ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-primary/20 hover:border-primary/50"
              }`}
              onClick={() => setSelectedVariant(variant)}
            >
              <div className="font-semibold w-fit text-foreground">
                {variant.volume}ml
              </div>
              {variant.product_quality && (
                <span className="text-sm text-muted-foreground">
                  ({variant.product_quality})
                </span>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary">
                  ₹{variant.price.toLocaleString()}
                </span>
                {variant.mrp > variant.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{variant.mrp.toLocaleString()}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="text-xs text-primary font-medium">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Price Display */}
      {selectedVariant && (
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-primary">
              ₹{selectedVariant.price.toLocaleString()}
            </span>
            {selectedVariant.mrp > selectedVariant.price && (
              <span className="text-xl text-muted-foreground line-through">
                ₹{selectedVariant.mrp.toLocaleString()}
              </span>
            )}
          </div>
          {selectedVariant.mrp > selectedVariant.price && (
            <p className="text-lg text-primary font-medium">
              Save ₹
              {(selectedVariant.mrp - selectedVariant.price).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
