"use server";
import { supabase } from "@/lib/supabase";
import { IProductDetail } from "@/types/product";

const PRODUCT_DETAIL_QUERY = `
        id,
        name,
        slug,
        category,
        fragrance_family,
        description,
        top_notes,
        middle_notes,
        base_notes,
        additional_notes,
        is_featured,
        product_variants (
          id,
          product_id,
          product_quality,
          price,
          mrp,
          stock,
          volume,
          sku,
          variant_images (
            is_primary,
            display_order,
            images (
              backblaze_url
            )
          )
        ),
        product_images (
          is_primary,
          display_order,
          images (
            backblaze_url
          )
        )
      `;

function applySorting(
  products: IProductDetail[],
  sortOption: TSortOption
): IProductDetail[] {
  switch (sortOption) {
    case "featured":
      return products.sort((a, b) => {
        // Featured products first, then by name
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return a.name.localeCompare(b.name);
      });

    case "name-asc":
      return products.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return products.sort((a, b) => b.name.localeCompare(a.name));

    case "date-old-new":
      return products.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      });

    case "date-new-old":
      return products.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

    case "price-low-high":
      return products.sort((a, b) => {
        const priceA = a.product_variants?.[0]?.price || 0;
        const priceB = b.product_variants?.[0]?.price || 0;
        return priceA - priceB;
      });

    case "price-high-low":
      return products.sort((a, b) => {
        const priceA = a.product_variants?.[0]?.price || 0;
        const priceB = b.product_variants?.[0]?.price || 0;
        return priceB - priceA;
      });

    default:
      return products;
  }
}

export async function getProductsByCategory(
  category: string,
  sortOption: TSortOption = "featured"
): Promise<IProductDetail[]> {
  try {
    // First, get all products with their variants
    const { data: allProducts, error: allProductsError } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_QUERY)
      .eq("category", category)
      .order("name");

    if (allProductsError) {
      console.error("Error fetching products:", allProductsError);
      throw new Error(`Failed to fetch products: ${allProductsError.message}`);
    }

    // Filter to only include variants with the least price for each product
    const filteredProducts =
      allProducts?.map((product) => {
        if (
          !product.product_variants ||
          product.product_variants.length === 0
        ) {
          return product;
        }

        // Find the variant with the minimum price
        const minPriceVariant = product.product_variants.reduce(
          (min, current) => (current.price < min.price ? current : min)
        );

        // Return product with only the minimum price variant
        return {
          ...product,
          product_variants: [minPriceVariant],
        };
      }) || [];

    // Apply sorting based on sortOption
    const sortedProducts = applySorting(filteredProducts, sortOption);
    return sortedProducts;
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    throw error;
  }
}

export async function getFeaturedProducts(): Promise<IProductDetail[]> {
  try {
    const { data, error: allProductsError } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_QUERY)
      .eq("is_featured", true);

    if (allProductsError) {
      console.error("Error fetching products:", allProductsError);
      throw new Error(`Failed to fetch products: ${allProductsError.message}`);
    }
    // Filter to only include variants with the least price for each product
    const filteredProducts =
      data?.map((product) => {
        if (
          !product.product_variants ||
          product.product_variants.length === 0
        ) {
          return product;
        }

        // Find the variant with the minimum price
        const minPriceVariant = product.product_variants.reduce(
          (min, current) => (current.price < min.price ? current : min)
        );

        // Return product with only the minimum price variant
        return {
          ...product,
          product_variants: [minPriceVariant],
        };
      }) || [];

    return filteredProducts;
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<IProductDetail> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_QUERY)
      .eq("slug", slug);

    if (error) {
      console.error("Error fetching product by slug:", error);
      throw new Error(`Failed to fetch product by slug: ${error.message}`);
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    throw error;
  }
}

// export async function getAllProducts(): Promise<IProductDetail[]> {
//   try {
//     const { data, error } = await supabase
//       .from("products")
//       .select(PRODUCT_DETAIL_QUERY)
//       .order("name");

//     if (error) {
//       console.error("Error fetching all products:", error);
//       throw new Error(`Failed to fetch products: ${error.message}`);
//     }

//     // Filter to only include variants with the least price for each product
//     const filteredProducts =
//       data?.map((product) => {
//         if (
//           !product.product_variants ||
//           product.product_variants.length === 0
//         ) {
//           return product;
//         }

//         // Find the variant with the minimum price
//         const minPriceVariant = product.product_variants.reduce(
//           (min, current) => (current.price < min.price ? current : min)
//         );

//         // Return product with only the minimum price variant
//         return {
//           ...product,
//           product_variants: [minPriceVariant],
//         };
//       }) || [];

//     return filteredProducts;
//   } catch (error) {
//     console.error("Error in getAllProducts:", error);
//     throw error;
//   }
// }
