import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck, RotateCcw, CreditCard, CheckCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/actions/product";
import { ProductImageCarousel } from "@/components/feature/product-image-carousel";
import { ProductPricingAndCart } from "@/components/feature/product-pricing-and-cart";
import { cn } from "@/lib/utils";
import { StructuredData } from "@/components/seo/structured-data";

export const revalidate = 21600; // Revalidate every 6 hours (21600 seconds)

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

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://haafizperfumes.in";
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const productImage =
    product.product_images?.[0]?.images?.backblaze_url ||
    product.product_variants?.[0]?.variant_images?.[0]?.images?.backblaze_url ||
    "/perfume_placeholder.jpg";

  return {
    title: product.name,
    description:
      product.description ||
      `Discover ${product.name} - Premium fragrance from Haafiz Perfumes. ${
        product.fragrance_family
          ? `Fragrance family: ${product.fragrance_family}.`
          : ""
      }`,
    keywords: [
      product.name,
      product.category === "perfume" ? "perfume" : "attar",
      "haafiz perfumes",
      "luxury fragrances",
      "premium fragrances",
      ...(Array.isArray(product.fragrance_family)
        ? product.fragrance_family
        : [product.fragrance_family].filter(Boolean)),
    ],
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description:
        product.description || `Premium fragrance from Haafiz Perfumes`,
      url: productUrl,
      siteName: "Haafiz Perfumes",
      images: [
        {
          url: productImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description:
        product.description || `Premium fragrance from Haafiz Perfumes`,
      images: [productImage],
    },
  };
}

const renderBadgeList = (text: string, showIcon: boolean = false) =>
  text?.trim() && (
    <div className="flex flex-wrap gap-2">
      {text.split(",").map((str, idx) => (
        <Badge
          variant="secondary"
          key={idx}
          className={cn({
            "font-bold": showIcon,
            "font-normal text-primary border-primary": !showIcon,
          })}
        >
          {showIcon && <CheckCircleIcon className="size-5" />} {str.trim()}
        </Badge>
      ))}
    </div>
  );

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <StructuredData type="product" data={product} />
      <section className="container mx-auto px-4 pb-16 pt-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <ProductImageCarousel product={product} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              {renderBadgeList(product.fragrance_family || "", true)}
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}
            </div>

            {/* Pricing Selection and Add to Cart */}
            <ProductPricingAndCart product={product} />

            {/* Features Banner */}
            <div className="bg-gradient-card p-6 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center relative">
                    <RotateCcw className="w-6 h-6 text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-0.5 bg-primary rotate-135 transform origin-center"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Non Returnable
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    COD Available
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Fast Delivery
                  </span>
                </div>
              </div>
            </div>

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
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-muted-foreground">
                        Top Notes:
                      </span>
                      {renderBadgeList(product.top_notes || "")}
                    </div>
                  )}
                  {product.middle_notes && (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-muted-foreground">
                        Middle Notes:
                      </span>
                      {renderBadgeList(product.middle_notes || "")}
                    </div>
                  )}
                  {product.base_notes && (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-muted-foreground">
                        Base Notes:
                      </span>
                      {renderBadgeList(product.base_notes || "")}
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
    </>
  );
}
