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

export interface ShippingTier {
  quantity: number;
  weightGrams: number;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  ratePrepaid: number;
  rateCod: number;
}

// Weight/dimensions/rate per total cart quantity, as provided by the courier (ShippingXpress)
export const SHIPPING_TIERS: ShippingTier[] = [
  { quantity: 1, weightGrams: 300, length: 16, width: 9, height: 8, ratePrepaid: 70, rateCod: 120 },
  { quantity: 2, weightGrams: 650, length: 16, width: 20, height: 8, ratePrepaid: 100, rateCod: 150 },
  { quantity: 3, weightGrams: 1000, length: 16, width: 29, height: 8, ratePrepaid: 120, rateCod: 170 },
  { quantity: 4, weightGrams: 1300, length: 16, width: 20, height: 18, ratePrepaid: 150, rateCod: 200 },
  { quantity: 5, weightGrams: 1600, length: 16, width: 20, height: 27, ratePrepaid: 200, rateCod: 250 },
];

export function getShippingTierForQuantity(quantity: number): ShippingTier {
  const idx = Math.min(Math.max(quantity, 1), SHIPPING_TIERS.length) - 1;
  return SHIPPING_TIERS[idx];
}

export interface ShippingCalculation {
  shipping_amount: number;
  tier: ShippingTier;
}

export function calculateShipping(
  totalQuantity: number,
  paymentMethod: "cod" | "online"
): ShippingCalculation {
  const tier = getShippingTierForQuantity(totalQuantity);
  // Free shipping above ₹2000 is disabled for now — ShippingXpress tier rates always apply.
  // const freeShippingThreshold = 2000;
  const shipping_amount =
    paymentMethod === "cod" ? tier.rateCod : tier.ratePrepaid;

  return { shipping_amount, tier };
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
  const tier = getShippingTierForQuantity(quantity);
  const weight =
    tier.weightGrams >= 1000
      ? `${(tier.weightGrams / 1000).toFixed(1)}kg`
      : `${tier.weightGrams}g`;
  return `${quantity} item${quantity > 1 ? "s" : ""} · ${weight} package`;
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
