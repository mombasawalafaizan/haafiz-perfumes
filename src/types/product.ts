// Database Schema Types for Haafiz Perfumes

// Custom ENUM Types
export type TProductCategory = "perfume" | "attar";
export type TProductQuality = "Standard" | "Premium" | "Luxury";
export type TImageContext = "product" | "variant" | "both";

// Images Table
export interface IImage {
  id: string; // UUID
  filename: string;
  backblaze_url: string;
  backblaze_key: string;
  alt_text?: string; // TEXT, nullable
  file_size?: number; // INT4, nullable
  mime_type?: string; // TEXT, default 'image/jpeg'
  width?: number; // INT4, nullable
  height?: number; // INT4, nullable
  context?: TImageContext; // image_context, default 'both'
  created_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
  updated_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
}

// Products Table
export interface IProduct {
  id: string; // UUID
  name: string;
  slug: string;
  category: TProductCategory; // product_category
  fragrance_family?: string; // TEXT, nullable
  description?: string; // TEXT, nullable
  top_notes?: string; // TEXT, nullable
  middle_notes?: string; // TEXT, nullable
  base_notes?: string; // TEXT, nullable
  is_featured: boolean; // BOOLEAN, default FALSE
  additional_notes?: string; // TEXT, nullable
  created_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
  updated_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
}

// Product Variants Table
export interface IProductVariant {
  id: string; // UUID
  product_id: string; // UUID (FK to products.id)
  product_quality: TProductQuality; // product_quality
  price: number; // NUMERIC
  mrp: number; // NUMERIC
  stock: number; // INTEGER
  volume: number; // INT4, nullable
  sku: string;
  created_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
  updated_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
}

// Product Images Junction Table
export interface IProductImage {
  id: string; // UUID
  product_id: string; // UUID (FK to products.id)
  image_id: string; // UUID (FK to images.id)
  display_order?: number; // INTEGER, default 0
  is_primary?: boolean; // BOOLEAN, default FALSE
  created_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
}

// Variant Images Junction Table
export interface IVariantImage {
  id: string; // UUID
  variant_id: string; // UUID (FK to product_variants.id)
  image_id: string; // UUID (FK to images.id)
  display_order?: number; // INTEGER, default 0
  is_primary?: boolean; // BOOLEAN, default FALSE
  created_at?: string; // TIMESTAMP, default CURRENT_TIMESTAMP
}

// Extended interfaces for queries with relationships
export interface IProductWithImages extends IProduct {
  product_images?: IProductImageWithImage[];
  product_variants?: IProductVariantWithImages[];
}

export interface IProductImageWithImage extends IProductImage {
  images?: IImage;
}

export interface IProductVariantWithImages extends IProductVariant {
  variant_images?: IVariantImageWithImage[];
}

export interface IVariantImageWithImage extends IVariantImage {
  images?: IImage;
}

// Supabase query result types
export interface IProductDetail extends IProduct {
  product_variants: (IProductVariant & {
    variant_images: IProductImageQueryResult[];
  })[];
  product_images: IProductImageQueryResult[];
}

export interface IProductImageQueryResult {
  is_primary: boolean;
  display_order: number;
  images: {
    backblaze_url: string;
  };
}
