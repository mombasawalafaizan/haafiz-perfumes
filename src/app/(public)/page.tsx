import { Metadata } from "next";
import { getFeaturedProducts } from "@/lib/actions/product";
import { HeroCarousel } from "@/components/feature/hero-carousel";
import FeaturedProductsSection from "@/components/feature/featured-products";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Haafiz Perfumes",
  description:
    "Discover our exquisite collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world.",
  keywords: [
    "perfumes",
    "attars",
    "surat",
    "halal",
    "fragrances",
    "indian perfumes",
    "indian attars",
    "haafiz perfumes",
    "perfume collection",
    "attar collection",
  ],
  openGraph: {
    title: "Haafiz Perfumes",
    description:
      "Discover our collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world.",
    type: "website",
  },
};

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <StructuredData type="organization" />
      <div>
        {/* Hero Section */}
        <HeroCarousel />

        {/* Featured Products */}
        <FeaturedProductsSection products={featuredProducts} />
      </div>
    </>
  );
}
