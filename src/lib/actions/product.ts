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
import { createProductSlug } from "@/lib/utils";

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
        is_featured,
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
      (allProducts?.map((product) => {
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
      }) as unknown as IProductDetail[]) || [];

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

    return filteredProducts as unknown as IProductDetail[];
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

    return (data?.[0] as unknown as IProductDetail) || null;
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    throw error;
  }
}

export async function getProducts(params: IPaginationParams) {
  const config: ISupabaseQueryConfig = {
    select: `
        id,
        name,
        slug,
        category,
        created_at,
        updated_at,
        is_featured,
        fragrance_family,
        description,
        top_notes,
        middle_notes,
        base_notes,
        additional_notes,
        product_variants (
          product_quality,
          price,
          volume,
          variant_images (
            images (
              backblaze_url
            )
          )
        ),
        product_images (
          images (
            backblaze_url
          )
        )
      `,
    searchFields: ["name"],
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

  return querySupabase<IProductDetail>("products", params, config);
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
    revalidatePath("/products/[id]", "page");
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
    revalidatePath(`/products/${productData.slug}`, "page");
    return { success: true, data };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteProduct(id: string, productMeta?: IProductDetail) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    if (productMeta) {
      revalidatePath(`/products/${productMeta.slug}`, "page");
      revalidatePath(`/collections/${productMeta.category}`);
    } else {
      revalidatePath("/products/[id]", "page");
      revalidatePath("/collections/attars");
      revalidatePath("/collections/perfumes");
    }
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function cloneProduct(productId: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        name,
        description,
        category,
        fragrance_family,
        description,
        top_notes,
        middle_notes,
        base_notes,
        additional_notes,
        product_images (*)
      `
      )
      .eq("id", productId);

    const productData = data?.[0];
    if (error) {
      console.error("Error cloning product:", error);
      throw new Error(
        `Failed to clone product: ${error?.message || "Unknown error"}`
      );
    }

    const productName = `${productData?.name} (Cloned)`;
    const productToCreate: Partial<IProduct> = {
      name: productName,
      slug: createProductSlug(productName),
      category: productData?.category || "perfume",
      fragrance_family: productData?.fragrance_family || "",
      description: productData?.description || "",
      top_notes: productData?.top_notes || "",
      middle_notes: productData?.middle_notes || "",
      base_notes: productData?.base_notes || "",
      additional_notes: productData?.additional_notes || "",
      is_featured: false,
    };

    const createCloneProductRes = await createProduct(productToCreate);

    if (createCloneProductRes.success) {
      const clonedProductId = createCloneProductRes.data?.id;
      const productImages: Partial<IProductImage>[] =
        productData?.product_images?.map((image) => ({
          product_id: clonedProductId!,
          image_id: image.image_id!,
          display_order: image.display_order!,
          is_primary: image.is_primary!,
        })) || [];
      await bulkUpsertProductImages(productImages);
    }

    return { success: true, data: createCloneProductRes.data };
  } catch (error) {
    console.error("Error in cloneProduct:", error);
    return {
      success: false,
      data: null,
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
    revalidatePath("/products/[id]", "page");
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
    revalidatePath("/products/[id]", "page");
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

  revalidatePath("/products/[id]", "page");
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

  revalidatePath("/products/[id]", "page");
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

    revalidatePath("/products/[id]", "page");
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

    revalidatePath("/products/[id]", "page");
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

    revalidatePath("/products/[id]", "page");
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
