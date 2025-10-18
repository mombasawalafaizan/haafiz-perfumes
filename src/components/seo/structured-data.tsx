import { IProductDetail } from "@/types/product";

interface StructuredDataProps {
  type: "organization" | "product" | "breadcrumb";
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://haafizperfumes.in";

  const getOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Haafiz Perfumes",
    description:
      "Luxury perfumes and authentic attars crafted with the finest ingredients from around the world",
    url: baseUrl,
    logo: `${baseUrl}/haafiz_perfumes_logo.png`,
    image: `${baseUrl}/haafiz_perfumes_branding.png`,
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi", "Gujarati"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
  });

  const getProductSchema = (product: IProductDetail) => {
    const primaryImage =
      product.product_images?.[0]?.images?.backblaze_url ||
      product.product_variants?.[0]?.variant_images?.[0]?.images
        ?.backblaze_url ||
      "/perfume_placeholder.jpg";

    const price = product.product_variants?.[0]?.price || 0;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description:
        product.description ||
        `${product.name} - ${
          product.category === "perfume" ? "Premium Perfume" : "Authentic Attar"
        } by Haafiz Perfumes`,
      image: primaryImage,
      url: `${baseUrl}/products/${product.slug}`,
      brand: {
        "@type": "Brand",
        name: "Haafiz Perfumes",
      },
      category: product.category === "perfume" ? "Perfume" : "Attar",
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: "INR",
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        seller: {
          "@type": "Organization",
          name: "Haafiz Perfumes",
        },
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Fragrance Family",
          value: Array.isArray(product.fragrance_family)
            ? product.fragrance_family.join(", ")
            : product.fragrance_family,
        },
        {
          "@type": "PropertyValue",
          name: "Top Notes",
          value: product.top_notes,
        },
        {
          "@type": "PropertyValue",
          name: "Middle Notes",
          value: product.middle_notes,
        },
        {
          "@type": "PropertyValue",
          name: "Base Notes",
          value: product.base_notes,
        },
      ].filter((prop) => prop.value),
    };
  };

  const getBreadcrumbSchema = (
    breadcrumbs: Array<{ name: string; url: string }>
  ) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`,
    })),
  });

  const getSchema = () => {
    switch (type) {
      case "organization":
        return getOrganizationSchema();
      case "product":
        return data ? getProductSchema(data) : null;
      case "breadcrumb":
        return data ? getBreadcrumbSchema(data) : null;
      default:
        return null;
    }
  };

  const schema = getSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
