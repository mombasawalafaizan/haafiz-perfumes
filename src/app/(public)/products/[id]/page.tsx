import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck, RotateCcw, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/actions/product";
import { ProductImageCarousel } from "@/components/feature/product-image-carousel";
import { ProductPricingAndCart } from "@/components/feature/product-pricing-and-cart";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for doesn't exist.",
    };
  }

  return {
    title: `${product.name} | Haafiz Perfumes`,
    description:
      product.description ||
      `Discover ${product.name} - Premium fragrance from Haafiz Perfumes. ${
        product.fragrance_family
          ? `Fragrance family: ${product.fragrance_family}.`
          : ""
      }`,
    openGraph: {
      title: product.name,
      description:
        product.description || `Premium fragrance from Haafiz Perfumes`,
      images: (product.product_images?.[0]?.images as { backblaze_url: string })
        ?.backblaze_url
        ? [
            (product.product_images[0].images as { backblaze_url: string })
              ?.backblaze_url,
          ]
        : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.id);

  if (!product) {
    notFound();
  }

  // Get primary product image
  const primaryProductImage = (
    product.product_images?.find((img) => img.is_primary)?.images as {
      backblaze_url: string;
    }
  )?.backblaze_url;
  const fallbackImage = (
    product.product_images?.[0]?.images as { backblaze_url: string }
  )?.backblaze_url;
  const productImageUrl =
    primaryProductImage || fallbackImage || "/placeholder-product.jpg";

  // Get all product images for carousel
  const productImages = product.product_images
    ?.map((img) => (img.images as { backblaze_url: string })?.backblaze_url)
    .filter(Boolean) || [productImageUrl];

  // Get all variant images for carousel
  const variantImages =
    product.product_variants?.flatMap(
      (variant) =>
        variant.variant_images
          ?.map(
            (img) => (img.images as { backblaze_url: string })?.backblaze_url
          )
          .filter(Boolean) || []
    ) || [];

  // Combine all images, removing duplicates
  const allImages = [...new Set([...productImages, ...variantImages])];

  // Calculate discount percentage from the first variant for image carousel
  const firstVariant = product.product_variants?.[0];
  const discountPercentage =
    firstVariant && firstVariant.mrp > firstVariant.price
      ? Math.round(
          ((firstVariant.mrp - firstVariant.price) / firstVariant.mrp) * 100
        )
      : 0;

  const hasMultiplePricing =
    product.product_variants && product.product_variants.length > 1;

  return (
    <div>
      {/* Product Detail */}
      <section className="container mx-auto px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <ProductImageCarousel
              images={allImages}
              productName={product.name}
              discountPercentage={discountPercentage}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}
            </div>

            {/* Pricing Selection and Add to Cart */}
            <ProductPricingAndCart
              product={product}
              hasMultiplePricing={hasMultiplePricing || false}
            />

            {/* Features Banner */}
            <div className="bg-gradient-card p-6 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative">
                    <RotateCcw className="w-6 h-6 text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-0.5 bg-primary rotate-135 transform origin-center"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white">
                    Non Returnable
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    COD Available
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    Fast Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Fragrance Family */}
            {product.fragrance_family && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Fragrance Family
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{product.fragrance_family}</Badge>
                </div>
              </div>
            )}

            {/* Fragrance Notes Details */}
            {(product.top_notes ||
              product.middle_notes ||
              product.base_notes) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Fragrance Notes
                </h3>
                <div className="space-y-2">
                  {product.top_notes && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">
                        Top Notes:
                      </span>
                      <p className="text-foreground">{product.top_notes}</p>
                    </div>
                  )}
                  {product.middle_notes && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">
                        Middle Notes:
                      </span>
                      <p className="text-foreground">{product.middle_notes}</p>
                    </div>
                  )}
                  {product.base_notes && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">
                        Base Notes:
                      </span>
                      <p className="text-foreground">{product.base_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {product.additional_notes && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Additional Notes
                </h3>
                <p className="text-muted-foreground">
                  {product.additional_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
