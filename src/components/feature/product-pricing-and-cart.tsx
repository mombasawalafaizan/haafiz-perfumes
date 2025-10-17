"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useProductVariant } from "@/hooks/useProductVariant";
import { IProductDetail } from "@/types/product";
import { getLeastPriceOption } from "@/lib/utils";

interface ProductPricingAndCartProps {
  product: IProductDetail;
}

export function ProductPricingAndCart({ product }: ProductPricingAndCartProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { selectedVariant, setSelectedVariant } = useProductVariant(
    product.id!
  );

  const sortedVariants = useMemo(() => {
    return product?.product_variants?.sort((a, b) => a.price - b.price) || [];
  }, [product?.product_variants]);

  // Set default to first variant on mount
  useEffect(() => {
    setSelectedVariant(getLeastPriceOption(sortedVariants));
  }, [sortedVariants, setSelectedVariant]);

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant) {
      console.error("No variant selected");
      return;
    }

    // Pass the original product (IProductDetail) and selected variant ID to addItem
    addItem(product, selectedVariant.id, quantity);
  }, [product, selectedVariant, quantity, addItem]);

  // Calculate totals based on selected variant and quantity
  // const totalPrice = useMemo(
  //   () => (selectedVariant ? selectedVariant.price * quantity : 0),
  //   [selectedVariant, quantity]
  // );
  // const totalMRP = useMemo(
  //   () => (selectedVariant ? selectedVariant.mrp * quantity : 0),
  //   [selectedVariant, quantity]
  // );
  // const totalSavings = useMemo(
  //   () => totalMRP - totalPrice,
  //   [totalMRP, totalPrice]
  // );

  // Calculate discount percentages for all variants
  const variantDiscountPercentages = useMemo(() => {
    return (
      product.product_variants?.map((variant) => ({
        id: variant.id,
        discountPercentage:
          variant.mrp > variant.price
            ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
            : 0,
      })) || []
    );
  }, [product.product_variants]);

  // Calculate discount percentage for selected variant
  const selectedVariantDiscountPercentage = useMemo(
    () =>
      selectedVariant && selectedVariant.mrp > selectedVariant.price
        ? Math.round(
            ((selectedVariant.mrp - selectedVariant.price) /
              selectedVariant.mrp) *
              100
          )
        : 0,
    [selectedVariant]
  );

  // Multiple pricing - show variant selection
  if (!selectedVariant) {
    return null;
  }
  if (product.product_variants && product?.product_variants?.length === 1) {
    // Single pricing - show simplified layout
    const variant = product.product_variants[0];
    const discountPercentage =
      variantDiscountPercentages.find((v) => v.id === variant.id)
        ?.discountPercentage || 0;

    return (
      <div className="space-y-6">
        {/* Single Price Display */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-primary">
              ₹{variant.price.toLocaleString()}
            </span>
            {variant.mrp > variant.price && (
              <span className="text-xl text-muted-foreground line-through">
                ₹{variant.mrp.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex gap-3 text-lg text-primary font-bold">
            {variant.product_quality && <span>{variant.product_quality}</span>}
            {!!variant.product_quality && !!variant.volume && <span>-</span>}
            {variant.volume && <span>{variant.volume}ml</span>}
          </div>
          {discountPercentage > 0 && (
            <p className="text-sm text-primary">
              Save ₹{(variant.mrp - variant.price).toLocaleString()}
            </p>
          )}
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            className="flex-1 btn-gradient-golden text-black font-semibold py-3 text-lg"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    );
  }

  const discountPercentage = selectedVariantDiscountPercentage;

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {sortedVariants?.map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;

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
      </div>

      {/* Selected Price Display */}
      <div className="space-y-2">
        {/* <h3 className="text-lg font-semibold">Price Details</h3> */}
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
        {discountPercentage > 0 && (
          <p className="text-lg text-primary font-medium">
            Save ₹
            {(selectedVariant.mrp - selectedVariant.price).toLocaleString()}
          </p>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          className="flex-1 btn-gradient-golden text-black font-semibold py-3 text-lg"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
      </div>

      {/* Quantity-based totals */}
      {/* {quantity > 1 && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold">Order Summary</h4>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {quantity} × {selectedVariant.volume}ml (
              {selectedVariant.product_quality || "Standard"})
            </span>
            <span className="font-semibold">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total savings:
              </span>
              <span className="text-primary font-semibold">
                ₹{totalSavings.toLocaleString()}
              </span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between items-center font-semibold text-lg">
            <span>Total Amount:</span>
            <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      )} */}
    </div>
  );
}
