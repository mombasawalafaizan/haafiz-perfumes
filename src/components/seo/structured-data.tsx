import { IProductDetail } from "@/types/product";

interface StructuredDataProps {
  type: "organization" | "product" | "breadcrumb" | "website";
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://haafizperfumes.in";

  const getOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Haafiz Perfumes",
    alternateName: [
      "Hafiz Perfumes",
      "Haafiz Perfume",
      "Hafiz Perfume",
      "Hafeez Perfumes",
      "Haafeez Perfumes",
      "Hafeez Perfume",
      "Haafeez Perfume",
    ],
    description:
      "Luxury perfumes and authentic attars crafted with the finest ingredients from around the world. Premium fragrances for every occasion.",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/haafiz_perfumes_logo.png`,
      width: 512,
      height: 512,
      caption: "Haafiz Perfumes Logo",
    },
    image: {
      "@type": "ImageObject",
      url: `${baseUrl}/haafiz_perfumes_branding.png`,
      width: 1200,
      height: 630,
      caption: "Haafiz Perfumes Branding",
    },
    sameAs: [
      "https://www.instagram.com/haafiz_perfumes.in/",
      "https://www.facebook.com/haafiz.perfumes/",
      "https://wa.me/919601800822",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "haafizperfumescare@gmail.com",
      telephone: "+91-96018-00822",
      availableLanguage: ["English", "Hindi", "Gujarati"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Muglisara",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      postalCode: "395003",
      addressCountry: "IN",
    },
    foundingDate: "2020",
    founder: {
      "@type": "Saeed Akbar",
      name: "Haafiz Perfumes",
    },
    keywords:
      "perfumes, attars, luxury fragrances, haafiz perfumes, hafiz perfumes, hafeez perfumes, haafeez perfumes, indian perfumes, authentic attars, surat perfumes, halal perfumes",
    knowsAbout: [
      "Perfumes",
      "Attars",
      "Fragrances",
      "Luxury Scents",
      "Traditional Attars",
      "Premium Perfumes",
    ],
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

  const getWebsiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Haafiz Perfumes",
    alternateName: [
      "Hafiz Perfumes",
      "Haafiz Perfume",
      "Hafiz Perfume",
      "Hafeez Perfumes",
      "Haafeez Perfumes",
      "Hafeez Perfume",
      "Haafeez Perfume",
    ],
    url: baseUrl,
    description:
      "Luxury perfumes and authentic attars crafted with the finest ingredients from around the world. Premium fragrances for every occasion.",
    publisher: {
      "@type": "Organization",
      name: "Haafiz Perfumes",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/haafiz_perfumes_logo.png`,
        width: 512,
        height: 512,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/collections?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    keywords:
      "perfumes, attars, luxury fragrances, haafiz perfumes, hafiz perfumes, hafeez perfumes, haafeez perfumes, indian perfumes, authentic attars, surat perfumes, halal perfumes",
  });

  const getSchema = () => {
    switch (type) {
      case "organization":
        return getOrganizationSchema();
      case "website":
        return getWebsiteSchema();
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
