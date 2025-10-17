import { CartItem, MAX_CART_ITEMS } from "@/hooks/useCart";
import { IProductDetail, IProductVariant } from "@/types/product";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a product name to a URL-friendly slug
 * @param productName - The product name to convert (e.g., "ZAR@ MAN SILVER")
 * @returns URL-friendly slug (e.g., "zar-man-silver")
 */
export function createProductSlug(productName: string): string {
  return productName
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export function getArrFromString(data: string): string[] {
  // This function detects the splitter string from the given data string and splits it accordingly
  if (data && data.trim()) {
    const arr = data.trim().split(",");
    return arr?.filter((item) => item?.trim() !== "");
  } else return [];
}

export function pluralize(word: string, count: number) {
  const pluralWord = word.toLowerCase().endsWith("y")
    ? word.slice(0, -1) + "ies"
    : word + "s";
  return !count || count <= 1 ? word : pluralWord;
}

export function imageSortFn<
  T extends { is_primary: boolean; display_order: number }
>(img1: T, img2: T): number {
  if (img1.is_primary && !img2.is_primary) return -1;
  if (!img1.is_primary && img2.is_primary) return 1;
  return img1.display_order - img2.display_order;
}

// Utility function to get the least price option from pricing array
export function getLeastPriceOption<
  T extends {
    price?: number;
  }
>(arr: T[]): T {
  return arr.reduce((min, current) => {
    const currentPrice = current.price || 0;
    const minPrice = min.price || 0;
    return currentPrice < minPrice ? current : min;
  });
}

export function calculateCartMeta(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.total_price, 0);
  const availableSpace = MAX_CART_ITEMS - totalItems;
  return { totalItems, totalPrice, availableSpace };
}

// Shipping calculation utilities

export interface ShippingCalculation {
  shipping_amount: number;
  is_free_shipping: boolean;
  free_shipping_threshold: number;
  total_before_shipping: number;
}

export function calculateShipping(
  totalAmount: number,
  totalQuantity: number
): ShippingCalculation {
  const freeShippingThreshold = 2000;
  const isFreeShipping = totalAmount >= freeShippingThreshold;

  let shippingAmount = 0;

  if (!isFreeShipping) {
    if (totalQuantity <= 2) {
      shippingAmount = 60;
    } else if (totalQuantity === 3) {
      shippingAmount = 80;
    } else if (totalQuantity <= 5) {
      shippingAmount = 120;
    } else {
      shippingAmount = 150;
    }
  }

  return {
    shipping_amount: shippingAmount,
    is_free_shipping: isFreeShipping,
    free_shipping_threshold: freeShippingThreshold,
    total_before_shipping: totalAmount,
  };
}

export function calculateTotalWithShipping(
  subtotal: number,
  shippingAmount: number,
  taxAmount: number = 0,
  discountAmount: number = 0
): number {
  return subtotal + shippingAmount + taxAmount - discountAmount;
}

export function getShippingTierDescription(quantity: number): string {
  if (quantity <= 2) {
    return "Standard (1-2 items)";
  } else if (quantity === 3) {
    return "Medium (3 items)";
  } else if (quantity <= 5) {
    return "Large (4-5 items)";
  } else {
    return "Extra Large (6+ items)";
  }
}

// Utility function to create a product with selected pricing
export function createProductWithPricing(
  product: IProductDetail,
  selectedPricing: IProductVariant
): IProductDetail {
  return {
    ...product,
    product_variants: [
      {
        ...selectedPricing,
        variant_images: [],
      },
    ],
  };
}
