"use client";

import { create } from "zustand";
import { IProductDetail } from "@/types/product";
import { useMemo, useCallback } from "react";

type ProductDetailVariant = IProductDetail["product_variants"][0];

interface ProductVariantState {
  // Store variant selection by product ID
  selectedVariants: Record<string, ProductDetailVariant | undefined>;

  // Actions
  setSelectedVariant: (
    productId: string,
    variant: ProductDetailVariant | undefined
  ) => void;
  getSelectedVariant: (productId: string) => ProductDetailVariant | null;
  clearSelectedVariant: (productId: string) => void;
  clearAllVariants: () => void;
}

export const useProductVariantStore = create<ProductVariantState>(
  (set, get) => ({
    selectedVariants: {},

    setSelectedVariant: (
      productId: string,
      variant: ProductDetailVariant | undefined
    ) => {
      set((state) => ({
        selectedVariants: {
          ...state.selectedVariants,
          [productId]: variant!,
        },
      }));
    },

    getSelectedVariant: (productId: string) => {
      return get().selectedVariants[productId] || null;
    },

    clearSelectedVariant: (productId: string) => {
      set((state) => {
        const newVariants = { ...state.selectedVariants };
        delete newVariants[productId];
        return { selectedVariants: newVariants };
      });
    },

    clearAllVariants: () => {
      set({ selectedVariants: {} });
    },
  })
);

// Convenience hook for easier usage
export const useProductVariant = (productId: string) => {
  // Only subscribe to the specific variant for this product
  const selectedVariant = useProductVariantStore(
    useCallback(
      (state) => state.selectedVariants[productId] || null,
      [productId]
    )
  );

  // Get stable references to store actions
  const setSelectedVariantAction = useProductVariantStore(
    (state) => state.setSelectedVariant
  );
  const clearSelectedVariantAction = useProductVariantStore(
    (state) => state.clearSelectedVariant
  );

  // Memoize the setSelectedVariant function to prevent re-renders
  const setSelectedVariant = useCallback(
    (variant: ProductDetailVariant | undefined) => {
      setSelectedVariantAction(productId, variant);
    },
    [productId, setSelectedVariantAction]
  );

  // Memoize the clearSelectedVariant function to prevent re-renders
  const clearSelectedVariant = useCallback(() => {
    clearSelectedVariantAction(productId);
  }, [productId, clearSelectedVariantAction]);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      selectedVariant,
      setSelectedVariant,
      clearSelectedVariant,
    }),
    [selectedVariant, setSelectedVariant, clearSelectedVariant]
  );
};
