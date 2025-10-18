import { MetadataRoute } from "next";
import { getProductsByCategory } from "@/lib/actions/product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://haafizperfumes.in";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/perfumes`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/attars`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];

  try {
    // Get all perfumes
    const perfumes = await getProductsByCategory("perfume", "name-asc");
    const perfumePages = perfumes.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(
        product.updated_at || product.created_at || new Date()
      ),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Get all attars
    const attars = await getProductsByCategory("attar", "name-asc");
    const attarPages = attars.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(
        product.updated_at || product.created_at || new Date()
      ),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    productPages = [...perfumePages, ...attarPages];
  } catch (error) {
    console.error("Error generating product sitemap:", error);
    // Continue with static pages even if products fail
  }

  return [...staticPages, ...productPages];
}
