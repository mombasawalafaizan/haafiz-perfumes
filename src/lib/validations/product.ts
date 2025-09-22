import { z } from "zod";

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Name too long"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug too long"),
  category: z.enum(["perfume", "attar"] as const, {
    message: "Category is required",
  }),
  fragrance_family: z.string().optional(),
  description: z.string().optional(),
  top_notes: z.string().optional(),
  middle_notes: z.string().optional(),
  base_notes: z.string().optional(),
  additional_notes: z.string().optional(),
  is_featured: z.boolean().default(false),
});

// Product variant validation schema
export const productVariantSchema = z
  .object({
    id: z.string().optional(), // Database ID for existing variants
    product_quality: z.enum(["Standard", "Premium", "Luxury"] as const, {
      message: "Quality is required",
    }),
    price: z.number().min(1, "Price must be greater than 0"),
    mrp: z.number().min(1, "MRP must be greater than 0"),
    stock: z.number().int().min(0, "Stock must be non-negative"),
    volume: z.number().int().min(1, "Volume must be at least 1"),
    sku: z.string().min(1, "SKU is required").max(100, "SKU too long"),
  })
  .refine((data) => data.price <= data.mrp, {
    message: "Price must be less than or equal to MRP",
    path: ["price"], // This will show the error on the price field
  });

// Multiple variants schema
export const productVariantsSchema = z.object({
  variants: z
    .array(productVariantSchema)
    .min(1, "At least one variant is required")
    .refine(
      (variants) => {
        const qualities = variants.map((v) => v.product_quality);
        return new Set(qualities).size === qualities.length;
      },
      {
        message: "Each variant must have a unique quality level",
        path: ["variants"], // This will show the error at the variants array level
      }
    ),
});

// Image management schema
export const imageManagementSchema = z.object({
  images: z.array(z.string()).min(1, "At least one image is required"),
  primaryImageId: z.string().optional(),
});

// Form data types
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type ProductVariantsFormData = z.infer<typeof productVariantsSchema>;
export type ImageManagementFormData = z.infer<typeof imageManagementSchema>;
