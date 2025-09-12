"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { IProductDetail } from "@/types/product";

interface ProductAddToCartProps {
  product: IProductDetail;
  hasMultiplePricing: boolean;
}

export function ProductAddToCart({
  product,
  hasMultiplePricing,
}: ProductAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // For now, we'll use the first variant if multiple pricing exists
    // In a real implementation, you'd want to get the selected variant from context
    const variant = product.product_variants?.[0];

    if (!variant) {
      console.error("No variant available for this product");
      return;
    }

    // Transform the product data to match the cart's expected format
    const productToAdd = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl:
        (product.product_images?.[0]?.images as { backblaze_url: string })
          ?.backblaze_url || "/placeholder-product.jpg",
      priceMRP: variant.mrp,
      priceActual: variant.price,
      sizeMl: variant.volume,
      fragrance_family: product.fragrance_family
        ? [product.fragrance_family]
        : [],
      top_notes: product.top_notes || "",
      middle_notes: product.middle_notes || "",
      base_notes: product.base_notes || "",
      additional_notes: product.additional_notes || "",
      description: product.description || "",
      category: product.category,
      featured: product.is_featured || false,
      pricing:
        product.product_variants?.map((v) => ({
          mrp: v.mrp,
          price: v.price,
          volume: v.volume,
          stock: v.stock,
          quality: v.product_quality,
          sku: v.sku,
        })) || [],
    };

    addItem(productToAdd, quantity);
  };

  return (
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
        disabled={hasMultiplePricing && !product.product_variants?.[0]}
        className="flex-1 btn-gradient-golden text-black font-semibold py-3 text-lg"
        size="lg"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Add to Cart
      </Button>
    </div>
  );
}
