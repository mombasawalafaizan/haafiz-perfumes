"use server";
import { querySupabase, supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import {
  IProduct,
  IProductDetail,
  IProductVariant,
  IProductImage,
  IImage,
  IVariantImage,
} from "@/types/product";
import {
  IPaginationParams,
  IQueryResult,
  ISupabaseQueryConfig,
} from "@/types/query";

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

export async function getProducts(params: IPaginationParams) {
  const config: ISupabaseQueryConfig = {
    searchFields: ["name", "description"],
    sortingFields: ["name", "created_at", "updated_at"],
    filterFields: [
      {
        field: "category",
        type: "enum",
        allowedValues: ["perfume", "attar"],
      },
      { field: "updated_at", type: "date", operator: "gte" },
      { field: "updated_at", type: "date", operator: "lte" },
      { field: "created_at", type: "date", operator: "gte" },
      { field: "created_at", type: "date", operator: "lte" },
      { field: "is_featured", type: "boolean" },
    ],
  };

  return querySupabase<IProduct>("products", params, config);
}

// Product CRUD operations
export async function createProduct(
  productData: Partial<IProduct>
): Promise<{ success: boolean; data: IProduct | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    revalidatePath(`/collections/${productData.category}`);
    revalidatePath("/products/[id]");
    return { success: true, data, error: null };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function updateProduct(
  id: string,
  productData: Partial<IProduct>
) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    revalidatePath(`/collections/${productData.category}`);
    revalidatePath("/products/[id]");
    return { success: true, data };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    revalidatePath("/collections/perfumes");
    revalidatePath("/collections/attars");
    revalidatePath("/products/[id]");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Product Variant CRUD operations
export async function fetchProductVariants(
  productId: string
): Promise<IQueryResult<IProductVariant[]>> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching product variants:", error);
    return { success: false, data: undefined, error: error.message };
  }

  return { success: true, data, error: undefined };
}

export async function bulkUpsertProductVariants(
  variants: Partial<IProductVariant>[]
): Promise<IQueryResult<IProductVariant[]>> {
  try {
    const { data, error } = await supabase
      .from("product_variants")
      .upsert(variants, { onConflict: "id", defaultToNull: false })
      .select();

    if (error) {
      console.error("Error upserting variants:", error);
      return { success: false, error: error.details };
    }

    revalidatePath("/collections/perfumes");
    revalidatePath("/collections/attars");
    revalidatePath("/products/[id]");
    return { success: true, data };
  } catch (error) {
    console.error("Error in bulkUpsertProductVariants:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteProductVariant(id: string) {
  try {
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting variant:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/collections/perfumes");
    revalidatePath("/collections/attars");
    revalidatePath("/products/[id]");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProductVariant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Product Images operations
export async function getProductImages(
  productId: string
): Promise<IQueryResult<(Partial<IProductImage> & { images: IImage })[]>> {
  const { data, error } = await supabase
    .from("product_images")
    .select(
      `
      id,
      display_order,
      is_primary,
      images (*)
    `
    )
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching product images:", error);
    return { success: false, data: undefined, error: error.message };
  }

  return {
    success: true,
    data: data as unknown as (Partial<IProductImage> & {
      images: IImage;
    })[],
    error: undefined,
  };
}

export async function saveImage(
  productImage: Partial<IImage>
): Promise<IQueryResult<IImage>> {
  const { data, error } = await supabase
    .from("images")
    .insert([productImage])
    .select()
    .single();

  revalidatePath("/products/[id]");
  if (error) {
    console.error("Error creating product image:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data, error: undefined };
}

export async function deleteProductImage(
  id: string
): Promise<IQueryResult<null>> {
  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product image:", error);
    return { success: false, data: undefined, error: error.message };
  }

  revalidatePath("/products/[id]");
  return { success: true, data: undefined, error: undefined };
}

// Product Images operations
export async function bulkUpsertProductImages(
  productImages: Partial<IProductImage>[]
): Promise<IQueryResult<IProductImage[]>> {
  try {
    const { data, error } = await supabase
      .from("product_images")
      .upsert(productImages, {
        onConflict: "id",
        defaultToNull: false,
      })
      .select();

    revalidatePath("/products/[id]");
    if (error) {
      console.error("Error upserting product images:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in bulkUpsertProductImages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Variant Images operations
export async function getVariantImages(
  variantId: string
): Promise<IQueryResult<IVariantImage[]>> {
  const { data, error } = await supabase
    .from("variant_images")
    .select("*")
    .eq("variant_id", variantId);

  if (error) {
    console.error("Error fetching variant images:", error);
    return { success: false, data: undefined, error: error.message };
  }

  return { success: true, data, error: undefined };
}

export async function bulkUpsertVariantImages(
  variantImages: Partial<IVariantImage>[]
): Promise<IQueryResult<IVariantImage[]>> {
  try {
    const { data, error } = await supabase
      .from("variant_images")
      .upsert(variantImages, { onConflict: "id", defaultToNull: false })
      .select();

    revalidatePath("/products/[id]");
    if (error) {
      console.error("Error upserting variant images:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in bulkUpsertVariantImages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function replaceVariantImages(
  variantId: string,
  variantImages: Partial<IVariantImage>[]
): Promise<IQueryResult<IVariantImage[]>> {
  try {
    // First, delete all existing variant images for this variant
    const { error: deleteError } = await supabase
      .from("variant_images")
      .delete()
      .eq("variant_id", variantId);

    revalidatePath("/products/[id]");
    if (deleteError) {
      console.error("Error deleting existing variant images:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Then insert the new variant images
    if (variantImages.length > 0) {
      const { data, error } = await supabase
        .from("variant_images")
        .insert(variantImages)
        .select();

      if (error) {
        console.error("Error inserting new variant images:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error("Error in replaceVariantImages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
