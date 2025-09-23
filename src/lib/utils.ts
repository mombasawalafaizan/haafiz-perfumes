import { CartItem, MAX_CART_ITEMS } from "@/hooks/useCart";
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
export function getLeastPriceOption(
  pricing: IProductPricing[]
): IProductPricing {
  return pricing.reduce((min, current) => {
    const currentPrice = current.price || 0;
    const minPrice = min.price || 0;
    return currentPrice < minPrice ? current : min;
  });
}

export function calculateCartMeta(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.priceActual * item.quantity,
    0
  );
  const availableSpace = MAX_CART_ITEMS - totalItems;
  return { totalItems, totalPrice, availableSpace };
}

// Utility function to create a product with selected pricing
export function createProductWithPricing(
  product: IProduct,
  selectedPricing: IProductPricing
): IProduct {
  return {
    ...product,
    priceMRP: selectedPricing.mrp || product.priceMRP,
    priceActual: selectedPricing.price || product.priceActual,
    sizeMl: selectedPricing.volume || product.sizeMl,
    mrp: selectedPricing.mrp,
    price: selectedPricing.price,
    volume: selectedPricing.volume,
    stock: selectedPricing.stock,
    quality: selectedPricing.quality,
    sku: selectedPricing.sku,
  };
}
